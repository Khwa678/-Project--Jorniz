"""Transaction-scoped canonical HU Coin ledger operations."""

from dataclasses import dataclass
from decimal import Decimal, InvalidOperation
import sqlite3
import uuid


VALUE_TYPE = "reward_coin"
POSTED_STATUSES = ("available", "settled", "spent", "reversed")


class WalletError(Exception):
    """Base wallet failure."""


class WalletUserNotFound(WalletError):
    pass


class InvalidCoinAmount(WalletError):
    pass


class InsufficientCoins(WalletError):
    pass


class IdempotencyConflict(WalletError):
    pass


@dataclass(frozen=True)
class WalletResult:
    entry_id: str
    balance: int
    amount: int
    direction: str
    action: str
    created: bool


def _sql(conn, statement):
    return statement.replace("%s", "?") if isinstance(conn, sqlite3.Connection) else statement


def _execute(conn, statement, params=()):
    cursor = conn.cursor()
    cursor.execute(_sql(conn, statement), params)
    return cursor


def _one(conn, statement, params=()):
    row = _execute(conn, statement, params).fetchone()
    return dict(row) if row else None


def _coin_amount(value):
    try:
        amount = Decimal(str(value))
    except (InvalidOperation, TypeError, ValueError) as exc:
        raise InvalidCoinAmount("HU Coin amount must be a whole number") from exc
    if not amount.is_finite() or amount <= 0 or amount != amount.to_integral_value():
        raise InvalidCoinAmount("HU Coin amount must be a positive whole number")
    return int(amount)


def _required(value, name):
    text = str(value or "").strip()
    if not text:
        raise WalletError(f"{name} is required")
    return text


def _lock_user(conn, user_id):
    suffix = "" if isinstance(conn, sqlite3.Connection) else " FOR UPDATE"
    if not _one(conn, "SELECT id FROM users WHERE id=%s" + suffix, (user_id,)):
        raise WalletUserNotFound("Wallet user not found")


def balance(conn, user_id):
    marks = ",".join(["%s"] * len(POSTED_STATUSES))
    row = _one(
        conn,
        f"""SELECT COALESCE(SUM(CASE WHEN UPPER(credit_debit)='CREDIT' THEN amount ELSE -amount END),0) AS balance
            FROM wallet_ledger
            WHERE user_id=%s AND value_type=%s AND LOWER(status) IN ({marks})""",
        (user_id, VALUE_TYPE, *POSTED_STATUSES),
    )
    return int(Decimal(str(row["balance"] if row else 0)))


def _result(row, current_balance, created):
    return WalletResult(
        entry_id=str(row["id"]),
        balance=current_balance,
        amount=int(Decimal(str(row["amount"]))),
        direction=str(row["credit_debit"]).upper(),
        action=str(row["action"]).lower(),
        created=created,
    )


def _validate_replay(row, user_id, direction, amount, action, source_type, source_id):
    expected = (
        str(user_id), direction, amount, action, str(source_type), str(source_id), VALUE_TYPE
    )
    actual = (
        str(row["user_id"]), str(row["credit_debit"]).upper(), int(Decimal(str(row["amount"]))),
        str(row["action"]).lower(), str(row["source_type"]), str(row["source_id"]),
        str(row["value_type"]),
    )
    if actual != expected:
        raise IdempotencyConflict("Idempotency key is already used for another wallet event")


def _apply(
    conn, user_id, direction, amount, source_type, source_id, idempotency_key,
    action, reversal_of_id=None,
):
    user_id = _required(user_id, "user_id")
    source_type = _required(source_type, "source_type")
    source_id = _required(source_id, "source_id")
    idempotency_key = _required(idempotency_key, "idempotency_key")
    amount = _coin_amount(amount)
    direction = direction.upper()
    action = action.lower()
    _lock_user(conn, user_id)

    existing = _one(conn, "SELECT * FROM wallet_ledger WHERE idempotency_key=%s", (idempotency_key,))
    if existing:
        _validate_replay(existing, user_id, direction, amount, action, source_type, source_id)
        return _result(existing, balance(conn, user_id), False)

    before = balance(conn, user_id)
    after = before + amount if direction == "CREDIT" else before - amount
    if after < 0:
        raise InsufficientCoins("Insufficient HU Coins")

    entry_id = "led_" + uuid.uuid4().hex
    _execute(
        conn,
        """INSERT INTO wallet_ledger
           (id,user_id,credit_debit,value_type,amount,currency,source_type,source_id,
            idempotency_key,balance_before,balance_after,status,action,reversal_of_id)
           VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)""",
        (
            entry_id, user_id, direction, VALUE_TYPE, amount, "HU_COIN", source_type,
            source_id, idempotency_key, before, after, "available", action, reversal_of_id,
        ),
    )
    _execute(conn, "UPDATE users SET hu_coins=%s WHERE id=%s", (after, user_id))
    return WalletResult(entry_id, after, amount, direction, action, True)


def credit(conn, user_id, amount, source_type, source_id, idempotency_key):
    return _apply(conn, user_id, "CREDIT", amount, source_type, source_id, idempotency_key, "credit")


def debit(conn, user_id, amount, source_type, source_id, idempotency_key):
    return _apply(conn, user_id, "DEBIT", amount, source_type, source_id, idempotency_key, "debit")


def _counter(conn, user_id, original_entry_id, idempotency_key, action, source_type, source_id):
    user_id = _required(user_id, "user_id")
    original_entry_id = _required(original_entry_id, "original_entry_id")
    _lock_user(conn, user_id)
    original = _one(
        conn,
        "SELECT * FROM wallet_ledger WHERE id=%s AND user_id=%s AND value_type=%s",
        (original_entry_id, user_id, VALUE_TYPE),
    )
    if not original:
        raise WalletError("Original wallet entry not found")
    expected_direction = "CREDIT" if action == "reverse" else "DEBIT"
    if str(original["credit_debit"]).upper() != expected_direction:
        raise WalletError(f"Only a {expected_direction.lower()} entry can be {action}d")

    previous = _one(
        conn,
        "SELECT * FROM wallet_ledger WHERE reversal_of_id=%s AND action=%s",
        (original_entry_id, action),
    )
    if previous and str(previous["idempotency_key"]) != str(idempotency_key):
        raise IdempotencyConflict(f"Wallet entry is already {action}d")

    direction = "DEBIT" if action == "reverse" else "CREDIT"
    return _apply(
        conn, user_id, direction, original["amount"], source_type,
        source_id or original["source_id"], idempotency_key, action, original_entry_id,
    )


def reverse(
    conn, user_id, original_entry_id, idempotency_key,
    source_type="REWARD_REVERSAL", source_id=None,
):
    return _counter(
        conn, user_id, original_entry_id, idempotency_key,
        "reverse", source_type, source_id,
    )


def refund(
    conn, user_id, original_entry_id, idempotency_key,
    source_type="REWARD_REFUND", source_id=None,
):
    return _counter(
        conn, user_id, original_entry_id, idempotency_key,
        "refund", source_type, source_id,
    )
