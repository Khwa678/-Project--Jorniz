import io
import sqlite3
import tempfile
import unittest
from pathlib import Path

from flask import Flask

from app.modules.auth.routes import create_auth_blueprint
from app.modules.auth.service import AuthDependencies


SCHEMA = """
CREATE TABLE users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    user_type TEXT NOT NULL,
    system_role TEXT NOT NULL,
    hu_coins INTEGER DEFAULT 0
);
CREATE TABLE doctors (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    name TEXT NOT NULL,
    specialty TEXT NOT NULL,
    hospital TEXT,
    bio TEXT,
    verification_document_url TEXT,
    verification_status TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
CREATE TABLE user_sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    refresh_token TEXT NOT NULL
);
"""


class SignupDoctorFlowTest(unittest.TestCase):
    def setUp(self):
        self.temp_dir = tempfile.TemporaryDirectory()
        self.db_path = Path(self.temp_dir.name) / "signup.db"
        connection = sqlite3.connect(self.db_path)
        connection.executescript(SCHEMA)
        connection.close()

        def get_db():
            connection = sqlite3.connect(self.db_path)
            connection.row_factory = sqlite3.Row
            return connection

        def db_one(sql, params=()):
            connection = get_db()
            try:
                row = connection.execute(sql.replace("%s", "?"), params).fetchone()
                return dict(row) if row else None
            finally:
                connection.close()

        def db_exec(connection, sql, params=()):
            return connection.execute(sql.replace("%s", "?"), params)

        def create_session(user_id, connection=None):
            session_id = f"session-{user_id}"
            refresh_token = f"refresh-{user_id}"
            db_exec(
                connection,
                "INSERT INTO user_sessions (id,user_id,refresh_token) VALUES (%s,%s,%s)",
                (session_id, user_id, refresh_token),
            )
            return session_id, refresh_token

        def user_payload(user):
            payload = dict(user)
            payload.pop("password", None)
            if payload["user_type"] == "doctor":
                payload["profile"] = db_one(
                    "SELECT specialty FROM doctors WHERE user_id=%s",
                    (payload["id"],),
                )
            else:
                payload["profile"] = {}
            return payload

        dependencies = AuthDependencies(
            db_one=db_one,
            get_db=get_db,
            db_exec=db_exec,
            create_session=create_session,
            make_token=lambda user_id, session_id: f"token-{user_id}-{session_id}",
            user_payload=user_payload,
            normalize_user_type=lambda value: str(value or "").strip().lower(),
            upload_verification_document=lambda _content, filename, _content_type: (
                f"https://files.example/{filename}"
            ),
            allowed_user_types={"general_user", "doctor"},
            allowed_docs={"application/pdf"},
            max_file_bytes=1024 * 1024,
        )
        app = Flask(__name__)
        app.register_blueprint(create_auth_blueprint(dependencies))
        app.config.update(TESTING=True)
        self.client = app.test_client()

    def tearDown(self):
        self.temp_dir.cleanup()

    def rows(self, sql, params=()):
        connection = sqlite3.connect(self.db_path)
        connection.row_factory = sqlite3.Row
        try:
            return [dict(row) for row in connection.execute(sql, params).fetchall()]
        finally:
            connection.close()

    def test_doctor_signup_creates_member_and_one_linked_doctor_profile(self):
        response = self.client.post(
            "/api/auth/signup",
            data={
                "name": "Dr. Test",
                "email": "doctor@example.com",
                "password": "secret12",
                "user_type": "doctor",
                "specialty": "Cardiology",
                "verification_doc": (io.BytesIO(b"license"), "license.pdf"),
            },
            content_type="multipart/form-data",
        )

        self.assertEqual(201, response.status_code, response.get_json())
        users = self.rows(
            "SELECT id,user_type,system_role FROM users WHERE email=?",
            ("doctor@example.com",),
        )
        self.assertEqual(1, len(users))
        self.assertEqual("doctor", users[0]["user_type"])
        self.assertEqual("member", users[0]["system_role"])

        doctors = self.rows(
            "SELECT user_id,specialty FROM doctors WHERE user_id=?",
            (users[0]["id"],),
        )
        self.assertEqual(
            [{"user_id": users[0]["id"], "specialty": "Cardiology"}],
            doctors,
        )
        self.assertEqual("Cardiology", response.get_json()["user"]["profile"]["specialty"])

    def test_general_signup_ignores_doctor_specialty_and_creates_no_doctor_profile(self):
        response = self.client.post(
            "/api/auth/signup",
            json={
                "name": "General Test",
                "email": "member@example.com",
                "password": "secret12",
                "user_type": "general_user",
                "specialty": "Cardiology",
            },
        )

        self.assertEqual(201, response.status_code, response.get_json())
        users = self.rows(
            "SELECT id,user_type,system_role FROM users WHERE email=?",
            ("member@example.com",),
        )
        self.assertEqual(1, len(users))
        self.assertEqual("general_user", users[0]["user_type"])
        self.assertEqual("member", users[0]["system_role"])
        self.assertEqual([], self.rows("SELECT * FROM doctors"))

    def test_doctor_signup_requires_specialty(self):
        response = self.client.post(
            "/api/auth/signup",
            data={
                "name": "Doctor Without Specialty",
                "email": "missing-specialty@example.com",
                "password": "secret12",
                "user_type": "doctor",
                "verification_doc": (io.BytesIO(b"license"), "license.pdf"),
            },
            content_type="multipart/form-data",
        )

        self.assertEqual(400, response.status_code, response.get_json())
        self.assertEqual("Specialty is required for doctor accounts", response.get_json()["detail"])
        self.assertEqual([], self.rows("SELECT * FROM users"))
        self.assertEqual([], self.rows("SELECT * FROM doctors"))


if __name__ == "__main__":
    unittest.main()
