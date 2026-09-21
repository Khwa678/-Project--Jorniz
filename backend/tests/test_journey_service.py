import sqlite3
import sys
import tempfile
import unittest
from pathlib import Path


sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from services.journey_service import (  # noqa: E402
    JourneyConflict,
    cancel_order,
    canonical_cart_upsert,
    checkout,
    checkout_result_replay,
    require_cancellable_order,
    stable_idempotency_key,
)


SCHEMA = """
CREATE TABLE users (id TEXT PRIMARY KEY, hu_coins INTEGER NOT NULL);
CREATE TABLE products (
  id TEXT PRIMARY KEY, name TEXT NOT NULL, price REAL NOT NULL, stock INTEGER NOT NULL,
  reward_coins_earn INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE cart (
  id TEXT PRIMARY KEY, user_id TEXT NOT NULL, product_id TEXT NOT NULL,
  quantity INTEGER NOT NULL, price REAL NOT NULL
);
CREATE TABLE orders (
  id TEXT PRIMARY KEY, user_id TEXT NOT NULL, total_amount REAL NOT NULL,
  wallet_spent REAL DEFAULT 0, gateway_spent REAL DEFAULT 0,
  coins_spent INTEGER DEFAULT 0, coins_discount REAL DEFAULT 0,
  coins_earned INTEGER DEFAULT 0, refund_status TEXT DEFAULT 'None',
  status TEXT DEFAULT 'Confirmed', shipping_address TEXT, payment_method TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE order_items (
  id TEXT PRIMARY KEY, order_id TEXT NOT NULL, product_id TEXT NOT NULL,
  quantity INTEGER NOT NULL, price REAL NOT NULL
);
CREATE TABLE wallet_ledger (
  id TEXT PRIMARY KEY, user_id TEXT NOT NULL, credit_debit TEXT NOT NULL,
  value_type TEXT NOT NULL, amount REAL NOT NULL, source_type TEXT NOT NULL,
  source_id TEXT, idempotency_key TEXT UNIQUE NOT NULL,
  balance_before REAL NOT NULL, balance_after REAL NOT NULL,
  status TEXT NOT NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
"""


class JourneyServiceTest(unittest.TestCase):
    def setUp(self):
        self.temp_dir = tempfile.TemporaryDirectory()
        self.connection = sqlite3.connect(Path(self.temp_dir.name) / "journey.db")
        self.connection.row_factory = sqlite3.Row
        self.connection.executescript(SCHEMA)
        self.connection.execute("INSERT INTO users VALUES ('u1',100)")
        self.connection.execute(
            "INSERT INTO products VALUES ('p1','Protein',20,5,3)"
        )
        self.connection.commit()

    def tearDown(self):
        self.connection.close()
        self.temp_dir.cleanup()

    def scalar(self, statement, params=()):
        return self.connection.execute(statement, params).fetchone()[0]

    def test_stable_key_and_canonical_cart_upsert(self):
        first = stable_idempotency_key("checkout", "u1", "browser-key")
        self.assertEqual(first, stable_idempotency_key("checkout", "u1", "browser-key"))
        self.assertNotEqual(first, stable_idempotency_key("checkout", "u1", "other-key"))

        canonical_cart_upsert(self.connection, "u1", "p1", 1)
        item = canonical_cart_upsert(self.connection, "u1", "p1", 2)
        self.assertEqual(item["quantity"], 3)
        self.assertEqual(self.scalar("SELECT COUNT(*) FROM cart"), 1)
        self.assertEqual(self.scalar("SELECT price FROM cart"), 20)

    def test_checkout_replay_and_cancel_refund_once(self):
        canonical_cart_upsert(self.connection, "u1", "p1", 2)
        placed = checkout(self.connection, "u1", "Delhi", True, "checkout-1")

        self.assertFalse(placed["idempotent_replay"])
        self.assertEqual(placed["total_amount"], 40)
        self.assertEqual(placed["coins_spent"], 100)
        self.assertEqual(placed["coins_earned"], 6)
        self.assertEqual(placed["new_hu_coins"], 6)
        self.assertEqual(self.scalar("SELECT stock FROM products WHERE id='p1'"), 3)
        self.assertEqual(self.scalar("SELECT COUNT(*) FROM orders"), 1)
        self.assertEqual(self.scalar("SELECT COUNT(*) FROM wallet_ledger"), 2)
        self.assertEqual(self.scalar("SELECT COUNT(*) FROM cart"), 0)

        replay = checkout(self.connection, "u1", "Ignored", True, "checkout-1")
        direct_replay = checkout_result_replay(self.connection, "u1", "checkout-1")
        self.assertTrue(replay["idempotent_replay"])
        self.assertEqual(replay["order_id"], placed["order_id"])
        self.assertEqual(direct_replay["order_id"], placed["order_id"])
        self.assertEqual(self.scalar("SELECT stock FROM products WHERE id='p1'"), 3)
        self.assertEqual(self.scalar("SELECT COUNT(*) FROM wallet_ledger"), 2)

        cancelled = cancel_order(self.connection, "u1", placed["order_id"])
        self.assertFalse(cancelled["idempotent_replay"])
        self.assertEqual(cancelled["refunded_coins"], 100)
        self.assertEqual(cancelled["reversed_coins"], 6)
        self.assertEqual(cancelled["new_hu_coins"], 100)
        self.assertEqual(self.scalar("SELECT stock FROM products WHERE id='p1'"), 5)
        self.assertEqual(self.scalar("SELECT COUNT(*) FROM wallet_ledger"), 4)

        cancel_replay = cancel_order(self.connection, "u1", placed["order_id"])
        self.assertTrue(cancel_replay["idempotent_replay"])
        self.assertEqual(self.scalar("SELECT stock FROM products WHERE id='p1'"), 5)
        self.assertEqual(self.scalar("SELECT COUNT(*) FROM wallet_ledger"), 4)

    def test_failed_stock_guard_rolls_back_checkout(self):
        self.connection.execute("INSERT INTO cart VALUES ('c1','u1','p1',2,20)")
        self.connection.execute("UPDATE products SET stock=1 WHERE id='p1'")
        self.connection.commit()

        with self.assertRaises(JourneyConflict):
            checkout(self.connection, "u1", "Delhi", True, "checkout-fail")

        self.assertEqual(self.scalar("SELECT hu_coins FROM users WHERE id='u1'"), 100)
        self.assertEqual(self.scalar("SELECT stock FROM products WHERE id='p1'"), 1)
        self.assertEqual(self.scalar("SELECT COUNT(*) FROM orders"), 0)
        self.assertEqual(self.scalar("SELECT COUNT(*) FROM wallet_ledger"), 0)
        self.assertEqual(self.scalar("SELECT COUNT(*) FROM cart"), 1)

    def test_cancellation_state_check(self):
        with self.assertRaises(JourneyConflict):
            require_cancellable_order({"status": "Delivered"})
        self.assertFalse(require_cancellable_order({"status": "Cancelled"}))


if __name__ == "__main__":
    unittest.main(verbosity=2)
