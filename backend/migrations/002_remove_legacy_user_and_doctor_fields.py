"""Remove legacy fields after the API has switched to the expanded schema.

This is a destructive contract migration. It refuses to run without an explicit
confirmation flag. Migration 001 and the corresponding API deployment must be
complete first.
"""

from __future__ import annotations

import argparse

from importlib.util import module_from_spec, spec_from_file_location
from pathlib import Path


MIGRATION_DIR = Path(__file__).resolve().parent
SPEC = spec_from_file_location(
    "migration_001",
    MIGRATION_DIR / "001_separate_user_types_and_doctor_fields.py",
)
if SPEC is None or SPEC.loader is None:
    raise RuntimeError("Unable to load migration 001 helpers")
MIGRATION_001 = module_from_spec(SPEC)
SPEC.loader.exec_module(MIGRATION_001)


USER_COLUMNS_TO_DROP = (
    "role",
    "specialty",
    "hospital",
    "verification_doc",
    "verification_doc_url",
    "is_verified",
)

DOCTOR_COLUMNS_TO_DROP = (
    "name",
    "avatar",
    "bio",
    "available_days",
    "fee",
)


def validate_ready(connection, dialect: str) -> None:
    for column in ("user_type", "system_role"):
        if not MIGRATION_001.column_exists(connection, dialect, "users", column):
            raise RuntimeError(f"Migration 001 is incomplete: users.{column} is missing")

    missing_doctors = MIGRATION_001.fetch_all(
        connection,
        dialect,
        """
        SELECT users.id
        FROM users
        LEFT JOIN doctors ON doctors.user_id=users.id
        WHERE users.user_type='doctor' AND doctors.id IS NULL
        LIMIT 1
        """,
    )
    if missing_doctors:
        raise RuntimeError("A doctor user has no doctors profile; run/fix migration 001")


def drop_column(connection, dialect: str, table: str, column: str) -> None:
    if not MIGRATION_001.column_exists(connection, dialect, table, column):
        return
    cursor = MIGRATION_001.execute(
        connection,
        dialect,
        f'ALTER TABLE "{table}" DROP COLUMN "{column}"',
    )
    cursor.close()


def migrate(target: str) -> None:
    connection, dialect = MIGRATION_001.connect(target)
    try:
        validate_ready(connection, dialect)
        for column in USER_COLUMNS_TO_DROP:
            drop_column(connection, dialect, "users", column)
        for column in DOCTOR_COLUMNS_TO_DROP:
            drop_column(connection, dialect, "doctors", column)
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
    parser.add_argument(
        "--confirm-app-updated",
        action="store_true",
        help="Confirm that the deployed API no longer reads legacy columns",
    )
    args = parser.parse_args()

    if not args.confirm_app_updated:
        raise SystemExit(
            "Refusing destructive migration. Update backend code, then rerun with "
            "--confirm-app-updated"
        )

    migrate(args.target)
    print(f"Migration 002 completed for {args.target} database")


if __name__ == "__main__":
    main()
