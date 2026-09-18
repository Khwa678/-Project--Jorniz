"""Store notification read state as a PostgreSQL Boolean."""

import argparse
import os
import sqlite3
from pathlib import Path

from dotenv import load_dotenv


BACKEND_DIR = Path(__file__).resolve().parents[1]


def connect(target):
    load_dotenv(BACKEND_DIR / ".env")
    if target == "local":
        return sqlite3.connect(BACKEND_DIR / "healthy_universe.db"), "sqlite"
    url = os.getenv("DATABASE_URL", "").strip()
    if not url.startswith(("postgresql://", "postgres://")):
        raise RuntimeError("DATABASE_URL must be PostgreSQL")
    import psycopg2
    return psycopg2.connect(url), "postgres"


def table_exists(cursor, dialect, table):
    if dialect == "sqlite":
        cursor.execute("SELECT 1 FROM sqlite_master WHERE type='table' AND name=?", (table,))
    else:
        cursor.execute("SELECT to_regclass(%s)", (table,))
    row = cursor.fetchone()
    return bool(row and row[0])


def postgres_column_exists(cursor, table, column):
    cursor.execute(
        """SELECT 1 FROM information_schema.columns
           WHERE table_schema=current_schema() AND table_name=%s AND column_name=%s""",
        (table, column),
    )
    return cursor.fetchone() is not None


def migrate(target):
    connection, dialect = connect(target)
    cursor = connection.cursor()
    try:
        if not table_exists(cursor, dialect, "notifications"):
            raise RuntimeError("notifications table does not exist")

        if dialect == "sqlite":
            cursor.execute(
                """UPDATE notifications SET is_read=CASE
                   WHEN LOWER(CAST(is_read AS TEXT)) IN ('1','true','t','yes','y') THEN 1
                   ELSE 0 END"""
            )
        elif not postgres_column_exists(cursor, "notifications", "is_read"):
            cursor.execute(
                "ALTER TABLE notifications ADD COLUMN is_read BOOLEAN NOT NULL DEFAULT FALSE"
            )
        else:
            cursor.execute("ALTER TABLE notifications ALTER COLUMN is_read DROP DEFAULT")
            cursor.execute(
                """ALTER TABLE notifications ALTER COLUMN is_read TYPE BOOLEAN USING (
                   CASE
                     WHEN is_read IS NULL THEN FALSE
                     WHEN LOWER(is_read::text) IN ('1','true','t','yes','y') THEN TRUE
                     ELSE FALSE
                   END
                )"""
            )
            cursor.execute("ALTER TABLE notifications ALTER COLUMN is_read SET DEFAULT FALSE")
            cursor.execute("ALTER TABLE notifications ALTER COLUMN is_read SET NOT NULL")

        connection.commit()
        print(f"008 notification read state migrated to Boolean on {target}")
    except Exception:
        connection.rollback()
        raise
    finally:
        connection.close()


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--target", choices=("local", "configured"), default="local")
    migrate(parser.parse_args().target)
