"""Make the HU Coin ledger canonical and users.hu_coins its projection."""

import argparse
import os
from pathlib import Path
import re
import sqlite3
import uuid

from dotenv import load_dotenv


BACKEND_DIR = Path(__file__).resolve().parents[1]


def connect(target):
    load_dotenv(BACKEND_DIR / ".env")
    if target == "local":
        conn = sqlite3.connect(BACKEND_DIR / "healthy_universe.db")
        conn.row_factory = sqlite3.Row
        return conn, "sqlite"
    url = os.getenv("DATABASE_URL", "").strip()
    if not url.startswith(("postgresql://", "postgres://")):
        raise RuntimeError("DATABASE_URL must be PostgreSQL")
    import psycopg2
    import psycopg2.extras
    return psycopg2.connect(url, cursor_factory=psycopg2.extras.RealDictCursor), "postgres"


def execute(conn, dialect, sql, params=()):
    cursor = conn.cursor()
    statement = sql.replace("%s", "?") if dialect == "sqlite" else sql
    if params:
        cursor.execute(statement, params)
    else:
        cursor.execute(statement)
    return cursor


def add_columns(conn, dialect):
    if dialect == "postgres":
        execute(conn, dialect, "ALTER TABLE wallet_ledger ADD COLUMN IF NOT EXISTS action TEXT")
        execute(conn, dialect, "ALTER TABLE wallet_ledger ADD COLUMN IF NOT EXISTS reversal_of_id TEXT")
        return
    columns = {row[1] for row in execute(conn, dialect, "PRAGMA table_info(wallet_ledger)").fetchall()}
    if "action" not in columns:
        execute(conn, dialect, "ALTER TABLE wallet_ledger ADD COLUMN action TEXT")
    if "reversal_of_id" not in columns:
        execute(conn, dialect, "ALTER TABLE wallet_ledger ADD COLUMN reversal_of_id TEXT")


def set_sqlite_default_zero(conn):
    row = conn.execute("SELECT sql FROM sqlite_master WHERE type='table' AND name='users'").fetchone()
    ddl = row[0] if row else ""
    updated = re.sub(
        r"(\bhu_coins\b[^,\n]*\bDEFAULT\s+)500(?:\.0+)?\b",
        r"\g<1>0",
        ddl,
        count=1,
        flags=re.IGNORECASE,
    )
    if not ddl or updated == ddl:
        return
    saved = conn.execute(
        "SELECT type,name,sql FROM sqlite_master WHERE tbl_name='users' AND sql IS NOT NULL AND type IN ('index','trigger')"
    ).fetchall()
    columns = [row[1] for row in conn.execute("PRAGMA table_info(users)").fetchall()]
    names = ",".join(f'"{name}"' for name in columns)
    conn.execute("PRAGMA legacy_alter_table=ON")
    conn.execute("ALTER TABLE users RENAME TO users__wallet005_old")
    conn.execute(updated)
    conn.execute(f"INSERT INTO users ({names}) SELECT {names} FROM users__wallet005_old")
    conn.execute("DROP TABLE users__wallet005_old")
    for _, _, sql in saved:
        conn.execute(sql)
    conn.execute("PRAGMA legacy_alter_table=OFF")


def add_journey_constraints(conn, dialect):
    if dialect == "postgres":
        for sql in (
            "ALTER TABLE orders ADD COLUMN IF NOT EXISTS idempotency_key TEXT",
            "ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'paid'",
            "ALTER TABLE orders ADD COLUMN IF NOT EXISTS gateway_refund_status TEXT DEFAULT 'not_required'",
            "ALTER TABLE connections ADD COLUMN IF NOT EXISTS pair_key TEXT",
        ):
            execute(conn, dialect, sql)
    else:
        for table, column, definition in (
            ("orders", "idempotency_key", "TEXT"),
            ("orders", "payment_status", "TEXT DEFAULT 'paid'"),
            ("orders", "gateway_refund_status", "TEXT DEFAULT 'not_required'"),
            ("connections", "pair_key", "TEXT"),
        ):
            columns = {row[1] for row in execute(conn, dialect, f"PRAGMA table_info({table})").fetchall()}
            if column not in columns:
                execute(conn, dialect, f"ALTER TABLE {table} ADD COLUMN {column} {definition}")

    duplicates = execute(conn, dialect, """SELECT user_id,product_id,MIN(id) AS keeper,SUM(quantity) AS quantity
        FROM cart GROUP BY user_id,product_id HAVING COUNT(*)>1""").fetchall()
    for raw in duplicates:
        row = dict(raw)
        execute(conn, dialect, "UPDATE cart SET quantity=%s WHERE id=%s", (row["quantity"], row["keeper"]))
        execute(conn, dialect, "DELETE FROM cart WHERE user_id=%s AND product_id=%s AND id<>%s",
                (row["user_id"], row["product_id"], row["keeper"]))
    execute(conn, dialect, "CREATE UNIQUE INDEX IF NOT EXISTS uq_cart_user_product ON cart(user_id,product_id)")

    connections = execute(conn, dialect, "SELECT id,requester_id,receiver_id,status FROM connections ORDER BY created_at").fetchall()
    kept = {}
    for raw in connections:
        row = dict(raw)
        pair_key = ":".join(sorted((str(row["requester_id"]), str(row["receiver_id"]))))
        previous = kept.get(pair_key)
        if previous:
            if str(row.get("status") or "").lower() == "accepted":
                execute(conn, dialect, "UPDATE connections SET status='Accepted' WHERE id=%s", (previous,))
            execute(conn, dialect, "DELETE FROM connections WHERE id=%s", (row["id"],))
        else:
            kept[pair_key] = row["id"]
            execute(conn, dialect, "UPDATE connections SET pair_key=%s WHERE id=%s", (pair_key, row["id"]))
    execute(conn, dialect, "CREATE UNIQUE INDEX IF NOT EXISTS uq_connections_pair ON connections(pair_key)")
    execute(conn, dialect, "CREATE UNIQUE INDEX IF NOT EXISTS uq_orders_user_idempotency ON orders(user_id,idempotency_key) WHERE idempotency_key IS NOT NULL")


def normalize_ledger(conn, dialect):
    execute(
        conn, dialect,
        """UPDATE wallet_ledger SET value_type='reward_coin'
           WHERE LOWER(REPLACE(value_type,' ','_')) IN ('hu_coin','hu_coins','reward_coin')""",
    )
    execute(
        conn, dialect,
        "UPDATE wallet_ledger SET status='available' WHERE status IS NULL OR LOWER(status)='settled'",
    )
    execute(
        conn, dialect,
        """UPDATE wallet_ledger SET action=CASE
             WHEN UPPER(COALESCE(source_type,'')) LIKE '%REFUND%' THEN 'refund'
             WHEN UPPER(COALESCE(source_type,'')) LIKE '%REVERS%'
               OR UPPER(COALESCE(source_type,'')) LIKE '%DELETE%' THEN 'reverse'
             WHEN UPPER(credit_debit)='CREDIT' THEN 'credit' ELSE 'debit' END
           WHERE action IS NULL OR action=''""",
    )
    execute(conn, dialect, "CREATE UNIQUE INDEX IF NOT EXISTS uq_wallet_ledger_idempotency ON wallet_ledger(idempotency_key)")
    execute(
        conn, dialect,
        """CREATE UNIQUE INDEX IF NOT EXISTS uq_wallet_ledger_counter
           ON wallet_ledger(reversal_of_id,action) WHERE reversal_of_id IS NOT NULL""",
    )
    execute(
        conn, dialect,
        "CREATE INDEX IF NOT EXISTS ix_wallet_ledger_user_value_created ON wallet_ledger(user_id,value_type,created_at)",
    )


def backfill(conn, dialect):
    users = execute(conn, dialect, "SELECT id,COALESCE(hu_coins,0) AS hu_coins FROM users").fetchall()
    for raw in users:
        user = dict(raw)
        ledger_row = execute(
            conn, dialect,
            """SELECT COALESCE(SUM(CASE WHEN UPPER(credit_debit)='CREDIT' THEN amount ELSE -amount END),0) AS balance
               FROM wallet_ledger WHERE user_id=%s AND value_type='reward_coin'
               AND LOWER(status) IN ('available','settled','spent','reversed')""",
            (user["id"],),
        ).fetchone()
        ledger_balance = float(dict(ledger_row)["balance"] or 0)
        projection = float(user["hu_coins"] or 0)
        difference = round(projection - ledger_balance, 6)
        opening_key = f"canonical_opening_balance:{user['id']}"
        opening = execute(
            conn, dialect,
            "SELECT id FROM wallet_ledger WHERE idempotency_key=%s",
            (opening_key,),
        ).fetchone()
        if difference and not opening:
            direction = "CREDIT" if difference > 0 else "DEBIT"
            execute(
                conn, dialect,
                """INSERT INTO wallet_ledger
                   (id,user_id,credit_debit,value_type,amount,currency,source_type,source_id,
                    idempotency_key,balance_before,balance_after,status,action,reversal_of_id)
                   VALUES (%s,%s,%s,'reward_coin',%s,'HU_COIN','MIGRATION_OPENING_BALANCE',%s,
                           %s,%s,%s,'available',%s,NULL)""",
                (
                    "led_" + uuid.uuid4().hex, user["id"], direction, abs(difference),
                    user["id"], opening_key, ledger_balance, projection,
                    "credit" if difference > 0 else "debit",
                ),
            )
            ledger_balance = projection
        execute(conn, dialect, "UPDATE users SET hu_coins=%s WHERE id=%s", (ledger_balance, user["id"]))


def migrate(target):
    conn, dialect = connect(target)
    try:
        if dialect == "sqlite":
            conn.execute("PRAGMA foreign_keys=OFF")
        add_columns(conn, dialect)
        normalize_ledger(conn, dialect)
        backfill(conn, dialect)
        add_journey_constraints(conn, dialect)
        if dialect == "postgres":
            execute(conn, dialect, "ALTER TABLE users ALTER COLUMN hu_coins SET DEFAULT 0")
        else:
            set_sqlite_default_zero(conn)
        conn.commit()
        print(f"005 canonical HU Coin ledger migrated on {target}")
    except Exception:
        conn.rollback()
        raise
    finally:
        if dialect == "sqlite":
            conn.execute("PRAGMA foreign_keys=ON")
        conn.close()


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--target", choices=("local", "configured"), required=True)
    migrate(parser.parse_args().target)
