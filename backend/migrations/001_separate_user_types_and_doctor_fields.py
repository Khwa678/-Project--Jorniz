"""Expand users/doctors and backfill legacy account and doctor data.

This migration is additive and supports local SQLite plus configured PostgreSQL.
It intentionally leaves legacy columns in place for the current API.
"""

from __future__ import annotations

import argparse
import os
import sqlite3
import uuid
from pathlib import Path

from dotenv import load_dotenv


BACKEND_DIR = Path(__file__).resolve().parents[1]
LOCAL_DATABASE = BACKEND_DIR / "healthy_universe.db"


def connect(target: str):
    if target == "local":
        connection = sqlite3.connect(LOCAL_DATABASE)
        connection.row_factory = sqlite3.Row
        return connection, "sqlite"

    try:
        import psycopg2
        from psycopg2.extras import RealDictCursor
    except ImportError as exc:
        raise RuntimeError("Install backend requirements before migration") from exc

    load_dotenv(BACKEND_DIR / ".env")
    database_url = os.getenv("DATABASE_URL", "").strip()
    if not database_url.startswith(("postgresql://", "postgres://")):
        raise RuntimeError("DATABASE_URL is not a PostgreSQL connection string")
    return psycopg2.connect(database_url, cursor_factory=RealDictCursor), "postgres"


def execute(connection, dialect: str, sql: str, params=()):
    cursor = connection.cursor()
    cursor.execute(sql.replace("%s", "?") if dialect == "sqlite" else sql, params)
    return cursor


def table_exists(connection, dialect: str, table: str) -> bool:
    if dialect == "sqlite":
        cursor = execute(
            connection,
            dialect,
            "SELECT 1 FROM sqlite_master WHERE type='table' AND name=%s",
            (table,),
        )
    else:
        cursor = execute(
            connection,
            dialect,
            "SELECT 1 FROM information_schema.tables "
            "WHERE table_schema='public' AND table_name=%s",
            (table,),
        )
    try:
        return cursor.fetchone() is not None
    finally:
        cursor.close()


def column_exists(connection, dialect: str, table: str, column: str) -> bool:
    if dialect == "sqlite":
        cursor = connection.execute(f'PRAGMA table_info("{table}")')
        try:
            return any(row[1] == column for row in cursor.fetchall())
        finally:
            cursor.close()

    cursor = execute(
        connection,
        dialect,
        "SELECT 1 FROM information_schema.columns "
        "WHERE table_schema='public' AND table_name=%s AND column_name=%s",
        (table, column),
    )
    try:
        return cursor.fetchone() is not None
    finally:
        cursor.close()


def ensure_column(connection, dialect: str, table: str, column: str, sql_type: str) -> None:
    if column_exists(connection, dialect, table, column):
        return
    cursor = execute(
        connection,
        dialect,
        f'ALTER TABLE "{table}" ADD COLUMN "{column}" {sql_type}',
    )
    cursor.close()


def fetch_all(connection, dialect: str, sql: str, params=()) -> list[dict]:
    cursor = execute(connection, dialect, sql, params)
    try:
        return [dict(row) for row in cursor.fetchall()]
    finally:
        cursor.close()


def backfill_user_types(connection, dialect: str) -> None:
    cursor = execute(
        connection,
        dialect,
        """
        UPDATE users
        SET user_type = CASE LOWER(TRIM(COALESCE(role, '')))
            WHEN 'patient' THEN 'general_user'
            WHEN 'general user' THEN 'general_user'
            WHEN 'general_user' THEN 'general_user'
            WHEN 'creator' THEN 'creator'
            WHEN 'job seeker' THEN 'job_seeker'
            WHEN 'job_seeker' THEN 'job_seeker'
            WHEN 'recruiter / employer' THEN 'recruiter'
            WHEN 'recruiter' THEN 'recruiter'
            WHEN 'doctor' THEN 'doctor'
            WHEN 'seller / brand' THEN 'seller'
            WHEN 'seller' THEN 'seller'
            WHEN 'pharmacy partner' THEN 'pharmacy_partner'
            WHEN 'pharmacy_partner' THEN 'pharmacy_partner'
            WHEN 'diagnostic partner' THEN 'diagnostic_partner'
            WHEN 'diagnostic_partner' THEN 'diagnostic_partner'
            WHEN 'advertiser' THEN 'advertiser'
            ELSE COALESCE(NULLIF(user_type, ''), 'general_user')
        END,
        system_role = CASE LOWER(TRIM(COALESCE(role, '')))
            WHEN 'moderator' THEN 'moderator'
            WHEN 'admin' THEN 'admin'
            WHEN 'finance admin' THEN 'finance_admin'
            WHEN 'finance_admin' THEN 'finance_admin'
            WHEN 'super admin' THEN 'super_admin'
            WHEN 'super / finance admin' THEN 'super_admin'
            WHEN 'super_admin' THEN 'super_admin'
            ELSE COALESCE(NULLIF(system_role, ''), 'member')
        END
        """,
    )
    cursor.close()


def verification_status(user: dict) -> str:
    status = str(user.get("verification_status") or "").strip().lower()
    if status in {"pending", "approved", "rejected", "suspended"}:
        return status
    return "approved" if user.get("is_verified") else "pending"


def migrate_user_doctor_fields(connection, dialect: str) -> None:
    users = fetch_all(
        connection,
        dialect,
        """
        SELECT id, name, specialty, hospital, verification_doc,
               verification_doc_url, verification_status, is_verified
        FROM users
        WHERE user_type='doctor' OR LOWER(TRIM(COALESCE(role, '')))='doctor'
        """,
    )

    for user in users:
        existing = fetch_all(
            connection,
            dialect,
            "SELECT id FROM doctors WHERE user_id=%s LIMIT 1",
            (user["id"],),
        )
        document_url = user.get("verification_doc_url") or user.get("verification_doc")
        status = verification_status(user)
        specialty = user.get("specialty") or "General Medicine"
        hospital = user.get("hospital") or ""

        if existing:
            cursor = execute(
                connection,
                dialect,
                """
                UPDATE doctors
                SET specialty=COALESCE(NULLIF(%s, ''), specialty),
                    hospital=COALESCE(NULLIF(%s, ''), hospital),
                    verification_document_url=COALESCE(%s, verification_document_url),
                    verification_status=%s,
                    updated_at=CURRENT_TIMESTAMP
                WHERE user_id=%s
                """,
                (specialty, hospital, document_url, status, user["id"]),
            )
        else:
            cursor = execute(
                connection,
                dialect,
                """
                INSERT INTO doctors
                    (id, user_id, name, specialty, hospital,
                     verification_document_url, verification_status,
                     created_at, updated_at)
                VALUES (%s,%s,%s,%s,%s,%s,%s,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP)
                """,
                (
                    "doc_" + uuid.uuid4().hex[:12],
                    user["id"],
                    user.get("name") or "Doctor",
                    specialty,
                    hospital,
                    document_url,
                    status,
                ),
            )
        cursor.close()


def migrate_doctor_onboarding(connection, dialect: str) -> None:
    if not table_exists(connection, dialect, "doctor_onboarding"):
        return

    applications = fetch_all(
        connection,
        dialect,
        "SELECT * FROM doctor_onboarding",
    )
    for application in applications:
        user_id = application["user_id"]
        existing = fetch_all(
            connection,
            dialect,
            "SELECT id FROM doctors WHERE user_id=%s LIMIT 1",
            (user_id,),
        )
        status_text = str(application.get("status") or "pending").lower()
        status = "approved" if "approved" in status_text else "rejected" if "reject" in status_text else "pending"

        if existing:
            cursor = execute(
                connection,
                dialect,
                """
                UPDATE doctors
                SET registration_number=COALESCE(%s, registration_number),
                    qualification=COALESCE(%s, qualification),
                    specialty=COALESCE(%s, specialty),
                    jurisdiction=COALESCE(%s, jurisdiction),
                    verification_document_url=COALESCE(%s, verification_document_url),
                    consultation_fee=COALESCE(%s, consultation_fee),
                    verification_status=%s,
                    updated_at=CURRENT_TIMESTAMP
                WHERE user_id=%s
                """,
                (
                    application.get("reg_number"),
                    application.get("qualification"),
                    application.get("specialty"),
                    application.get("jurisdiction"),
                    application.get("proof_document_url"),
                    application.get("fee"),
                    status,
                    user_id,
                ),
            )
            cursor.close()


def migrate(target: str) -> None:
    connection, dialect = connect(target)
    try:
        ensure_column(connection, dialect, "users", "user_type", "TEXT DEFAULT 'general_user'")
        ensure_column(connection, dialect, "users", "system_role", "TEXT DEFAULT 'member'")

        doctor_columns = {
            "registration_number": "TEXT",
            "jurisdiction": "TEXT",
            "verification_document_url": "TEXT",
            "verification_status": "TEXT DEFAULT 'pending'",
            "verified_by": "TEXT",
            "verified_at": "TIMESTAMP",
            "consultation_fee": "REAL",
            "created_at": "TIMESTAMP",
            "updated_at": "TIMESTAMP",
        }
        for column, sql_type in doctor_columns.items():
            ensure_column(connection, dialect, "doctors", column, sql_type)

        cursor = execute(
            connection,
            dialect,
            "UPDATE doctors SET consultation_fee=fee WHERE consultation_fee IS NULL",
        )
        cursor.close()

        backfill_user_types(connection, dialect)
        migrate_user_doctor_fields(connection, dialect)
        migrate_doctor_onboarding(connection, dialect)
        connection.commit()
    except Exception:
        connection.rollback()
        raise
    finally:
        connection.close()


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--target",
        choices=("local", "configured"),
        default="local",
    )
    args = parser.parse_args()
    migrate(args.target)
    print(f"Migration 001 completed for {args.target} database")


if __name__ == "__main__":
    main()
