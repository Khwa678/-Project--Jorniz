import importlib.util
import json
import sqlite3
import unittest
from pathlib import Path


BACKEND_DIR = Path(__file__).resolve().parents[1]
MIGRATION_PATH = BACKEND_DIR / "migrations" / "009_canonicalize_users_and_doctors.py"
SPEC = importlib.util.spec_from_file_location("migration_009", MIGRATION_PATH)
if SPEC is None or SPEC.loader is None:
    raise RuntimeError("Unable to load migration 009")
MIGRATION = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(MIGRATION)


LEGACY_SCHEMA = """
CREATE TABLE users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT,
    specialty TEXT,
    hospital TEXT,
    bio TEXT,
    avatar_url TEXT,
    is_verified INTEGER DEFAULT 0,
    balance REAL DEFAULT 0,
    hu_coins INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    role TEXT DEFAULT 'Patient',
    verification_doc TEXT,
    wallet_balance REAL DEFAULT 0,
    coins INTEGER DEFAULT 0,
    verification_doc_url TEXT,
    verification_status TEXT DEFAULT 'not_required',
    user_type TEXT DEFAULT 'general_user',
    system_role TEXT DEFAULT 'member'
);
CREATE TABLE doctors (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    name TEXT NOT NULL,
    specialty TEXT NOT NULL,
    qualification TEXT,
    experience_years INTEGER DEFAULT 5,
    fee REAL DEFAULT 500,
    rating REAL DEFAULT 4.9,
    reviews_count INTEGER DEFAULT 120,
    hospital TEXT,
    location TEXT,
    avatar TEXT,
    bio TEXT,
    available_days TEXT
);
CREATE TABLE creator_verifications (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    category TEXT NOT NULL,
    document_url TEXT NOT NULL,
    status TEXT DEFAULT 'Pending',
    admin_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE posts (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE post_actions (
    id TEXT PRIMARY KEY,
    post_id TEXT NOT NULL,
    action_type TEXT NOT NULL
);
CREATE TABLE wallet_ledger (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    credit_debit TEXT NOT NULL,
    value_type TEXT NOT NULL,
    amount REAL NOT NULL,
    currency TEXT DEFAULT 'HU_COIN',
    source_type TEXT NOT NULL,
    source_id TEXT,
    idempotency_key TEXT UNIQUE NOT NULL,
    balance_before REAL DEFAULT 0,
    balance_after REAL DEFAULT 0,
    status TEXT DEFAULT 'available',
    action TEXT,
    reversal_of_id TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
"""


class CanonicalUsersDoctorsMigrationTest(unittest.TestCase):
    def setUp(self):
        self.connection = sqlite3.connect(":memory:")
        self.connection.row_factory = sqlite3.Row
        self.connection.executescript(LEGACY_SCHEMA)

    def tearDown(self):
        self.connection.close()

    def test_backfills_legacy_doctor_without_dropping_source_fields(self):
        self.connection.execute(
            """INSERT INTO users
               (id,name,email,specialty,hospital,bio,avatar_url,is_verified,hu_coins,
                role,coins,verification_doc_url,verification_status,user_type,system_role)
               VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)""",
            (
                "doctor-admin",
                "Dr. Example",
                "doctor@example.com",
                "Dentistry",
                "Example Hospital",
                "Shared biography",
                "https://example.com/avatar.jpg",
                1,
                500,
                "Admin",
                0,
                "https://example.com/license.pdf",
                "approved",
                "general_user",
                "admin",
            ),
        )
        self.connection.execute(
            """INSERT INTO users
               (id,name,email,specialty,hu_coins,role,coins,user_type,system_role)
               VALUES (?,?,?,?,?,?,?,?,?)""",
            (
                "general-user",
                "General User",
                "member@example.com",
                "General User",
                None,
                "Patient",
                25,
                "general_user",
                "member",
            ),
        )

        MIGRATION.migrate_connection(self.connection, "sqlite")

        doctor_user = dict(self.connection.execute(
            "SELECT * FROM users WHERE id='doctor-admin'"
        ).fetchone())
        self.assertEqual("doctor", doctor_user["user_type"])
        self.assertEqual("admin", doctor_user["system_role"])
        self.assertEqual(500, doctor_user["hu_coins"])
        self.assertEqual("Shared biography", doctor_user["bio"])
        self.assertEqual("https://example.com/avatar.jpg", doctor_user["avatar_url"])

        member = dict(self.connection.execute(
            "SELECT * FROM users WHERE id='general-user'"
        ).fetchone())
        self.assertEqual("general_user", member["user_type"])
        self.assertEqual(25, member["hu_coins"])

        doctor = dict(self.connection.execute(
            "SELECT * FROM doctors WHERE user_id='doctor-admin'"
        ).fetchone())
        self.assertEqual("Dentistry", doctor["specialty"])
        self.assertEqual("Example Hospital", doctor["hospital"])
        self.assertEqual("approved", doctor["verification_status"])
        self.assertEqual("https://example.com/license.pdf", doctor["verification_document_url"])

        user_columns = {row[1] for row in self.connection.execute("PRAGMA table_info(users)")}
        self.assertTrue({"user_type", "system_role", "bio", "avatar_url", "hu_coins"} <= user_columns)
        self.assertTrue(set(MIGRATION.USER_COLUMNS_TO_DROP) <= user_columns)

        doctor_columns = {row[1] for row in self.connection.execute("PRAGMA table_info(doctors)")}
        self.assertTrue({
            "user_id", "name", "specialty", "bio", "available_days",
            "consultation_fee",
        } <= doctor_columns)
        self.assertTrue(set(MIGRATION.DOCTOR_COLUMNS_TO_DROP) <= doctor_columns)
        self.assertIn("avatar", doctor_columns)

        with self.assertRaises(sqlite3.IntegrityError):
            self.connection.execute(
                "INSERT INTO doctors (id,user_id,specialty) VALUES (?,?,?)",
                ("duplicate", "doctor-admin", "Cardiology"),
            )

    def test_preserves_non_doctor_professional_verification(self):
        self.connection.execute(
            """INSERT INTO users
               (id,name,email,hu_coins,role,user_type,system_role,is_verified,
                verification_doc_url,verification_status)
               VALUES (?,?,?,?,?,?,?,?,?,?)""",
            (
                "pharmacy-user",
                "Pharmacy Partner",
                "pharmacy@example.com",
                10,
                "Pharmacist",
                "pharmacy_partner",
                "member",
                1,
                "https://example.com/pharmacy-license.pdf",
                "approved",
            ),
        )

        MIGRATION.migrate_connection(self.connection, "sqlite")

        verification = dict(self.connection.execute(
            "SELECT * FROM creator_verifications WHERE user_id='pharmacy-user'"
        ).fetchone())
        self.assertEqual("pharmacy_partner", verification["category"])
        self.assertEqual("approved", verification["status"])
        self.assertEqual(
            "https://example.com/pharmacy-license.pdf",
            verification["document_url"],
        )

    def test_adds_admin_post_audit_support_idempotently(self):
        self.assertFalse(MIGRATION.migrate_connection(self.connection, "sqlite"))
        self.assertFalse(MIGRATION.migrate_connection(self.connection, "sqlite"))

        columns = {
            row[1]: row[2]
            for row in self.connection.execute("PRAGMA table_info(admin_audit_log)")
        }
        self.assertEqual("TEXT", columns["before_value"])
        self.assertEqual("TEXT", columns["after_value"])

        indexes = {
            row[0]
            for row in self.connection.execute(
                "SELECT name FROM sqlite_master WHERE type='index' AND sql IS NOT NULL"
            )
        }
        self.assertTrue({
            "idx_posts_recent",
            "idx_posts_title",
            "idx_post_actions_post_type",
            "idx_admin_audit_entity_created",
            "idx_wallet_ledger_actor_created",
        } <= indexes)

        wallet_columns = {
            row[1] for row in self.connection.execute("PRAGMA table_info(wallet_ledger)")
        }
        self.assertTrue({"actor_user_id", "reason"} <= wallet_columns)

        before_value = json.dumps({"trust_status": "unreviewed"})
        self.connection.execute(
            """INSERT INTO admin_audit_log
               (id,actor_user_id,entity_type,entity_id,action,before_value)
               VALUES (?,?,?,?,?,?)""",
            ("audit-1", "admin-1", "post", "post-1", "post_update", before_value),
        )
        stored = self.connection.execute(
            "SELECT before_value FROM admin_audit_log WHERE id='audit-1'"
        ).fetchone()[0]
        self.assertEqual({"trust_status": "unreviewed"}, json.loads(stored))


if __name__ == "__main__":
    unittest.main()
