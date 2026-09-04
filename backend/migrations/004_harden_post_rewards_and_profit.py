"""Add social-event uniqueness and reconcile wallet opening balances."""

import argparse
import os
import sqlite3
import uuid
from pathlib import Path

from dotenv import load_dotenv


BACKEND_DIR = Path(__file__).resolve().parents[1]


def connect(target):
    load_dotenv(BACKEND_DIR / ".env")
    if target == "local":
        connection = sqlite3.connect(BACKEND_DIR / "healthy_universe.db")
        connection.row_factory = sqlite3.Row
        return connection, "sqlite"
    url = os.getenv("DATABASE_URL", "").strip()
    if not url.startswith(("postgresql://", "postgres://")):
        raise RuntimeError("DATABASE_URL must be PostgreSQL")
    import psycopg2
    import psycopg2.extras
    return psycopg2.connect(url, cursor_factory=psycopg2.extras.RealDictCursor), "postgres"


def migrate(target):
    connection, dialect = connect(target)
    cursor = connection.cursor()
    try:
        if dialect == "postgres":
            cursor.execute("ALTER TABLE posts ADD COLUMN IF NOT EXISTS shares INTEGER DEFAULT 0")
            cursor.execute("""CREATE TABLE IF NOT EXISTS post_views (
                id TEXT PRIMARY KEY, post_id TEXT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
                user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(post_id,user_id))""")
        else:
            try:
                cursor.execute("ALTER TABLE posts ADD COLUMN shares INTEGER DEFAULT 0")
            except sqlite3.OperationalError as exc:
                if "duplicate column" not in str(exc).lower():
                    raise
            cursor.execute("""CREATE TABLE IF NOT EXISTS post_views (
                id TEXT PRIMARY KEY, post_id TEXT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
                user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(post_id,user_id))""")

        unique_indexes = {
            "uq_post_likes_user": ("post_likes", ("post_id", "user_id")),
            "uq_post_reactions_user": ("post_reactions", ("post_id", "user_id")),
            "uq_creator_analytics_post": ("creator_analytics", ("user_id", "post_id")),
            "uq_revenue_distribution_period": ("revenue_distribution_logs", ("period_date",)),
            "uq_skill_endorsement": ("skill_endorsements", ("endorser_id", "recipient_id", "skill_name")),
            "uq_job_application": ("job_applications", ("job_id", "candidate_id")),
            "uq_event_attendee": ("event_attendees", ("event_id", "user_id")),
        }
        for index, (table, columns) in unique_indexes.items():
            match = " AND ".join(f"a.{column}=b.{column}" for column in columns)
            if dialect == "postgres":
                cursor.execute(f"DELETE FROM {table} a USING {table} b WHERE a.ctid<b.ctid AND {match}")
            else:
                cursor.execute(f"DELETE FROM {table} WHERE rowid NOT IN (SELECT MAX(rowid) FROM {table} GROUP BY {','.join(columns)})")
            cursor.execute(f"CREATE UNIQUE INDEX IF NOT EXISTS {index} ON {table} ({','.join(columns)})")

        if dialect == "postgres":
            cursor.execute("CREATE UNIQUE INDEX IF NOT EXISTS uq_ad_impression_user ON ad_impressions(campaign_id,user_id) WHERE user_id IS NOT NULL")
            cursor.execute("CREATE UNIQUE INDEX IF NOT EXISTS uq_ad_click_user ON ad_clicks(campaign_id,user_id) WHERE user_id IS NOT NULL")
        else:
            cursor.execute("CREATE UNIQUE INDEX IF NOT EXISTS uq_ad_impression_user ON ad_impressions(campaign_id,user_id) WHERE user_id IS NOT NULL")
            cursor.execute("CREATE UNIQUE INDEX IF NOT EXISTS uq_ad_click_user ON ad_clicks(campaign_id,user_id) WHERE user_id IS NOT NULL")
        cursor.execute("CREATE INDEX IF NOT EXISTS ix_wallet_ledger_user_created ON wallet_ledger(user_id,created_at)")

        cursor.execute("SELECT id,COALESCE(hu_coins,0) AS hu_coins FROM users")
        users = cursor.fetchall()
        for raw in users:
            user = dict(raw)
            placeholder = "?" if dialect == "sqlite" else "%s"
            cursor.execute(
                f"SELECT COALESCE(SUM(CASE WHEN credit_debit='CREDIT' THEN amount ELSE -amount END),0) AS balance FROM wallet_ledger WHERE user_id={placeholder} AND LOWER(status)='settled'",
                (user["id"],),
            )
            balance = float(dict(cursor.fetchone())["balance"] or 0)
            projection = float(user["hu_coins"] or 0)
            difference = round(projection - balance, 6)
            if not difference:
                continue
            values = (
                "led_" + uuid.uuid4().hex,
                user["id"],
                "CREDIT" if difference > 0 else "DEBIT",
                "HU Coins",
                abs(difference),
                "MIGRATION_OPENING_BALANCE",
                user["id"],
                f"opening_balance:{user['id']}",
                balance,
                projection,
                "Settled",
            )
            marks = ",".join([placeholder] * len(values))
            conflict = "ON CONFLICT(idempotency_key) DO NOTHING"
            cursor.execute(
                f"""INSERT INTO wallet_ledger
                    (id,user_id,credit_debit,value_type,amount,source_type,source_id,idempotency_key,balance_before,balance_after,status)
                    VALUES ({marks}) {conflict}""",
                values,
            )
        connection.commit()
        print(f"004 hardened post rewards and profit tables on {target}")
    except Exception:
        connection.rollback()
        raise
    finally:
        connection.close()


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--target", choices=("local", "configured"), required=True)
    migrate(parser.parse_args().target)

