import importlib.util
import sqlite3
import unittest
from pathlib import Path


BACKEND_DIR = Path(__file__).resolve().parents[1]


def load_migration(name: str, filename: str):
    path = BACKEND_DIR / "migrations" / filename
    spec = importlib.util.spec_from_file_location(name, path)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"Unable to load {filename}")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


ADDITIVE = load_migration("migration_009_test_setup", "009_canonicalize_users_and_doctors.py")
CLEANUP = load_migration("migration_010", "010_remove_legacy_user_doctor_fields.py")


SCHEMA = """
CREATE TABLE users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    specialty TEXT,
    hospital TEXT,
    bio TEXT,
    avatar_url TEXT,
    is_verified INTEGER DEFAULT 0,
    balance REAL DEFAULT 0,
    hu_coins INTEGER,
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
    fee REAL DEFAULT 500,
    avatar TEXT,
    bio TEXT
);
CREATE TABLE creator_verifications (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    category TEXT NOT NULL,
    document_url TEXT NOT NULL,
    status TEXT DEFAULT 'Pending',
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
"""


class LegacyUserDoctorCleanupMigrationTest(unittest.TestCase):
    def setUp(self):
        self.connection = sqlite3.connect(":memory:")
        self.connection.row_factory = sqlite3.Row
        self.connection.executescript(SCHEMA)

    def tearDown(self):
        self.connection.close()

    def prepare_additive_schema(self):
        ADDITIVE.migrate_connection(self.connection, "sqlite")

    def test_removes_legacy_fields_after_preserving_doctor_data(self):
        self.connection.execute(
            """INSERT INTO users
               (id,name,email,specialty,hospital,avatar_url,hu_coins,coins,user_type,system_role)
               VALUES (?,?,?,?,?,?,?,?,?,?)""",
            ("doctor-1", "Dr. Example", "doctor@example.com", "Cardiology", "Hospital", None, 10, 10, "general_user", "member"),
        )
        self.connection.execute(
            "INSERT INTO doctors (id,user_id,name,specialty,avatar) VALUES (?,?,?,?,?)",
            ("profile-1", "doctor-1", "Dr. Example", "Cardiology", "https://images.example/doctor.jpg"),
        )
        self.prepare_additive_schema()

        self.assertTrue(CLEANUP.migrate_connection(self.connection, "sqlite"))

        user = self.connection.execute(
            "SELECT avatar_url,user_type FROM users WHERE id='doctor-1'"
        ).fetchone()
        self.assertEqual("https://images.example/doctor.jpg", user["avatar_url"])
        self.assertEqual("doctor", user["user_type"])

        user_columns = {row[1] for row in self.connection.execute("PRAGMA table_info(users)")}
        doctor_columns = {row[1] for row in self.connection.execute("PRAGMA table_info(doctors)")}
        self.assertFalse(set(ADDITIVE.USER_COLUMNS_TO_DROP) & user_columns)
        self.assertFalse(set(ADDITIVE.DOCTOR_COLUMNS_TO_DROP) & doctor_columns)
        self.assertNotIn("avatar", doctor_columns)
        self.assertFalse(CLEANUP.migrate_connection(self.connection, "sqlite"))

    def test_refuses_conflicting_avatar_values(self):
        self.connection.execute(
            """INSERT INTO users
               (id,name,email,specialty,avatar_url,hu_coins,coins,user_type,system_role)
               VALUES (?,?,?,?,?,?,?,?,?)""",
            ("doctor-1", "Dr. Example", "doctor@example.com", "Cardiology", "https://images.example/user.jpg", 0, 0, "doctor", "member"),
        )
        self.connection.execute(
            "INSERT INTO doctors (id,user_id,name,specialty,avatar) VALUES (?,?,?,?,?)",
            ("profile-1", "doctor-1", "Dr. Example", "Cardiology", "https://images.example/doctor.jpg"),
        )
        self.prepare_additive_schema()

        with self.assertRaisesRegex(RuntimeError, "doctor-1"):
            CLEANUP.migrate_connection(self.connection, "sqlite")

    def test_refuses_conflicting_coin_projection(self):
        self.connection.execute(
            """INSERT INTO users
               (id,name,email,hu_coins,coins,user_type,system_role)
               VALUES (?,?,?,?,?,?,?)""",
            ("coin-conflict", "Coin Conflict", "coins@example.com", 10, 20, "general_user", "member"),
        )
        self.prepare_additive_schema()

        with self.assertRaisesRegex(RuntimeError, "conflicting users.hu_coins"):
            CLEANUP.migrate_connection(self.connection, "sqlite")

    def test_refuses_nonzero_legacy_money_balance(self):
        self.connection.execute(
            """INSERT INTO users
               (id,name,email,hu_coins,balance,user_type,system_role)
               VALUES (?,?,?,?,?,?,?)""",
            ("money-balance", "Money Balance", "money@example.com", 0, 15, "general_user", "member"),
        )
        self.prepare_additive_schema()

        with self.assertRaisesRegex(RuntimeError, "no canonical money destination"):
            CLEANUP.migrate_connection(self.connection, "sqlite")


if __name__ == "__main__":
    unittest.main()
