import os
import sqlite3
import tempfile
import unittest
from functools import wraps

from flask import Flask, request

from app.modules.rewards import AdminRewardDependencies, create_rewards_blueprint
from services.wallet_service import credit, debit, reverse_entry


SCHEMA = """
CREATE TABLE users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    system_role TEXT NOT NULL,
    hu_coins INTEGER NOT NULL DEFAULT 0
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
    actor_user_id TEXT,
    reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE admin_audit_log (
    id TEXT PRIMARY KEY,
    actor_user_id TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    action TEXT NOT NULL,
    before_value TEXT,
    after_value TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
"""


class AdminRewardsApiTests(unittest.TestCase):
    def setUp(self):
        handle, self.db_path = tempfile.mkstemp(suffix=".sqlite3")
        os.close(handle)
        conn = sqlite3.connect(self.db_path)
        conn.executescript(SCHEMA)
        conn.executemany(
            "INSERT INTO users (id,name,email,system_role,hu_coins) VALUES (?,?,?,?,?)",
            [
                ("admin-1", "Admin User", "admin@example.com", "admin", 0),
                ("finance-1", "Finance User", "finance@example.com", "finance_admin", 0),
                ("member-1", "Member One", "one@example.com", "member", 100),
                ("member-2", "Member Two", "two@example.com", "member", 30),
            ],
        )
        conn.executemany(
            """INSERT INTO wallet_ledger
               (id,user_id,credit_debit,value_type,amount,currency,source_type,source_id,
                idempotency_key,balance_before,balance_after,status,action,created_at)
               VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)""",
            [
                ("old-1", "member-1", "CREDIT", "reward_coin", 100, "HU_COIN", "WELCOME", "welcome-1", "welcome-1", 0, 100, "available", "credit", "2026-01-01 10:00:00"),
                ("new-2", "member-2", "CREDIT", "reward_coin", 30, "HU_COIN", "POST", "post-1", "post-1", 0, 30, "available", "credit", "2026-01-02 10:00:00"),
            ],
        )
        conn.commit()
        conn.close()

        def get_db():
            connection = sqlite3.connect(self.db_path)
            connection.row_factory = sqlite3.Row
            return connection

        def db_exec(connection, sql, params=()):
            return connection.execute(sql.replace("%s", "?"), params)

        def require_admin(handler):
            @wraps(handler)
            def decorated(*args, **kwargs):
                role = request.headers.get("X-Test-Role", "admin")
                if role not in {"admin", "finance_admin", "super_admin"}:
                    return {"detail": "Admin access required"}, 403
                actor_id = "finance-1" if role == "finance_admin" else "admin-1"
                request.current_user = {"id": actor_id, "system_role": role}
                return handler(*args, **kwargs)

            return decorated

        dependencies = AdminRewardDependencies(
            get_db=get_db,
            db_exec=db_exec,
            require_admin=require_admin,
            wallet_credit=credit,
            wallet_debit=debit,
            wallet_reverse_entry=reverse_entry,
        )
        app = Flask(__name__)
        app.register_blueprint(create_rewards_blueprint(dependencies))
        app.config.update(TESTING=True)
        self.client = app.test_client()

    def tearDown(self):
        os.unlink(self.db_path)

    def rows(self, sql, params=()):
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        try:
            return [dict(row) for row in conn.execute(sql, params).fetchall()]
        finally:
            conn.close()

    def test_ledger_is_recent_first_and_filters_multiple_users(self):
        response = self.client.get(
            "/api/admin/rewards/ledger?user_ids=member-1,member-2&page=1&page_size=10"
        )
        self.assertEqual(200, response.status_code)
        body = response.get_json()
        self.assertEqual(["new-2", "old-1"], [item["id"] for item in body["items"]])
        self.assertEqual(30, body["items"][0]["current_balance"])
        self.assertEqual("Member Two", body["items"][0]["user_name"])

    def test_ledger_supports_search_direction_and_source_filters(self):
        response = self.client.get(
            "/api/admin/rewards/ledger?q=member%20one&direction=CREDIT&source_type=WELCOME"
        )
        self.assertEqual(200, response.status_code)
        self.assertEqual(["old-1"], [item["id"] for item in response.get_json()["items"]])

    def test_credit_is_audited_and_idempotent(self):
        payload = {
            "user_id": "member-1",
            "direction": "CREDIT",
            "amount": 25,
            "reason": "Helpful contribution",
            "request_id": "adjust-1",
            "actor_user_id": "forged-user",
        }
        first = self.client.post("/api/admin/rewards/adjustments", json=payload)
        second = self.client.post("/api/admin/rewards/adjustments", json=payload)
        self.assertEqual(201, first.status_code, first.get_json())
        self.assertEqual(200, second.status_code, second.get_json())
        self.assertEqual("admin-1", first.get_json()["entry"]["actor_user_id"])
        self.assertEqual(125, first.get_json()["entry"]["current_balance"])
        self.assertEqual(1, len(self.rows("SELECT * FROM wallet_ledger WHERE idempotency_key='adjust-1'")))
        self.assertEqual(1, len(self.rows("SELECT * FROM admin_audit_log")))

    def test_debit_rejects_negative_balance_and_requires_reason(self):
        no_reason = self.client.post(
            "/api/admin/rewards/adjustments",
            json={"user_id": "member-2", "direction": "DEBIT", "amount": 1, "request_id": "d-1"},
        )
        too_large = self.client.post(
            "/api/admin/rewards/adjustments",
            json={"user_id": "member-2", "direction": "DEBIT", "amount": 31, "reason": "Correction", "request_id": "d-2"},
        )
        self.assertEqual(400, no_reason.status_code)
        self.assertEqual(409, too_large.status_code)
        self.assertEqual(30, self.rows("SELECT hu_coins FROM users WHERE id='member-2'")[0]["hu_coins"])

    def test_only_finance_roles_can_reverse_and_reversal_runs_once(self):
        created = self.client.post(
            "/api/admin/rewards/adjustments",
            json={"user_id": "member-1", "direction": "DEBIT", "amount": 10, "reason": "Correction", "request_id": "debit-1"},
        ).get_json()["entry"]
        forbidden = self.client.post(
            f"/api/admin/rewards/adjustments/{created['id']}/reverse",
            json={"reason": "Undo", "request_id": "reverse-1"},
        )
        first = self.client.post(
            f"/api/admin/rewards/adjustments/{created['id']}/reverse",
            headers={"X-Test-Role": "finance_admin"},
            json={"reason": "Undo", "request_id": "reverse-1"},
        )
        replay = self.client.post(
            f"/api/admin/rewards/adjustments/{created['id']}/reverse",
            headers={"X-Test-Role": "finance_admin"},
            json={"reason": "Undo", "request_id": "reverse-1"},
        )
        duplicate = self.client.post(
            f"/api/admin/rewards/adjustments/{created['id']}/reverse",
            headers={"X-Test-Role": "finance_admin"},
            json={"reason": "Undo again", "request_id": "reverse-2"},
        )
        self.assertEqual(403, forbidden.status_code)
        self.assertEqual(201, first.status_code, first.get_json())
        self.assertEqual(200, replay.status_code, replay.get_json())
        self.assertEqual(409, duplicate.status_code)
        self.assertEqual(100, first.get_json()["entry"]["current_balance"])
        ledger = self.client.get("/api/admin/rewards/ledger").get_json()["items"]
        original = next(item for item in ledger if item["id"] == created["id"])
        self.assertFalse(original["can_reverse"])
        self.assertEqual(first.get_json()["entry"]["id"], original["reversed_by_id"])

    def test_finance_admin_can_correct_with_reversal_and_replacement(self):
        created = self.client.post(
            "/api/admin/rewards/adjustments",
            json={
                "user_id": "member-1",
                "source_type": "ADMIN_REWARD",
                "amount": 25,
                "reason": "Initial adjustment",
                "request_id": "correct-source-1",
            },
        ).get_json()["entry"]

        corrected = self.client.post(
            f"/api/admin/rewards/adjustments/{created['id']}/correct",
            headers={"X-Test-Role": "finance_admin"},
            json={
                "source_type": "ADMIN_REVOCATION",
                "amount": 5,
                "reason": "Corrected adjustment",
                "request_id": "correct-1",
            },
        )

        self.assertEqual(201, corrected.status_code, corrected.get_json())
        body = corrected.get_json()
        self.assertEqual(created["id"], body["reversal"]["reversal_of_id"])
        self.assertEqual("ADMIN_REVOCATION", body["entry"]["source_type"])
        self.assertEqual(95, body["entry"]["current_balance"])
        self.assertEqual(
            3,
            len(
                self.rows(
                    "SELECT * FROM wallet_ledger "
                    "WHERE user_id='member-1' AND actor_user_id IS NOT NULL"
                )
            ),
        )

    def test_summary_reports_projection_mismatches(self):
        conn = sqlite3.connect(self.db_path)
        conn.execute("UPDATE users SET hu_coins=35 WHERE id='member-2'")
        conn.commit()
        conn.close()
        response = self.client.get("/api/admin/rewards/summary")
        self.assertEqual(200, response.status_code)
        body = response.get_json()
        self.assertEqual(135, body["current_user_balances"])
        self.assertEqual(130, body["credits"])
        self.assertEqual(0, body["debits"])
        self.assertEqual(1, body["balance_mismatches"])


if __name__ == "__main__":
    unittest.main()
