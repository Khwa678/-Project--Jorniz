"""Consolidate legacy post interactions into post_actions."""

import argparse
import os
import sqlite3
from pathlib import Path

from dotenv import load_dotenv


BACKEND_DIR = Path(__file__).resolve().parents[1]
LEGACY_TABLES = ("post_likes", "post_comments", "post_reactions", "post_saves", "post_views")


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


def copy(cursor, dialect, table, sql):
    if table_exists(cursor, dialect, table):
        cursor.execute(sql)


def migrate(target):
    connection, dialect = connect(target)
    cursor = connection.cursor()
    try:
        cursor.execute("""CREATE TABLE IF NOT EXISTS post_actions (
            id TEXT PRIMARY KEY,
            post_id TEXT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
            user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            action_type TEXT NOT NULL CHECK (action_type IN ('reaction','comment','share','view','save')),
            action_value TEXT,
            request_id TEXT UNIQUE,
            created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
        )""")
        cursor.execute("""CREATE UNIQUE INDEX IF NOT EXISTS uq_post_action_state
            ON post_actions(post_id,user_id,action_type)
            WHERE action_type IN ('reaction','save','view')""")
        cursor.execute("""CREATE INDEX IF NOT EXISTS ix_post_actions_post_created
            ON post_actions(post_id,created_at DESC)""")

        copy(cursor, dialect, "post_reactions", """INSERT INTO post_actions
            (id,post_id,user_id,action_type,action_value,request_id,created_at,updated_at)
            SELECT 'reaction:'||id,post_id,user_id,'reaction',COALESCE(reaction_type,'like'),
                   'migration:reaction:'||id,COALESCE(created_at,CURRENT_TIMESTAMP),COALESCE(created_at,CURRENT_TIMESTAMP)
            FROM post_reactions WHERE 1=1 ON CONFLICT DO NOTHING""")
        copy(cursor, dialect, "post_likes", """INSERT INTO post_actions
            (id,post_id,user_id,action_type,action_value,request_id,created_at,updated_at)
            SELECT 'like:'||id,post_id,user_id,'reaction','like','migration:like:'||id,
                   COALESCE(created_at,CURRENT_TIMESTAMP),COALESCE(created_at,CURRENT_TIMESTAMP)
            FROM post_likes WHERE 1=1 ON CONFLICT DO NOTHING""")
        copy(cursor, dialect, "post_comments", """INSERT INTO post_actions
            (id,post_id,user_id,action_type,action_value,request_id,created_at,updated_at)
            SELECT 'comment:'||id,post_id,user_id,'comment',content,'migration:comment:'||id,
                   COALESCE(created_at,CURRENT_TIMESTAMP),COALESCE(created_at,CURRENT_TIMESTAMP)
            FROM post_comments WHERE 1=1 ON CONFLICT DO NOTHING""")
        copy(cursor, dialect, "post_saves", """INSERT INTO post_actions
            (id,post_id,user_id,action_type,request_id,created_at,updated_at)
            SELECT 'save:'||post_id||':'||user_id,post_id,user_id,'save','migration:save:'||post_id||':'||user_id,
                   COALESCE(created_at,CURRENT_TIMESTAMP),COALESCE(created_at,CURRENT_TIMESTAMP)
            FROM post_saves WHERE 1=1 ON CONFLICT DO NOTHING""")
        copy(cursor, dialect, "post_views", """INSERT INTO post_actions
            (id,post_id,user_id,action_type,request_id,created_at,updated_at)
            SELECT 'view:'||id,post_id,user_id,'view','migration:view:'||id,
                   COALESCE(created_at,CURRENT_TIMESTAMP),COALESCE(created_at,CURRENT_TIMESTAMP)
            FROM post_views WHERE 1=1 ON CONFLICT DO NOTHING""")

        cursor.execute("""UPDATE posts SET likes=(SELECT COUNT(*) FROM post_actions
                          WHERE post_actions.post_id=posts.id AND action_type='reaction')""")
        cursor.execute("""UPDATE posts SET views=(SELECT COUNT(*) FROM post_actions
                          WHERE post_actions.post_id=posts.id AND action_type='view')""")
        for table in LEGACY_TABLES:
            cursor.execute(f"DROP TABLE IF EXISTS {table}")

        connection.commit()
        print(f"007 post actions consolidated on {target}; legacy tables removed")
    except Exception:
        connection.rollback()
        raise
    finally:
        connection.close()


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--target", choices=("local", "configured"), default="local")
    migrate(parser.parse_args().target)
