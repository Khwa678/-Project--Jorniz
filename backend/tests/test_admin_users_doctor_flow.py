import sqlite3
import tempfile
import unittest
from functools import wraps
from pathlib import Path

from flask import Flask, request

from app.modules.users.routes import create_users_blueprint
from app.modules.users.service import UserManagementDependencies


SCHEMA = """
CREATE TABLE users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    user_type TEXT NOT NULL,
    system_role TEXT NOT NULL,
    hu_coins INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE doctors (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    name TEXT NOT NULL,
    specialty TEXT NOT NULL,
    verification_status TEXT DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
CREATE TABLE user_sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL
);
"""


class AdminUsersDoctorFlowTest(unittest.TestCase):
    def setUp(self):
        self.temp_dir = tempfile.TemporaryDirectory()
        self.db_path = Path(self.temp_dir.name) / "admin-users.db"
        connection = sqlite3.connect(self.db_path)
        connection.executescript(SCHEMA)
        connection.execute(
            "INSERT INTO users (id,name,email,password,user_type,system_role) VALUES (?,?,?,?,?,?)",
            ("user-1", "Jorniz Member", "member@example.com", "unused", "general_user", "member"),
        )
        connection.commit()
        connection.close()

        def get_db():
            value = sqlite3.connect(self.db_path)
            value.row_factory = sqlite3.Row
            return value

        def db_exec(connection, sql, params=()):
            return connection.execute(sql.replace("%s", "?"), params)

        def require_admin(handler):
            @wraps(handler)
            def decorated(*args, **kwargs):
                request.current_user = {"id": "admin-1", "system_role": "super_admin"}
                return handler(*args, **kwargs)

            return decorated

        dependencies = UserManagementDependencies(
            get_db=get_db,
            db_exec=db_exec,
            require_admin=require_admin,
            allowed_user_types={"general_user", "doctor"},
            allowed_system_roles={"member", "admin", "super_admin"},
        )
        app = Flask(__name__)
        app.register_blueprint(create_users_blueprint(dependencies))
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

    def test_changing_account_to_doctor_creates_linked_profile(self):
        response = self.client.patch(
            "/api/admin/users/user-1",
            json={"user_type": "doctor", "specialty": "Cardiology"},
        )

        self.assertEqual(200, response.status_code, response.get_json())
        self.assertEqual("doctor", response.get_json()["user"]["user_type"])
        self.assertEqual("Cardiology", response.get_json()["user"]["specialty"])
        self.assertEqual(
            [{"user_id": "user-1", "name": "Jorniz Member", "specialty": "Cardiology"}],
            self.rows("SELECT user_id,name,specialty FROM doctors WHERE user_id=?", ("user-1",)),
        )

    def test_existing_doctor_profile_is_updated_by_user_id(self):
        connection = sqlite3.connect(self.db_path)
        connection.execute("UPDATE users SET user_type='doctor' WHERE id='user-1'")
        connection.execute(
            "INSERT INTO doctors (id,user_id,name,specialty) VALUES (?,?,?,?)",
            ("doctor-1", "user-1", "Old Name", "General Medicine"),
        )
        connection.commit()
        connection.close()

        response = self.client.patch(
            "/api/admin/users/user-1",
            json={"name": "Dr. Jorniz Member", "specialty": "Neurology"},
        )

        self.assertEqual(200, response.status_code, response.get_json())
        self.assertEqual(
            [{"name": "Dr. Jorniz Member", "specialty": "Neurology"}],
            self.rows("SELECT name,specialty FROM doctors WHERE user_id=?", ("user-1",)),
        )

    def test_doctor_without_profile_requires_specialty_before_repair(self):
        connection = sqlite3.connect(self.db_path)
        connection.execute("UPDATE users SET user_type='doctor' WHERE id='user-1'")
        connection.commit()
        connection.close()

        rejected = self.client.patch("/api/admin/users/user-1", json={"name": "Doctor Without Profile"})
        repaired = self.client.patch(
            "/api/admin/users/user-1",
            json={"specialty": "Dentistry"},
        )

        self.assertEqual(400, rejected.status_code, rejected.get_json())
        self.assertEqual("Specialty is required for doctor accounts", rejected.get_json()["detail"])
        self.assertEqual(200, repaired.status_code, repaired.get_json())
        self.assertEqual(
            [{"specialty": "Dentistry"}],
            self.rows("SELECT specialty FROM doctors WHERE user_id=?", ("user-1",)),
        )

    def test_changing_away_from_doctor_removes_profile(self):
        connection = sqlite3.connect(self.db_path)
        connection.execute("UPDATE users SET user_type='doctor' WHERE id='user-1'")
        connection.execute(
            "INSERT INTO doctors (id,user_id,name,specialty) VALUES (?,?,?,?)",
            ("doctor-1", "user-1", "Jorniz Member", "Cardiology"),
        )
        connection.commit()
        connection.close()

        response = self.client.patch(
            "/api/admin/users/user-1",
            json={"user_type": "general_user"},
        )

        self.assertEqual(200, response.status_code, response.get_json())
        self.assertEqual("general_user", response.get_json()["user"]["user_type"])
        self.assertIsNone(response.get_json()["user"]["specialty"])
        self.assertEqual([], self.rows("SELECT id FROM doctors WHERE user_id=?", ("user-1",)))

    def test_create_bulk_update_and_delete_users(self):
        first = self.client.post(
            "/api/admin/users",
            json={
                "name": "First Member",
                "email": "first@example.com",
                "password": "secret1",
                "user_type": "general_user",
                "system_role": "member",
            },
        )
        second = self.client.post(
            "/api/admin/users",
            json={
                "name": "Second Member",
                "email": "second@example.com",
                "password": "secret2",
                "user_type": "general_user",
                "system_role": "member",
            },
        )
        self.assertEqual(201, first.status_code, first.get_json())
        self.assertEqual(201, second.status_code, second.get_json())
        first_id = first.get_json()["user"]["id"]
        second_id = second.get_json()["user"]["id"]

        updated = self.client.patch(
            "/api/admin/users",
            json={
                "updates": [
                    {"id": first_id, "name": "First Updated"},
                    {"id": second_id, "user_type": "doctor", "specialty": "Neurology"},
                ]
            },
        )
        self.assertEqual(200, updated.status_code, updated.get_json())
        self.assertEqual(2, updated.get_json()["updated_count"])

        deleted = self.client.delete(
            "/api/admin/users",
            json={"user_ids": [first_id, second_id]},
        )
        self.assertEqual(200, deleted.status_code, deleted.get_json())
        self.assertEqual(2, deleted.get_json()["deleted_count"])
        self.assertEqual(
            [],
            self.rows(
                "SELECT id FROM users WHERE id IN (?,?)", (first_id, second_id)
            ),
        )


if __name__ == "__main__":
    unittest.main()
