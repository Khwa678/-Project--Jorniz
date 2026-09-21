import os
import sqlite3
import sys
import tempfile
import unittest
from pathlib import Path


BACKEND_DIR = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(BACKEND_DIR))
os.environ.setdefault("SECRET_KEY", "profile-update-test-secret")
os.environ.setdefault("DATABASE_URL", "")

import main  # noqa: E402


SCHEMA = """
CREATE TABLE users (
 id TEXT PRIMARY KEY,name TEXT NOT NULL,email TEXT UNIQUE NOT NULL,password TEXT NOT NULL,
 user_type TEXT NOT NULL,system_role TEXT NOT NULL,avatar_url TEXT,bio TEXT,
 verification_status TEXT DEFAULT 'not_required',is_verified INTEGER DEFAULT 0,
 is_banned INTEGER DEFAULT 0,account_status TEXT DEFAULT 'active',created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE user_sessions (
 id TEXT PRIMARY KEY,user_id TEXT,device_info TEXT,ip_address TEXT,refresh_token TEXT UNIQUE,
 is_revoked INTEGER DEFAULT 0,created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE doctors (
 id TEXT PRIMARY KEY,user_id TEXT,name TEXT NOT NULL,specialty TEXT NOT NULL,qualification TEXT,
 experience_years INTEGER DEFAULT 5,fee REAL DEFAULT 500,rating REAL DEFAULT 4.9,reviews_count INTEGER DEFAULT 120,
 hospital TEXT,location TEXT,bio TEXT,available_days TEXT,registration_number TEXT,jurisdiction TEXT,
 verification_document_url TEXT,verification_status TEXT DEFAULT 'pending',verified_by TEXT,verified_at TIMESTAMP,
 consultation_fee REAL,created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 FOREIGN KEY(user_id) REFERENCES users(id)
);
"""


class ProfileUpdateApiTest(unittest.TestCase):
    def setUp(self):
        self.temp_dir = tempfile.TemporaryDirectory()
        self.db_path = Path(self.temp_dir.name) / "profile.db"
        connection = sqlite3.connect(self.db_path)
        connection.executescript(SCHEMA)
        connection.execute(
            "INSERT INTO users (id,name,email,password,user_type,system_role) VALUES (?,?,?,?,?,?)",
            ("user-1", "Jorniz Member", "member@example.com", "unused", "general_user", "member"),
        )
        connection.execute(
            "INSERT INTO user_sessions (id,user_id,is_revoked) VALUES (?,?,0)",
            ("session-1", "user-1"),
        )
        connection.commit()
        connection.close()

        def get_test_db():
            value = sqlite3.connect(self.db_path)
            value.row_factory = sqlite3.Row
            return value

        self.original_get_db = main.get_db
        main.get_db = get_test_db
        main.app.config.update(TESTING=True)
        self.client = main.app.test_client()
        self.headers = {"Authorization": "Bearer " + main.make_token("user-1", "session-1")}

    def tearDown(self):
        main.get_db = self.original_get_db
        self.temp_dir.cleanup()

    def row(self, sql, params=()):
        connection = sqlite3.connect(self.db_path)
        connection.row_factory = sqlite3.Row
        try:
            result = connection.execute(sql, params).fetchone()
            return dict(result) if result else None
        finally:
            connection.close()

    def test_converting_to_doctor_creates_profile(self):
        response = self.client.put(
            "/api/auth/update",
            data={
                "name": "Dr. Jorniz Member",
                "user_type": "doctor",
                "specialty": "Cardiology",
                "hospital": "Jorniz Hospital",
                "location": "Indore",
                "bio": "Preventive care specialist.",
            },
            headers=self.headers,
            content_type="multipart/form-data",
        )

        self.assertEqual(200, response.status_code, response.get_json())
        response_user = response.get_json()["user"]
        self.assertEqual("doctor", response_user["user_type"])
        self.assertEqual("Cardiology", response_user["profile"]["specialty"])
        self.assertEqual("Jorniz Hospital", response_user["profile"]["hospital"])
        self.assertEqual("Indore", response_user["profile"]["location"])
        doctor = self.row("SELECT * FROM doctors WHERE user_id=?", ("user-1",))
        self.assertEqual("Cardiology", doctor["specialty"])
        self.assertEqual("Jorniz Hospital", doctor["hospital"])
        self.assertEqual("Indore", doctor["location"])

    def test_existing_doctor_profile_is_updated_without_duplicate(self):
        connection = sqlite3.connect(self.db_path)
        connection.execute("UPDATE users SET user_type='doctor' WHERE id='user-1'")
        connection.execute(
            "INSERT INTO doctors (id,user_id,name,specialty) VALUES (?,?,?,?)",
            ("doctor-1", "user-1", "Jorniz Member", "General Medicine"),
        )
        connection.commit()
        connection.close()

        response = self.client.put(
            "/api/auth/update",
            data={"name": "Jorniz Member", "user_type": "doctor", "specialty": "Neurology"},
            headers=self.headers,
            content_type="multipart/form-data",
        )

        self.assertEqual(200, response.status_code, response.get_json())
        doctor = self.row("SELECT COUNT(*) AS total,MAX(specialty) AS specialty FROM doctors WHERE user_id=?", ("user-1",))
        self.assertEqual(1, doctor["total"])
        self.assertEqual("Neurology", doctor["specialty"])

    def test_changing_doctor_to_non_doctor_removes_profile(self):
        connection = sqlite3.connect(self.db_path)
        connection.execute("UPDATE users SET user_type='doctor' WHERE id='user-1'")
        connection.execute(
            "INSERT INTO doctors (id,user_id,name,specialty) VALUES (?,?,?,?)",
            ("doctor-1", "user-1", "Jorniz Member", "General Medicine"),
        )
        connection.commit()
        connection.close()

        response = self.client.put(
            "/api/auth/update",
            data={"name": "Jorniz Member", "user_type": "general_user"},
            headers=self.headers,
            content_type="multipart/form-data",
        )

        self.assertEqual(200, response.status_code, response.get_json())
        self.assertEqual("general_user", response.get_json()["user"]["user_type"])
        self.assertIsNone(self.row("SELECT id FROM doctors WHERE user_id=?", ("user-1",)))

    def test_doctor_account_requires_specialty(self):
        response = self.client.put(
            "/api/auth/update",
            data={"name": "Jorniz Member", "user_type": "doctor", "specialty": ""},
            headers=self.headers,
            content_type="multipart/form-data",
        )

        self.assertEqual(400, response.status_code, response.get_json())
        self.assertEqual("Specialty is required for doctor accounts", response.get_json()["detail"])
        self.assertEqual("general_user", self.row("SELECT user_type FROM users WHERE id=?", ("user-1",))["user_type"])
        self.assertIsNone(self.row("SELECT id FROM doctors WHERE user_id=?", ("user-1",)))

    def test_doctor_directory_uses_the_linked_user_avatar(self):
        connection = sqlite3.connect(self.db_path)
        connection.execute(
            "UPDATE users SET user_type='doctor',avatar_url=? WHERE id='user-1'",
            ("https://images.example/dr-jorniz.jpg",),
        )
        connection.execute(
            "INSERT INTO doctors (id,user_id,name,specialty,verification_status) VALUES (?,?,?,?,?)",
            ("doctor-1", "user-1", "Dr. Jorniz Member", "Cardiology", "approved"),
        )
        connection.commit()
        connection.close()

        response = self.client.get("/api/doctors")

        self.assertEqual(200, response.status_code, response.get_json())
        self.assertEqual("https://images.example/dr-jorniz.jpg", response.get_json()[0]["avatar_url"])
        self.assertNotIn("avatar", response.get_json()[0])


if __name__ == "__main__":
    unittest.main()
