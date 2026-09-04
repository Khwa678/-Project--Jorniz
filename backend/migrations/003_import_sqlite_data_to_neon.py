"""Merge valid local SQLite rows into the configured Neon database."""

import os
import sqlite3
from pathlib import Path

import psycopg2
from dotenv import load_dotenv
from psycopg2 import sql


BACKEND_DIR = Path(__file__).resolve().parents[1]


def main() -> None:
    load_dotenv(BACKEND_DIR / ".env")
    url = os.getenv("DATABASE_URL", "").strip()
    if not url.startswith(("postgresql://", "postgres://")):
        raise RuntimeError("DATABASE_URL must be PostgreSQL")

    source = sqlite3.connect(BACKEND_DIR / "healthy_universe.db")
    source.row_factory = sqlite3.Row
    tables = [r[0] for r in source.execute(
        "SELECT name FROM sqlite_master WHERE type='table' "
        "AND name NOT LIKE 'sqlite_%' ORDER BY rowid"
    )]
    totals = {"imported": 0, "duplicate": 0, "orphan": 0}

    with psycopg2.connect(url) as target, target.cursor() as cursor:
        for table in tables:
            cursor.execute(
                "SELECT column_name, data_type FROM information_schema.columns "
                "WHERE table_schema='public' AND table_name=%s ORDER BY ordinal_position",
                (table,),
            )
            target_columns = dict(cursor.fetchall())
            columns = [r[1] for r in source.execute(f'PRAGMA table_info("{table}")') if r[1] in target_columns]
            if not columns:
                continue

            statement = sql.SQL("INSERT INTO {} ({}) VALUES ({}) ON CONFLICT DO NOTHING").format(
                sql.Identifier(table),
                sql.SQL(", ").join(map(sql.Identifier, columns)),
                sql.SQL(", ").join(sql.Placeholder() for _ in columns),
            )
            for row in source.execute(f'SELECT * FROM "{table}"'):
                values = [bool(row[c]) if target_columns[c] == "boolean" and row[c] is not None else row[c] for c in columns]
                cursor.execute("SAVEPOINT import_row")
                try:
                    cursor.execute(statement, values)
                    totals["imported" if cursor.rowcount else "duplicate"] += 1
                    cursor.execute("RELEASE SAVEPOINT import_row")
                except psycopg2.IntegrityError:
                    cursor.execute("ROLLBACK TO SAVEPOINT import_row")
                    cursor.execute("RELEASE SAVEPOINT import_row")
                    totals["orphan"] += 1

    source.close()
    print("SQLite to Neon:", ", ".join(f"{key}={value}" for key, value in totals.items()))


if __name__ == "__main__":
    main()
