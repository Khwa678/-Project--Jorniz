import sqlite3
import sys
import tempfile
import unittest
from pathlib import Path


BACKEND_DIR = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(BACKEND_DIR))

from services import wallet_service as wallet


class WalletServiceTests(unittest.TestCase):
    def setUp(self):
        self.temp_dir = tempfile.TemporaryDirectory()
        self.db_path = Path(self.temp_dir.name) / "wallet.db"
        self.conn = sqlite3.connect(self.db_path)
        self.conn.row_factory = sqlite3.Row
        self.conn.executescript("""
            CREATE TABLE users (
                id TEXT PRIMARY KEY,
                hu_coins INTEGER NOT NULL DEFAULT 0,
                coins INTEGER NOT NULL DEFAULT 77
            );
            CREATE TABLE wallet_ledger (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                credit_debit TEXT NOT NULL,
                value_type TEXT NOT NULL,
                amount NUMERIC NOT NULL,
                currency TEXT,
                source_type TEXT NOT NULL,
                source_id TEXT NOT NULL,
                idempotency_key TEXT NOT NULL UNIQUE,
                balance_before NUMERIC NOT NULL,
                balance_after NUMERIC NOT NULL,
                status TEXT NOT NULL,
                action TEXT NOT NULL,
                reversal_of_id TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
            CREATE UNIQUE INDEX uq_wallet_counter
            ON wallet_ledger(reversal_of_id,action) WHERE reversal_of_id IS NOT NULL;
            INSERT INTO users (id) VALUES ('user_1');
        """)
        self.conn.commit()

    def tearDown(self):
        self.conn.close()
        self.temp_dir.cleanup()

    def credit(self, amount=10, key="post:1"):
        with self.conn:
            return wallet.credit(self.conn, "user_1", amount, "SOCIAL_POST_REWARD", "post_1", key)

    def test_credit_is_canonical_and_only_updates_hu_coin_projection(self):
        result = self.credit()
        user = self.conn.execute("SELECT hu_coins,coins FROM users WHERE id='user_1'").fetchone()
        self.assertTrue(result.created)
        self.assertEqual(10, result.balance)
        self.assertEqual(10, wallet.balance(self.conn, "user_1"))
        self.assertEqual((10, 77), tuple(user))

    def test_credit_replay_is_idempotent_and_returns_current_balance(self):
        first = self.credit()
        with self.conn:
            wallet.credit(self.conn, "user_1", 5, "BONUS", "bonus_1", "bonus:1")
        replay = self.credit()
        count = self.conn.execute("SELECT COUNT(*) FROM wallet_ledger WHERE idempotency_key='post:1'").fetchone()[0]
        self.assertEqual(first.entry_id, replay.entry_id)
        self.assertFalse(replay.created)
        self.assertEqual(15, replay.balance)
        self.assertEqual(1, count)

    def test_idempotency_key_rejects_different_event(self):
        self.credit()
        with self.assertRaises(wallet.IdempotencyConflict):
            with self.conn:
                wallet.credit(self.conn, "user_1", 11, "SOCIAL_POST_REWARD", "post_1", "post:1")

    def test_debit_rejects_negative_balance_without_writing(self):
        self.credit(8)
        with self.assertRaises(wallet.InsufficientCoins):
            with self.conn:
                wallet.debit(self.conn, "user_1", 9, "CHECKOUT", "order_1", "checkout:1")
        self.assertEqual(8, wallet.balance(self.conn, "user_1"))
        self.assertEqual(1, self.conn.execute("SELECT COUNT(*) FROM wallet_ledger").fetchone()[0])

    def test_reverse_credit_once(self):
        original = self.credit()
        with self.conn:
            reversed_entry = wallet.reverse(
                self.conn, "user_1", original.entry_id, "cancel:reward:1",
                source_type="ORDER_CANCEL_REWARD_REVERSAL", source_id="order_1",
            )
        with self.conn:
            replay = wallet.reverse(
                self.conn, "user_1", original.entry_id, "cancel:reward:1",
                source_type="ORDER_CANCEL_REWARD_REVERSAL", source_id="order_1",
            )
        self.assertEqual(0, reversed_entry.balance)
        self.assertFalse(replay.created)
        self.assertEqual(original.entry_id, self.conn.execute(
            "SELECT reversal_of_id FROM wallet_ledger WHERE action='reverse'"
        ).fetchone()[0])

    def test_refund_restores_original_debit_once(self):
        self.credit(20)
        with self.conn:
            debit = wallet.debit(self.conn, "user_1", 7, "CHECKOUT", "order_1", "checkout:1")
        with self.conn:
            refunded = wallet.refund(
                self.conn, "user_1", debit.entry_id, "cancel:refund:1",
                source_type="ORDER_CANCEL_COIN_REFUND", source_id="order_1",
            )
        self.assertEqual(20, refunded.balance)
        self.assertEqual(20, wallet.balance(self.conn, "user_1"))

    def test_service_leaves_commit_and_rollback_to_caller(self):
        wallet.credit(self.conn, "user_1", 4, "SOCIAL_POST_REWARD", "post_2", "post:2")
        observer = sqlite3.connect(self.db_path)
        try:
            self.assertEqual(0, observer.execute("SELECT COUNT(*) FROM wallet_ledger").fetchone()[0])
        finally:
            observer.close()
        self.conn.rollback()
        self.assertEqual(0, wallet.balance(self.conn, "user_1"))


if __name__ == "__main__":
    unittest.main()
