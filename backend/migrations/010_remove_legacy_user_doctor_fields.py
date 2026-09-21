"""Remove validated legacy user and doctor fields.

Run only after migration 009 and the API version that uses canonical account,
doctor, wallet, verification, and avatar fields have been deployed.
"""

from __future__ import annotations

import argparse
import importlib.util
from pathlib import Path


BACKEND_DIR = Path(__file__).resolve().parents[1]
ADDITIVE_MIGRATION_PATH = Path(__file__).with_name("009_canonicalize_users_and_doctors.py")
SPEC = importlib.util.spec_from_file_location("migration_009_for_cleanup", ADDITIVE_MIGRATION_PATH)
if SPEC is None or SPEC.loader is None:
    raise RuntimeError("Unable to load additive migration 009")
ADDITIVE = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(ADDITIVE)


def validate_cleanup_ready(connection, dialect: str) -> None:
    required_user_columns = {"user_type", "system_role", "hu_coins", "avatar_url"}
    missing = required_user_columns - ADDITIVE.columns(connection, dialect, "users")
    if missing:
        raise RuntimeError(
            "Run migration 009 before cleanup; missing users columns: "
            + ", ".join(sorted(missing))
        )
    if not ADDITIVE.table_exists(connection, dialect, "admin_audit_log"):
        raise RuntimeError("Run migration 009 before cleanup; admin_audit_log is missing")


def validate_no_avatar_conflicts(connection, dialect: str) -> None:
    if "avatar" not in ADDITIVE.columns(connection, dialect, "doctors"):
        return
    conflicts = ADDITIVE.fetch_all(
        connection,
        dialect,
        """SELECT d.user_id
           FROM doctors d
           JOIN users u ON u.id=d.user_id
           WHERE d.avatar IS NOT NULL AND TRIM(d.avatar)<>''
             AND u.avatar_url IS NOT NULL AND TRIM(u.avatar_url)<>''
             AND d.avatar<>u.avatar_url
           LIMIT 1""",
    )
    if conflicts:
        raise RuntimeError(
            f"Doctor avatar differs from users.avatar_url for user {conflicts[0]['user_id']}; "
            "resolve the image before cleanup"
        )


def copy_legacy_avatars(connection, dialect: str) -> None:
    if "avatar" not in ADDITIVE.columns(connection, dialect, "doctors"):
        return
    cursor = ADDITIVE.execute(
        connection,
        dialect,
        """UPDATE users
           SET avatar_url=(
               SELECT d.avatar FROM doctors d
               WHERE d.user_id=users.id AND d.avatar IS NOT NULL AND TRIM(d.avatar)<>''
           )
           WHERE (avatar_url IS NULL OR TRIM(avatar_url)='')
             AND EXISTS (
               SELECT 1 FROM doctors d
               WHERE d.user_id=users.id AND d.avatar IS NOT NULL AND TRIM(d.avatar)<>''
           )""",
    )
    cursor.close()


def drop_doctor_avatar(connection, dialect: str) -> None:
    if "avatar" not in ADDITIVE.columns(connection, dialect, "doctors"):
        return
    cursor = ADDITIVE.execute(connection, dialect, 'ALTER TABLE doctors DROP COLUMN "avatar"')
    cursor.close()


def migrate_connection(connection, dialect: str) -> bool:
    validate_cleanup_ready(connection, dialect)
    ADDITIVE.validate_legacy_drop(connection, dialect)
    validate_no_avatar_conflicts(connection, dialect)
    copy_legacy_avatars(connection, dialect)

    user_columns_before = ADDITIVE.columns(connection, dialect, "users")
    doctor_columns_before = ADDITIVE.columns(connection, dialect, "doctors")
    changed = bool(
        set(ADDITIVE.USER_COLUMNS_TO_DROP) & user_columns_before
        or set(ADDITIVE.DOCTOR_COLUMNS_TO_DROP) & doctor_columns_before
        or "avatar" in doctor_columns_before
    )
    ADDITIVE.drop_legacy_columns(connection, dialect)
    drop_doctor_avatar(connection, dialect)
    return changed


def migrate(target: str) -> bool:
    connection, dialect = ADDITIVE.connect(target)
    try:
        if dialect == "sqlite":
            connection.execute("PRAGMA foreign_keys=OFF")
        changed = migrate_connection(connection, dialect)
        connection.commit()
        return changed
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
    parser.add_argument(
        "--confirm-api-updated",
        action="store_true",
        help="Confirm the deployed API no longer uses legacy user or doctor fields",
    )
    args = parser.parse_args()
    if not args.confirm_api_updated:
        raise SystemExit(
            "Refusing destructive migration. Deploy the canonical API, then rerun with "
            "--confirm-api-updated"
        )
    changed = migrate(args.target)
    print(
        f"010 legacy user/doctor cleanup "
        f"{'applied' if changed else 'already applied'} on {args.target}"
    )


if __name__ == "__main__":
    main()
