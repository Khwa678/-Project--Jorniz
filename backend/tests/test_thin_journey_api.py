import io
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
 user_type TEXT NOT NULL,system_role TEXT NOT NULL,avatar_url TEXT,bio TEXT,hu_coins INTEGER DEFAULT 0,coins INTEGER DEFAULT 0,
 is_banned INTEGER DEFAULT 0,account_status TEXT DEFAULT 'active',created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE user_sessions (id TEXT PRIMARY KEY,user_id TEXT,device_info TEXT,ip_address TEXT,refresh_token TEXT UNIQUE,is_revoked INTEGER DEFAULT 0,created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE posts (id TEXT PRIMARY KEY,creator_user_id TEXT,title TEXT DEFAULT '',content TEXT,hashtags TEXT DEFAULT '',trust_status TEXT DEFAULT 'unreviewed',category TEXT,media_url TEXT,media_type TEXT,likes INTEGER DEFAULT 0,likes_count INTEGER DEFAULT 0,views INTEGER DEFAULT 0,shares INTEGER DEFAULT 0,created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE post_actions (id TEXT PRIMARY KEY,post_id TEXT,user_id TEXT,action_type TEXT,action_value TEXT,request_id TEXT UNIQUE,created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);
CREATE UNIQUE INDEX uq_post_action_state ON post_actions(post_id,user_id,action_type) WHERE action_type IN ('reaction','save','view');
CREATE TABLE creator_analytics (id TEXT PRIMARY KEY,user_id TEXT,post_id TEXT,engagement_count INTEGER DEFAULT 0);
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
        from services.hardened_rewards import install_hardened_rewards
        dependencies = vars(main).copy()
        dependencies["get_db"] = get_test_db
        install_hardened_rewards(dependencies)
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

    def test_post_image_create_replace_and_delete(self):
        class BlobResult:
            def __init__(self, url):
                self.url = url

        class FakeBlobClient:
            upload_number = 0
            deleted_urls = []

            def __init__(self, token):
                self.token = token

            def __enter__(self):
                return self

            def __exit__(self, *_args):
                return False

            def put(self, pathname, _data, **_options):
                FakeBlobClient.upload_number += 1
                url = f"https://test.public.blob.vercel-storage.com/{pathname}-{FakeBlobClient.upload_number}"
                return BlobResult(url)

            def delete(self, url):
                FakeBlobClient.deleted_urls.append(url)

        original_token = main.BLOB_READ_WRITE_TOKEN
        original_client = main.BlobClient
        main.BLOB_READ_WRITE_TOKEN = "test-blob-token"
        main.BlobClient = FakeBlobClient
        try:
            user_id = "image-author"
            session_id = "image-author-session"
            connection = sqlite3.connect(self.db_path)
            connection.execute(
                "INSERT INTO users (id,name,email,password,user_type,system_role,account_status) VALUES (?,?,?,?,?,?,?)",
                (user_id, "Image Author", "image-author@example.com", "unused", "general_user", "member", "active"),
            )
            connection.execute(
                "INSERT INTO user_sessions (id,user_id,is_revoked) VALUES (?,?,0)",
                (session_id, user_id),
            )
            connection.commit()
            connection.close()
            headers = self.auth(main.make_token(user_id, session_id))
            created = self.client.post(
                "/api/posts/create",
                data={"content": "Image post", "media": (io.BytesIO(b"first-image"), "first.png")},
                headers=headers,
            )
            self.assertEqual(201, created.status_code, created.get_json())
            first_url = created.get_json()["media_url"]
            self.assertTrue(first_url.startswith("https://test.public.blob.vercel-storage.com/"))

            post_id = created.get_json()["id"]
            updated = self.client.put(
                f"/api/posts/{post_id}",
                data={"content": "Updated image post", "media": (io.BytesIO(b"second-image"), "second.png")},
                headers=headers,
            )
            self.assertEqual(200, updated.status_code, updated.get_json())
            second_url = updated.get_json()["media_url"]
            self.assertNotEqual(first_url, second_url)
            self.assertIn(first_url, FakeBlobClient.deleted_urls)

            deleted = self.client.delete(f"/api/posts/{post_id}", headers=headers)
            self.assertEqual(200, deleted.status_code, deleted.get_json())
            self.assertTrue(deleted.get_json()["media_deleted"])
            self.assertIn(second_url, FakeBlobClient.deleted_urls)
        finally:
            main.BLOB_READ_WRITE_TOKEN = original_token
            main.BlobClient = original_client

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
