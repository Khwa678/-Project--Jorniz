"""Upgrade posts with canonical creator, content metadata, trust, and UTC time."""

import argparse
import os
import sqlite3
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
            cursor.execute("""SELECT column_name,data_type FROM information_schema.columns
                              WHERE table_schema=current_schema() AND table_name='posts'""")
            columns = {row["column_name"]: row["data_type"] for row in cursor.fetchall()}
            if "creator_user_id" not in columns and "user_id" in columns:
                cursor.execute("ALTER TABLE posts RENAME COLUMN user_id TO creator_user_id")
            cursor.execute("ALTER TABLE posts ADD COLUMN IF NOT EXISTS title TEXT NOT NULL DEFAULT ''")
            cursor.execute("ALTER TABLE posts ADD COLUMN IF NOT EXISTS hashtags TEXT NOT NULL DEFAULT ''")
            cursor.execute("""ALTER TABLE posts ADD COLUMN IF NOT EXISTS trust_status TEXT NOT NULL
                              DEFAULT 'unreviewed' CHECK (trust_status IN ('unreviewed','trusted','flagged','rejected'))""")
            if columns.get("created_at") == "timestamp without time zone":
                cursor.execute("""ALTER TABLE posts ALTER COLUMN created_at TYPE TIMESTAMPTZ
                                  USING created_at AT TIME ZONE 'UTC'""")
            cursor.execute("ALTER TABLE posts ALTER COLUMN created_at SET DEFAULT CURRENT_TIMESTAMP")
            cursor.execute("ALTER TABLE posts ALTER COLUMN created_at SET NOT NULL")
        else:
            cursor.execute("PRAGMA table_info(posts)")
            columns = {row["name"] for row in cursor.fetchall()}
            if "creator_user_id" not in columns and "user_id" in columns:
                cursor.execute("ALTER TABLE posts RENAME COLUMN user_id TO creator_user_id")
            if "title" not in columns:
                cursor.execute("ALTER TABLE posts ADD COLUMN title TEXT NOT NULL DEFAULT ''")
            if "hashtags" not in columns:
                cursor.execute("ALTER TABLE posts ADD COLUMN hashtags TEXT NOT NULL DEFAULT ''")
            if "trust_status" not in columns:
                cursor.execute("""ALTER TABLE posts ADD COLUMN trust_status TEXT NOT NULL DEFAULT 'unreviewed'
                                  CHECK (trust_status IN ('unreviewed','trusted','flagged','rejected'))""")

        cursor.execute("""CREATE INDEX IF NOT EXISTS ix_posts_creator_created
                          ON posts(creator_user_id,created_at DESC)""")
        connection.commit()
        print(f"Post content model migration complete for {dialect}.")
    except Exception:
        connection.rollback()
        raise
    finally:
        connection.close()


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--target", choices=("local", "configured"), default="local")
    migrate(parser.parse_args().target)
