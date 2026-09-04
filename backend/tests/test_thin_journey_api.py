import os
import sqlite3
import sys
import tempfile
import unittest
from pathlib import Path


BACKEND_DIR = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(BACKEND_DIR))
os.environ.setdefault("SECRET_KEY", "thin-journey-test-secret")
os.environ.setdefault("DATABASE_URL", "")

import main  # noqa: E402


SCHEMA = """
CREATE TABLE users (
 id TEXT PRIMARY KEY,name TEXT NOT NULL,email TEXT UNIQUE NOT NULL,password TEXT NOT NULL,
 user_type TEXT NOT NULL,system_role TEXT NOT NULL,avatar_url TEXT,bio TEXT,hu_coins INTEGER DEFAULT 0,
 is_banned INTEGER DEFAULT 0,account_status TEXT DEFAULT 'active',created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE user_sessions (id TEXT PRIMARY KEY,user_id TEXT,device_info TEXT,ip_address TEXT,refresh_token TEXT UNIQUE,is_revoked INTEGER DEFAULT 0,created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE posts (id TEXT PRIMARY KEY,user_id TEXT,content TEXT,category TEXT,media_url TEXT,media_type TEXT,likes INTEGER DEFAULT 0,likes_count INTEGER DEFAULT 0,views INTEGER DEFAULT 0,shares INTEGER DEFAULT 0,created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE post_comments (id TEXT PRIMARY KEY,post_id TEXT,user_id TEXT,content TEXT,created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE post_likes (id TEXT PRIMARY KEY,post_id TEXT,user_id TEXT,created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE notifications (id TEXT PRIMARY KEY,user_id TEXT,actor_id TEXT,type TEXT,post_id TEXT,message TEXT,is_read INTEGER DEFAULT 0,created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE wallet_ledger (id TEXT PRIMARY KEY,user_id TEXT,credit_debit TEXT,value_type TEXT,amount NUMERIC,currency TEXT,source_type TEXT,source_id TEXT,idempotency_key TEXT UNIQUE,balance_before NUMERIC,balance_after NUMERIC,status TEXT,action TEXT,reversal_of_id TEXT,created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);
CREATE UNIQUE INDEX uq_wallet_counter ON wallet_ledger(reversal_of_id,action) WHERE reversal_of_id IS NOT NULL;
CREATE TABLE connections (id TEXT PRIMARY KEY,requester_id TEXT,receiver_id TEXT,status TEXT,pair_key TEXT UNIQUE,created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE products (id TEXT PRIMARY KEY,name TEXT,price REAL,stock INTEGER,image_url TEXT,reward_coins_earn INTEGER DEFAULT 0,max_coin_redemption_percent INTEGER DEFAULT 50);
CREATE TABLE cart (id TEXT PRIMARY KEY,user_id TEXT,product_id TEXT,quantity INTEGER,price REAL,UNIQUE(user_id,product_id));
CREATE TABLE orders (id TEXT PRIMARY KEY,user_id TEXT,total_amount REAL,wallet_spent REAL DEFAULT 0,gateway_spent REAL DEFAULT 0,coins_spent INTEGER DEFAULT 0,coins_discount REAL DEFAULT 0,coins_earned INTEGER DEFAULT 0,refund_status TEXT DEFAULT 'None',status TEXT DEFAULT 'Confirmed',shipping_address TEXT,payment_method TEXT,idempotency_key TEXT,payment_status TEXT,gateway_refund_status TEXT,created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE order_items (id TEXT PRIMARY KEY,order_id TEXT,product_id TEXT,quantity INTEGER,price REAL);
"""


class ThinJourneyApiTest(unittest.TestCase):
    def setUp(self):
        self.temp_dir = tempfile.TemporaryDirectory()
        self.db_path = Path(self.temp_dir.name) / "journey.db"
        connection = sqlite3.connect(self.db_path)
        connection.executescript(SCHEMA)
        connection.execute("INSERT INTO products VALUES ('p1','Journey Product',1,5,'',2,100)")
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

    def tearDown(self):
        main.get_db = self.original_get_db
        self.temp_dir.cleanup()

    def signup(self, name, email):
        response = self.client.post("/api/auth/signup", json={
            "name": name, "email": email, "password": "secret12", "user_type": "general_user",
        })
        self.assertEqual(201, response.status_code, response.get_json())
        return response.get_json()

    @staticmethod
    def auth(token, **headers):
        return {"Authorization": "Bearer " + token, **headers}

    def test_signup_post_connection_checkout_cancel_journey(self):
        first = self.signup("First User", "first@example.com")
        second = self.signup("Second User", "second@example.com")
        first_headers = self.auth(first["access_token"])
        second_headers = self.auth(second["access_token"])

        created = self.client.post(
            "/api/posts/create", data={"content": "A persisted post"},
            headers=self.auth(first["access_token"], **{"Idempotency-Key": "post-one"}),
        )
        self.assertEqual(201, created.status_code, created.get_json())
        self.assertEqual(10, created.get_json()["reward_earned"])
        replay = self.client.post(
            "/api/posts/create", data={"content": "A persisted post"},
            headers=self.auth(first["access_token"], **{"Idempotency-Key": "post-one"}),
        )
        self.assertEqual(200, replay.status_code)

        feed = self.client.get("/api/posts", headers=second_headers)
        self.assertEqual(200, feed.status_code, feed.get_json())
        self.assertIn(created.get_json()["id"], [post["id"] for post in feed.get_json()])

        request_result = self.client.post(
            "/api/connections/request", json={"receiver_id": second["user"]["id"]}, headers=first_headers,
        )
        self.assertEqual(201, request_result.status_code, request_result.get_json())
        connection_id = request_result.get_json()["connection_id"]
        accepted = self.client.post(f"/api/connections/{connection_id}/accept", headers=second_headers)
        self.assertEqual(200, accepted.status_code, accepted.get_json())
        accepted_replay = self.client.post(f"/api/connections/{connection_id}/accept", headers=second_headers)
        self.assertTrue(accepted_replay.get_json()["idempotent_replay"])

        added = self.client.post("/api/cart/add", json={"product_id": "p1", "quantity": 1}, headers=first_headers)
        self.assertEqual(201, added.status_code, added.get_json())
        checkout_headers = self.auth(first["access_token"], **{"Idempotency-Key": "checkout-one"})
        checkout = self.client.post("/api/checkout", json={"use_coins": True}, headers=checkout_headers)
        self.assertEqual(201, checkout.status_code, checkout.get_json())
        order_id = checkout.get_json()["order_id"]
        checkout_replay = self.client.post("/api/checkout", json={"use_coins": True}, headers=checkout_headers)
        self.assertTrue(checkout_replay.get_json()["idempotent_replay"])

        cancelled = self.client.post(f"/api/orders/{order_id}/cancel", headers=first_headers)
        self.assertEqual(200, cancelled.status_code, cancelled.get_json())
        cancel_replay = self.client.post(f"/api/orders/{order_id}/cancel", headers=first_headers)
        self.assertTrue(cancel_replay.get_json()["idempotent_replay"])

        connection = sqlite3.connect(self.db_path)
        try:
            self.assertEqual(1, connection.execute("SELECT COUNT(*) FROM posts").fetchone()[0])
            self.assertEqual(1, connection.execute("SELECT COUNT(*) FROM connections").fetchone()[0])
            self.assertEqual(1, connection.execute("SELECT COUNT(*) FROM orders").fetchone()[0])
            self.assertEqual(5, connection.execute("SELECT stock FROM products WHERE id='p1'").fetchone()[0])
            self.assertEqual(10, connection.execute("SELECT hu_coins FROM users WHERE id=?", (first["user"]["id"],)).fetchone()[0])
        finally:
            connection.close()


if __name__ == "__main__":
    unittest.main(verbosity=2)
