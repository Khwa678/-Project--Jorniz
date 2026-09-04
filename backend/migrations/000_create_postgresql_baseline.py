"""Create the current Jorniz schema in an empty PostgreSQL database."""

import os
import re
import sqlite3
from pathlib import Path

import psycopg2
from dotenv import load_dotenv


BACKEND_DIR = Path(__file__).resolve().parents[1]
SOURCE_DB = BACKEND_DIR / "healthy_universe.db"


def postgres_ddl(table: str, ddl: str) -> str:
    ddl = re.sub(r"^CREATE TABLE\s+", "CREATE TABLE IF NOT EXISTS ", ddl, flags=re.I)
    ddl = re.sub(r"\(datetime\('now'\)\)", "CURRENT_TIMESTAMP", ddl, flags=re.I)
    ddl = re.sub(r"\bTEXT\s+DEFAULT\s+CURRENT_TIMESTAMP", "TIMESTAMP DEFAULT CURRENT_TIMESTAMP", ddl, flags=re.I)
    if table == "users":
        ddl = re.sub(r"\bis_verified\s+INTEGER\s+DEFAULT\s+0", "is_verified BOOLEAN DEFAULT FALSE", ddl, flags=re.I)
    return ddl


def main() -> None:
    load_dotenv(BACKEND_DIR / ".env")
    url = os.getenv("DATABASE_URL", "").strip()
    if not url.startswith(("postgresql://", "postgres://")):
        raise RuntimeError("DATABASE_URL must be a PostgreSQL connection string")

    with sqlite3.connect(SOURCE_DB) as source:
        rows = source.execute(
            "SELECT name, sql FROM sqlite_master "
            "WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY rowid"
        ).fetchall()

    pending = {name: ddl for name, ddl in rows if ddl}
    created = set()
    with psycopg2.connect(url) as target:
        with target.cursor() as cursor:
            while pending:
                ready = [
                    name for name, ddl in pending.items()
                    if set(re.findall(r"REFERENCES\s+([A-Za-z_]\w*)", ddl, re.I)) - {name} <= created
                ]
                if not ready:
                    raise RuntimeError(f"Unresolved table dependencies: {', '.join(pending)}")
                for name in ready:
                    cursor.execute(postgres_ddl(name, pending.pop(name)))
                    created.add(name)

            cursor.execute(
                "CREATE TABLE IF NOT EXISTS schema_migrations "
                "(version TEXT PRIMARY KEY, applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)"
            )
            cursor.execute(
                "INSERT INTO schema_migrations (version) VALUES (%s) ON CONFLICT DO NOTHING",
                ("000_create_postgresql_baseline",),
            )

    print(f"Created {len(created)} Jorniz tables in PostgreSQL")


if __name__ == "__main__":
    main()
