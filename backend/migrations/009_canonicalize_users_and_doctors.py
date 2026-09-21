"""Add and backfill canonical schema required by current Jorniz features.

This migration is non-destructive. It preserves legacy columns while adding
canonical user/doctor data and Admin Posts audit/index support. Migration 010
performs the separately confirmed legacy-column cleanup.
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

ACCOUNT_TYPES = {
    "general_user",
    "creator",
    "job_seeker",
    "recruiter",
    "doctor",
    "seller",
    "pharmacy_partner",
    "diagnostic_partner",
    "advertiser",
}
SYSTEM_ROLES = {"member", "moderator", "admin", "finance_admin", "super_admin"}

LEGACY_ACCOUNT_TYPES = {
    "patient": "general_user",
    "general user": "general_user",
    "general_user": "general_user",
    "creator": "creator",
    "job seeker": "job_seeker",
    "job_seeker": "job_seeker",
    "recruiter / employer": "recruiter",
    "recruiter": "recruiter",
    "doctor": "doctor",
    "seller / brand": "seller",
    "seller": "seller",
    "pharmacy partner": "pharmacy_partner",
    "pharmacy_partner": "pharmacy_partner",
    "diagnostic partner": "diagnostic_partner",
    "diagnostic_partner": "diagnostic_partner",
    "advertiser": "advertiser",
}
LEGACY_SYSTEM_ROLES = {
    "moderator": "moderator",
    "admin": "admin",
    "finance admin": "finance_admin",
    "finance_admin": "finance_admin",
    "super admin": "super_admin",
    "super / finance admin": "super_admin",
    "super_admin": "super_admin",
}
NON_SPECIALTIES = {"", "general user", "general_user", "patient", "none", "n/a", "not applicable"}
EMPTY_VALUES = {"", "none", "null", "n/a", "not applicable"}

USER_COLUMNS_TO_DROP = (
    "role",
    "specialty",
    "hospital",
    "verification_doc",
    "verification_doc_url",
    "verification_status",
    "is_verified",
    "balance",
    "wallet_balance",
    "coins",
)
DOCTOR_COLUMNS_TO_DROP = ("fee",)
SHARED_USER_PROFILE_COLUMNS = ("bio", "avatar_url")
NON_DOCTOR_VERIFICATION_TYPES = ACCOUNT_TYPES - {"general_user", "doctor"}


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


def execute(connection, dialect: str, statement: str, params=()):
    cursor = connection.cursor()
    cursor.execute(statement.replace("%s", "?") if dialect == "sqlite" else statement, params)
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
            "WHERE table_schema=current_schema() AND table_name=%s",
            (table,),
        )
    try:
        return cursor.fetchone() is not None
    finally:
        cursor.close()


def columns(connection, dialect: str, table: str) -> set[str]:
    if dialect == "sqlite":
        cursor = connection.execute(f'PRAGMA table_info("{table}")')
        try:
            return {row[1] for row in cursor.fetchall()}
        finally:
            cursor.close()

    cursor = execute(
        connection,
        dialect,
        "SELECT column_name FROM information_schema.columns "
        "WHERE table_schema=current_schema() AND table_name=%s",
        (table,),
    )
    try:
        return {row["column_name"] for row in cursor.fetchall()}
    finally:
        cursor.close()


def fetch_all(connection, dialect: str, statement: str, params=()) -> list[dict]:
    cursor = execute(connection, dialect, statement, params)
    try:
        return [dict(row) for row in cursor.fetchall()]
    finally:
        cursor.close()


def ensure_column(connection, dialect: str, table: str, column: str, definition: str) -> None:
    if column in columns(connection, dialect, table):
        return
    cursor = execute(connection, dialect, f'ALTER TABLE "{table}" ADD COLUMN "{column}" {definition}')
    cursor.close()


def clean(value) -> str:
    return str(value or "").strip()


def meaningful(value, excluded: set[str] = EMPTY_VALUES) -> bool:
    return clean(value).lower() not in excluded


def approved_from_legacy(user: dict) -> str:
    status = clean(user.get("verification_status")).lower()
    if status in {"pending", "approved", "rejected", "suspended"}:
        return status
    value = user.get("is_verified")
    verified = value is True or clean(value).lower() in {"1", "true", "t", "yes", "y"}
    return "approved" if verified else "pending"


def truthy(value) -> bool:
    return value is True or clean(value).lower() in {"1", "true", "t", "yes", "y"}


def ensure_canonical_schema(connection, dialect: str) -> None:
    for column, definition in (
        ("user_type", "TEXT DEFAULT 'general_user'"),
        ("system_role", "TEXT DEFAULT 'member'"),
        ("bio", "TEXT"),
        ("avatar_url", "TEXT"),
        ("hu_coins", "REAL DEFAULT 0"),
        ("is_banned", "INTEGER DEFAULT 0"),
        ("account_status", "TEXT DEFAULT 'active'"),
    ):
        ensure_column(connection, dialect, "users", column, definition)

    if not table_exists(connection, dialect, "doctors"):
        cursor = execute(
            connection,
            dialect,
            """CREATE TABLE doctors (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL REFERENCES users(id),
                name TEXT,
                specialty TEXT NOT NULL,
                qualification TEXT,
                experience_years INTEGER DEFAULT 5,
                rating REAL DEFAULT 4.9,
                reviews_count INTEGER DEFAULT 120,
                hospital TEXT,
                location TEXT,
                bio TEXT,
                available_days TEXT,
                registration_number TEXT,
                jurisdiction TEXT,
                verification_document_url TEXT,
                verification_status TEXT DEFAULT 'pending',
                verified_by TEXT,
                verified_at TIMESTAMP,
                consultation_fee REAL DEFAULT 500.0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )""",
        )
        cursor.close()
        return

    for column, definition in (
        ("name", "TEXT"),
        ("bio", "TEXT"),
        ("available_days", "TEXT"),
        ("registration_number", "TEXT"),
        ("jurisdiction", "TEXT"),
        ("verification_document_url", "TEXT"),
        ("verification_status", "TEXT DEFAULT 'pending'"),
        ("verified_by", "TEXT"),
        ("verified_at", "TIMESTAMP"),
        ("consultation_fee", "REAL"),
        ("created_at", "TIMESTAMP"),
        ("updated_at", "TIMESTAMP"),
    ):
        ensure_column(connection, dialect, "doctors", column, definition)


def normalize_users(connection, dialect: str) -> None:
    user_columns = columns(connection, dialect, "users")
    doctor_user_ids = {
        row["user_id"]
        for row in fetch_all(connection, dialect, "SELECT user_id FROM doctors WHERE user_id IS NOT NULL")
    }
    users = fetch_all(connection, dialect, "SELECT * FROM users")

    for user in users:
        legacy_role = clean(user.get("role")).lower()
        current_type = clean(user.get("user_type")).lower()
        current_role = clean(user.get("system_role")).lower()
        legacy_specialty = clean(user.get("specialty"))
        has_doctor_data = user["id"] in doctor_user_ids or (
            current_type in {"", "general_user"}
            and (
                legacy_specialty.lower() not in NON_SPECIALTIES
                or meaningful(user.get("hospital"))
                or LEGACY_ACCOUNT_TYPES.get(legacy_role) == "doctor"
            )
        )

        user_type = current_type if current_type in ACCOUNT_TYPES else "general_user"
        mapped_type = LEGACY_ACCOUNT_TYPES.get(legacy_role)
        if user_type == "general_user" and mapped_type:
            user_type = mapped_type
        if has_doctor_data:
            user_type = "doctor"

        system_role = current_role if current_role in SYSTEM_ROLES else "member"
        mapped_role = LEGACY_SYSTEM_ROLES.get(legacy_role)
        if system_role == "member" and mapped_role:
            system_role = mapped_role

        hu_coins = user.get("hu_coins")
        if hu_coins is None and "coins" in user_columns:
            hu_coins = user.get("coins")
        if hu_coins is None:
            hu_coins = 0

        cursor = execute(
            connection,
            dialect,
            "UPDATE users SET user_type=%s,system_role=%s,hu_coins=%s WHERE id=%s",
            (user_type, system_role, hu_coins, user["id"]),
        )
        cursor.close()


def doctor_candidates(connection, dialect: str) -> list[dict]:
    users = {row["id"]: row for row in fetch_all(connection, dialect, "SELECT * FROM users")}
    profiles = fetch_all(connection, dialect, "SELECT * FROM doctors")
    profile_user_ids = {row["user_id"] for row in profiles if row.get("user_id")}
    return [
        user
        for user in users.values()
        if user.get("user_type") == "doctor" or user["id"] in profile_user_ids
    ]


def backfill_doctors(connection, dialect: str) -> None:
    user_columns = columns(connection, dialect, "users")
    doctor_columns = columns(connection, dialect, "doctors")
    profiles = {
        row["user_id"]: row
        for row in fetch_all(connection, dialect, "SELECT * FROM doctors")
        if row.get("user_id")
    }

    for user in doctor_candidates(connection, dialect):
        profile = profiles.get(user["id"])
        legacy_specialty = clean(user.get("specialty")) if "specialty" in user_columns else ""
        specialty = legacy_specialty if legacy_specialty.lower() not in NON_SPECIALTIES else "General Medicine"
        hospital = clean(user.get("hospital")) if "hospital" in user_columns else ""
        document_url = ""
        if "verification_doc_url" in user_columns:
            document_url = clean(user.get("verification_doc_url"))
        if not document_url and "verification_doc" in user_columns:
            document_url = clean(user.get("verification_doc"))
        verification_status = approved_from_legacy(user)

        if profile:
            updates: dict[str, object] = {}
            if not meaningful(profile.get("specialty"), NON_SPECIALTIES):
                updates["specialty"] = specialty
            if "name" in doctor_columns and not meaningful(profile.get("name")):
                updates["name"] = user.get("name") or "Doctor"
            if "hospital" in doctor_columns and not meaningful(profile.get("hospital")) and hospital:
                updates["hospital"] = hospital
            if "bio" in doctor_columns and not meaningful(profile.get("bio")) and meaningful(user.get("bio")):
                updates["bio"] = user.get("bio")
            if "verification_document_url" in doctor_columns and not meaningful(profile.get("verification_document_url")) and document_url:
                updates["verification_document_url"] = document_url
            if "verification_status" in doctor_columns and clean(profile.get("verification_status")).lower() in {"", "pending"}:
                updates["verification_status"] = verification_status
            if "consultation_fee" in doctor_columns and profile.get("consultation_fee") is None and "fee" in doctor_columns:
                updates["consultation_fee"] = profile.get("fee")
            if updates:
                assignments = ",".join(f'"{name}"=%s' for name in updates)
                if "updated_at" in doctor_columns:
                    assignments += ",updated_at=CURRENT_TIMESTAMP"
                cursor = execute(
                    connection,
                    dialect,
                    f"UPDATE doctors SET {assignments} WHERE user_id=%s",
                    (*updates.values(), user["id"]),
                )
                cursor.close()
        else:
            values: dict[str, object] = {
                "id": "doc_" + uuid.uuid4().hex[:12],
                "user_id": user["id"],
                "specialty": specialty,
            }
            optional = {
                "name": user.get("name"),
                "hospital": hospital or None,
                "verification_document_url": document_url or None,
                "verification_status": verification_status,
                "bio": user.get("bio"),
            }
            values.update({key: value for key, value in optional.items() if key in doctor_columns})
            names = ",".join(f'"{name}"' for name in values)
            marks = ",".join("%s" for _ in values)
            cursor = execute(
                connection,
                dialect,
                f"INSERT INTO doctors ({names}) VALUES ({marks})",
                tuple(values.values()),
            )
            cursor.close()


def backfill_non_doctor_verification(connection, dialect: str) -> None:
    user_columns = columns(connection, dialect, "users")
    legacy_columns = {
        "verification_doc",
        "verification_doc_url",
        "verification_status",
        "is_verified",
    }
    if not legacy_columns & user_columns:
        return

    for user in fetch_all(connection, dialect, "SELECT * FROM users"):
        user_type = clean(user.get("user_type")).lower()
        if user_type in {"general_user", "doctor"}:
            continue

        document_url = clean(user.get("verification_doc_url")) or clean(user.get("verification_doc"))
        status = approved_from_legacy(user)
        legacy_status = clean(user.get("verification_status")).lower()
        has_legacy_state = bool(
            document_url
            or truthy(user.get("is_verified"))
            or legacy_status not in (EMPTY_VALUES | {"not_required"})
        )
        if not has_legacy_state:
            continue

        if user_type == "recruiter" and table_exists(connection, dialect, "company_profiles"):
            if "is_verified" in columns(connection, dialect, "company_profiles"):
                cursor = execute(
                    connection,
                    dialect,
                    "UPDATE company_profiles SET is_verified=%s WHERE user_id=%s",
                    (status == "approved", user["id"]),
                )
                cursor.close()
        elif user_type == "seller" and table_exists(connection, dialect, "seller_profiles"):
            if "status" in columns(connection, dialect, "seller_profiles"):
                cursor = execute(
                    connection,
                    dialect,
                    "UPDATE seller_profiles SET status=%s WHERE user_id=%s",
                    (status, user["id"]),
                )
                cursor.close()
        elif user_type == "advertiser" and table_exists(connection, dialect, "advertisers"):
            if "verified" in columns(connection, dialect, "advertisers"):
                cursor = execute(
                    connection,
                    dialect,
                    "UPDATE advertisers SET verified=%s WHERE user_id=%s",
                    (status == "approved", user["id"]),
                )
                cursor.close()

        if user_type not in NON_DOCTOR_VERIFICATION_TYPES:
            continue
        if not table_exists(connection, dialect, "creator_verifications"):
            raise RuntimeError(
                f"Cannot preserve verification data for {user_type} user {user['id']}: "
                "creator_verifications is missing"
            )
        existing = fetch_all(
            connection,
            dialect,
            "SELECT id,document_url,status FROM creator_verifications "
            "WHERE user_id=%s AND category=%s LIMIT 1",
            (user["id"], user_type),
        )
        if existing:
            verification = existing[0]
            cursor = execute(
                connection,
                dialect,
                "UPDATE creator_verifications SET document_url=%s,status=%s WHERE id=%s",
                (
                    document_url or verification.get("document_url") or "",
                    status,
                    verification["id"],
                ),
            )
            cursor.close()
        else:
            cursor = execute(
                connection,
                dialect,
                "INSERT INTO creator_verifications (id,user_id,category,document_url,status) "
                "VALUES (%s,%s,%s,%s,%s)",
                ("ver_" + uuid.uuid4().hex, user["id"], user_type, document_url, status),
            )
            cursor.close()


def backfill_shared_profile(connection, dialect: str) -> None:
    doctor_columns = columns(connection, dialect, "doctors")
    for profile in fetch_all(connection, dialect, "SELECT * FROM doctors"):
        updates: dict[str, object] = {}
        if "bio" in doctor_columns and meaningful(profile.get("bio")):
            updates["bio"] = profile["bio"]
        if "avatar" in doctor_columns and meaningful(profile.get("avatar")):
            updates["avatar_url"] = profile["avatar"]
        if "name" in doctor_columns and meaningful(profile.get("name")):
            updates["name"] = profile["name"]
        for column, value in updates.items():
            cursor = execute(
                connection,
                dialect,
                f'UPDATE users SET "{column}"=%s WHERE id=%s AND ("{column}" IS NULL OR TRIM("{column}")=\'\')',
                (value, profile["user_id"]),
            )
            cursor.close()


def validate_backfill(connection, dialect: str) -> None:
    invalid_users = fetch_all(
        connection,
        dialect,
        "SELECT id FROM users WHERE user_type IS NULL OR system_role IS NULL OR hu_coins IS NULL LIMIT 1",
    )
    if invalid_users:
        raise RuntimeError("Canonical users fields contain NULL values")

    missing_profiles = fetch_all(
        connection,
        dialect,
        """SELECT users.id FROM users
           LEFT JOIN doctors ON doctors.user_id=users.id
           WHERE users.user_type='doctor' AND doctors.id IS NULL LIMIT 1""",
    )
    if missing_profiles:
        raise RuntimeError(f"Doctor user {missing_profiles[0]['id']} has no doctors profile")

    duplicate_profiles = fetch_all(
        connection,
        dialect,
        "SELECT user_id FROM doctors WHERE user_id IS NOT NULL GROUP BY user_id HAVING COUNT(*)>1 LIMIT 1",
    )
    if duplicate_profiles:
        raise RuntimeError(f"User {duplicate_profiles[0]['user_id']} has duplicate doctors profiles")

    empty_specialties = fetch_all(
        connection,
        dialect,
        "SELECT id FROM doctors WHERE specialty IS NULL OR TRIM(specialty)='' LIMIT 1",
    )
    if empty_specialties:
        raise RuntimeError(f"Doctor profile {empty_specialties[0]['id']} has no specialty")


def validate_legacy_drop(connection, dialect: str) -> None:
    user_columns = columns(connection, dialect, "users")
    users = fetch_all(connection, dialect, "SELECT * FROM users")

    for user in users:
        user_id = user["id"]
        hu_coins = float(user.get("hu_coins") or 0)
        legacy_coins = float(user.get("coins") or 0) if "coins" in user_columns else 0
        if legacy_coins and legacy_coins != hu_coins:
            raise RuntimeError(
                f"User {user_id} has conflicting users.hu_coins ({hu_coins}) "
                f"and legacy users.coins ({legacy_coins})"
            )
        for column in ("balance", "wallet_balance"):
            if column in user_columns and float(user.get(column) or 0) != 0:
                raise RuntimeError(
                    f"User {user_id} has non-zero users.{column}; "
                    "no canonical money destination exists"
                )

        user_type = clean(user.get("user_type")).lower()
        if user_type != "doctor":
            specialty = clean(user.get("specialty")).lower()
            if "specialty" in user_columns and specialty not in NON_SPECIALTIES:
                raise RuntimeError(
                    f"Non-doctor user {user_id} has legacy specialty data "
                    "without a canonical destination"
                )
            if "hospital" in user_columns and meaningful(user.get("hospital")):
                raise RuntimeError(
                    f"Non-doctor user {user_id} has legacy hospital data "
                    "without a canonical destination"
                )

        has_document = meaningful(user.get("verification_doc")) or meaningful(
            user.get("verification_doc_url")
        )
        legacy_status = clean(user.get("verification_status")).lower()
        has_verification = truthy(user.get("is_verified")) or legacy_status not in (
            EMPTY_VALUES | {"not_required"}
        )
        if user_type == "general_user":
            if has_document or has_verification:
                raise RuntimeError(
                    f"General user {user_id} has legacy verification data "
                    "without a canonical destination"
                )
        elif user_type in NON_DOCTOR_VERIFICATION_TYPES and (has_document or has_verification):
            preserved = fetch_all(
                connection,
                dialect,
                "SELECT document_url,status FROM creator_verifications "
                "WHERE user_id=%s AND category=%s ORDER BY created_at DESC LIMIT 1",
                (user_id, user_type),
            )
            if not preserved:
                raise RuntimeError(
                    f"Professional user {user_id} has verification data that was not preserved"
                )
            record = preserved[0]
            source_document = clean(user.get("verification_doc_url")) or clean(
                user.get("verification_doc")
            )
            if source_document and clean(record.get("document_url")) != source_document:
                raise RuntimeError(
                    f"Professional user {user_id} has a verification document that was not preserved"
                )
            if has_verification and clean(record.get("status")).lower() != approved_from_legacy(user):
                raise RuntimeError(
                    f"Professional user {user_id} has a verification status that was not preserved"
                )


def enforce_constraints(connection, dialect: str) -> None:
    cursor = execute(
        connection,
        dialect,
        "CREATE UNIQUE INDEX IF NOT EXISTS uq_doctors_user_id ON doctors(user_id)",
    )
    cursor.close()
    if dialect == "postgres":
        for statement in (
            "ALTER TABLE users ALTER COLUMN user_type SET DEFAULT 'general_user'",
            "ALTER TABLE users ALTER COLUMN user_type SET NOT NULL",
            "ALTER TABLE users ALTER COLUMN system_role SET DEFAULT 'member'",
            "ALTER TABLE users ALTER COLUMN system_role SET NOT NULL",
            "ALTER TABLE users ALTER COLUMN hu_coins SET DEFAULT 0",
            "ALTER TABLE users ALTER COLUMN hu_coins SET NOT NULL",
            "ALTER TABLE doctors ALTER COLUMN user_id SET NOT NULL",
        ):
            cursor = execute(connection, dialect, statement)
            cursor.close()


def ensure_admin_posts_schema(connection, dialect: str) -> bool:
    missing = [
        table
        for table in ("posts", "post_actions")
        if not table_exists(connection, dialect, table)
    ]
    if missing:
        raise RuntimeError(
            "Admin Posts schema requires existing table(s): " + ", ".join(missing)
        )

    value_type = "JSONB" if dialect == "postgres" else "TEXT"
    cursor = execute(
        connection,
        dialect,
        f"""CREATE TABLE IF NOT EXISTS admin_audit_log (
            id TEXT PRIMARY KEY,
            actor_user_id TEXT NOT NULL,
            entity_type TEXT NOT NULL,
            entity_id TEXT NOT NULL,
            action TEXT NOT NULL,
            before_value {value_type},
            after_value {value_type},
            created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
        )""",
    )
    cursor.close()

    for statement in (
        "CREATE INDEX IF NOT EXISTS idx_posts_recent "
        "ON posts(created_at DESC, id DESC)",
        "CREATE INDEX IF NOT EXISTS idx_posts_title ON posts(title)",
        "CREATE INDEX IF NOT EXISTS idx_post_actions_post_type "
        "ON post_actions(post_id, action_type)",
        "CREATE INDEX IF NOT EXISTS idx_admin_audit_entity_created "
        "ON admin_audit_log(entity_type, entity_id, created_at DESC)",
    ):
        cursor = execute(connection, dialect, statement)
        cursor.close()

    if dialect != "postgres":
        return False

    cursor = connection.cursor()
    try:
        cursor.execute("SAVEPOINT admin_posts_trigram")
        cursor.execute("CREATE EXTENSION IF NOT EXISTS pg_trgm")
        cursor.execute(
            "CREATE INDEX IF NOT EXISTS idx_posts_title_trgm "
            "ON posts USING GIN (LOWER(title) gin_trgm_ops)"
        )
        cursor.execute("RELEASE SAVEPOINT admin_posts_trigram")
        return True
    except Exception:
        cursor.execute("ROLLBACK TO SAVEPOINT admin_posts_trigram")
        cursor.execute("RELEASE SAVEPOINT admin_posts_trigram")
        return False
    finally:
        cursor.close()


def ensure_admin_rewards_schema(connection, dialect: str) -> None:
    if not table_exists(connection, dialect, "wallet_ledger"):
        raise RuntimeError("Admin Rewards schema requires existing table: wallet_ledger")
    ensure_column(connection, dialect, "wallet_ledger", "actor_user_id", "TEXT")
    ensure_column(connection, dialect, "wallet_ledger", "reason", "TEXT")
    cursor = execute(
        connection,
        dialect,
        "CREATE INDEX IF NOT EXISTS idx_wallet_ledger_actor_created "
        "ON wallet_ledger(actor_user_id, created_at DESC)",
    )
    cursor.close()


def drop_legacy_columns(connection, dialect: str) -> None:
    for table, legacy_columns in (
        ("users", USER_COLUMNS_TO_DROP),
        ("doctors", DOCTOR_COLUMNS_TO_DROP),
    ):
        existing = columns(connection, dialect, table)
        for column in legacy_columns:
            if column not in existing:
                continue
            cursor = execute(connection, dialect, f'ALTER TABLE "{table}" DROP COLUMN "{column}"')
            cursor.close()


def migrate_connection(connection, dialect: str) -> bool:
    ensure_canonical_schema(connection, dialect)
    normalize_users(connection, dialect)
    backfill_doctors(connection, dialect)
    backfill_non_doctor_verification(connection, dialect)
    backfill_shared_profile(connection, dialect)
    validate_backfill(connection, dialect)
    enforce_constraints(connection, dialect)
    trigram_enabled = ensure_admin_posts_schema(connection, dialect)
    ensure_admin_rewards_schema(connection, dialect)
    return trigram_enabled


def migrate(target: str) -> bool:
    connection, dialect = connect(target)
    try:
        if dialect == "sqlite":
            connection.execute("PRAGMA foreign_keys=OFF")
        trigram_enabled = migrate_connection(connection, dialect)
        connection.commit()
        return trigram_enabled
    except Exception:
        connection.rollback()
        raise
    finally:
        if dialect == "sqlite":
            connection.execute("PRAGMA foreign_keys=ON")
        connection.close()


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--target", choices=("local", "configured"), default="local")
    args = parser.parse_args()
    trigram_enabled = migrate(args.target)
    trigram_status = "enabled" if trigram_enabled else "skipped"
    print(
        f"009 additive canonical schema applied on {args.target}; "
        f"PostgreSQL trigram index {trigram_status}"
    )


if __name__ == "__main__":
    main()
