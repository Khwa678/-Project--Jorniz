"""Transactional helpers for the Section 7 commerce journey."""

from contextlib import contextmanager
from decimal import Decimal, ROUND_DOWN
import hashlib
import sqlite3
import uuid


class JourneyError(Exception):
    pass


class JourneyNotFound(JourneyError):
    pass


class JourneyConflict(JourneyError):
    pass


def _is_sqlite(connection):
    return isinstance(connection, sqlite3.Connection)


def _execute(connection, statement, params=()):
    cursor = connection.cursor()
    cursor.execute(statement.replace("%s", "?") if _is_sqlite(connection) else statement, params)
    return cursor


def _row(cursor):
    value = cursor.fetchone()
    if value is None:
        return None
    if hasattr(value, "keys"):
        return dict(value)
    return dict(zip((column[0] for column in cursor.description), value))


def _rows(cursor):
    columns = [column[0] for column in cursor.description]
    return [dict(value) if hasattr(value, "keys") else dict(zip(columns, value)) for value in cursor.fetchall()]


def _locked(connection, statement):
    return statement if _is_sqlite(connection) else statement + " FOR UPDATE"


@contextmanager
def transaction(connection):
    try:
        if _is_sqlite(connection) and not connection.in_transaction:
            connection.execute("BEGIN IMMEDIATE")
        yield
        connection.commit()
    except Exception:
        connection.rollback()
        raise


def stable_idempotency_key(scope, user_id, request_key):
    scope = str(scope or "").strip().lower()
    user_id = str(user_id or "").strip()
    request_key = str(request_key or "").strip()
    if not scope or not user_id or not request_key:
        raise JourneyError("scope, user_id, and idempotency key are required")
    digest = hashlib.sha256(f"{scope}:{user_id}:{request_key}".encode()).hexdigest()
    return f"{scope}:{digest}"


def _stable_id(prefix, value):
    return f"{prefix}_{hashlib.sha256(value.encode()).hexdigest()[:24]}"


def canonical_cart_upsert(connection, user_id, product_id, quantity=1):
    """Add quantity while retaining one cart row and the current server price."""
    quantity = int(quantity)
    if quantity <= 0:
        raise JourneyError("quantity must be positive")

    with transaction(connection):
        product = _row(_execute(
            connection,
            _locked(connection, "SELECT id,price,stock FROM products WHERE id=%s"),
            (product_id,),
        ))
        if not product:
            raise JourneyNotFound("product not found")

        existing = _rows(_execute(
            connection,
            "SELECT id,quantity FROM cart WHERE user_id=%s AND product_id=%s ORDER BY id",
            (user_id, product_id),
        ))
        final_quantity = quantity + sum(int(item["quantity"]) for item in existing)
        if final_quantity > int(product["stock"]):
            raise JourneyConflict("insufficient stock")

        if existing:
            keeper = existing[0]["id"]
            _execute(connection, "UPDATE cart SET quantity=%s,price=%s WHERE id=%s",
                     (final_quantity, product["price"], keeper))
            for duplicate in existing[1:]:
                _execute(connection, "DELETE FROM cart WHERE id=%s", (duplicate["id"],))
            cart_id = keeper
        else:
            cart_id = "cart_" + uuid.uuid4().hex
            _execute(connection,
                     "INSERT INTO cart (id,user_id,product_id,quantity,price) VALUES (%s,%s,%s,%s,%s)",
                     (cart_id, user_id, product_id, final_quantity, product["price"]))

    return {"id": cart_id, "user_id": user_id, "product_id": product_id,
            "quantity": final_quantity, "price": float(product["price"])}


def guarded_stock_deduction(connection, product_id, quantity):
    quantity = int(quantity)
    if quantity <= 0:
        raise JourneyError("quantity must be positive")
    cursor = _execute(
        connection,
        "UPDATE products SET stock=stock-%s WHERE id=%s AND stock>=%s",
        (quantity, product_id, quantity),
    )
    if cursor.rowcount != 1:
        raise JourneyConflict("product is unavailable or has insufficient stock")


def _ledger(connection, user_id, direction, amount, source_type, order_id,
            idempotency_key, before, after):
    if not amount:
        return
    _execute(connection, """INSERT INTO wallet_ledger
        (id,user_id,credit_debit,value_type,amount,source_type,source_id,
         idempotency_key,balance_before,balance_after,status)
        VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)""",
        (_stable_id("led", idempotency_key), user_id, direction, "HU Coins", amount,
         source_type, order_id, idempotency_key, before, after, "Settled"))


def _order_id(key):
    return _stable_id("ord", key)


def _checkout_result(connection, order, key, replay):
    order_id = order["id"]
    balance = None
    for suffix in ("earn", "redeem"):
        item = _row(_execute(connection,
                            "SELECT balance_after FROM wallet_ledger WHERE idempotency_key=%s",
                            (f"checkout:{order_id}:{suffix}",)))
        if item:
            balance = item["balance_after"]
            break
    if balance is None:
        user = _row(_execute(connection, "SELECT hu_coins FROM users WHERE id=%s", (order["user_id"],)))
        balance = user["hu_coins"] if user else 0
    return {
        "message": "Order replayed" if replay else "Order placed successfully",
        "order_id": order_id,
        "idempotency_key": key,
        "idempotent_replay": replay,
        "total_amount": float(order["total_amount"]),
        "coins_spent": int(order.get("coins_spent") or 0),
        "coins_discount": float(order.get("coins_discount") or 0),
        "coins_earned": int(order.get("coins_earned") or 0),
        "gateway_spent": float(order.get("gateway_spent") or 0),
        "status": order["status"],
        "new_hu_coins": int(balance),
    }


def checkout_result_replay(connection, user_id, idempotency_key):
    key = stable_idempotency_key("checkout", user_id, idempotency_key)
    order = _row(_execute(connection, "SELECT * FROM orders WHERE id=%s AND user_id=%s",
                          (_order_id(key), user_id)))
    return _checkout_result(connection, order, key, True) if order else None


def checkout(connection, user_id, address, use_coins, idempotency_key):
    key = stable_idempotency_key("checkout", user_id, idempotency_key)
    order_id = _order_id(key)

    with transaction(connection):
        user = _row(_execute(connection,
                             _locked(connection, "SELECT id,hu_coins FROM users WHERE id=%s"),
                             (user_id,)))
        if not user:
            raise JourneyNotFound("user not found")

        existing = _row(_execute(
            connection,
            _locked(connection, "SELECT * FROM orders WHERE id=%s AND user_id=%s"),
            (order_id, user_id),
        ))
        if existing:
            return _checkout_result(connection, existing, key, True)

        cart = _rows(_execute(connection, _locked(connection, """SELECT
            c.id,c.product_id,c.quantity,p.price,p.stock,p.reward_coins_earn
            FROM cart c JOIN products p ON p.id=c.product_id
            WHERE c.user_id=%s ORDER BY c.id"""), (user_id,)))
        if not cart:
            raise JourneyConflict("cart is empty")

        total = sum(Decimal(str(item["price"])) * int(item["quantity"]) for item in cart)
        total = total.quantize(Decimal("0.01"))
        available_coins = int(user.get("hu_coins") or 0)
        coin_limit = int((total * Decimal("5")).to_integral_value(rounding=ROUND_DOWN))
        coins_spent = min(available_coins, coin_limit) if use_coins else 0
        coin_discount = (Decimal(coins_spent) / Decimal("10")).quantize(Decimal("0.01"))
        gateway_spent = max(Decimal("0"), total - coin_discount)
        coins_earned = sum(int(item["quantity"]) * int(item.get("reward_coins_earn") or 0) for item in cart)

        for item in cart:
            guarded_stock_deduction(connection, item["product_id"], item["quantity"])

        _execute(connection, """INSERT INTO orders
            (id,user_id,total_amount,wallet_spent,gateway_spent,coins_spent,
             coins_discount,coins_earned,status,shipping_address,payment_method)
            VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)""",
            (order_id, user_id, float(total), 0.0, float(gateway_spent), coins_spent,
             float(coin_discount), coins_earned, "Confirmed", address or "Standard Address",
             "HU_Coins+Gateway"))
        for item in cart:
            _execute(connection, """INSERT INTO order_items
                (id,order_id,product_id,quantity,price) VALUES (%s,%s,%s,%s,%s)""",
                ("item_" + uuid.uuid4().hex, order_id, item["product_id"],
                 item["quantity"], item["price"]))

        after_debit = available_coins - coins_spent
        final_balance = after_debit + coins_earned
        _ledger(connection, user_id, "DEBIT", coins_spent,
                "ECOMMERCE_CHECKOUT_REDEMPTION", order_id,
                f"checkout:{order_id}:redeem", available_coins, after_debit)
        _ledger(connection, user_id, "CREDIT", coins_earned,
                "ECOMMERCE_ORDER_REWARD", order_id,
                f"checkout:{order_id}:earn", after_debit, final_balance)
        _execute(connection, "UPDATE users SET hu_coins=%s,coins=%s WHERE id=%s",
                 (final_balance, final_balance, user_id))
        _execute(connection, "DELETE FROM cart WHERE user_id=%s", (user_id,))
        order = _row(_execute(connection, "SELECT * FROM orders WHERE id=%s", (order_id,)))

    return _checkout_result(connection, order, key, False)


def require_cancellable_order(order):
    status = str(order.get("status") or "")
    if status == "Cancelled":
        return False
    if status not in {"Confirmed", "Processing"}:
        raise JourneyConflict(f"order in {status or 'unknown'} state cannot be cancelled")
    return True


def _cancel_result(connection, order, replay):
    order_id = order["id"]
    balance = None
    for suffix in ("reversal", "refund"):
        item = _row(_execute(connection,
                            "SELECT balance_after FROM wallet_ledger WHERE idempotency_key=%s",
                            (f"cancel:{order_id}:{suffix}",)))
        if item:
            balance = item["balance_after"]
            break
    if balance is None:
        user = _row(_execute(connection, "SELECT hu_coins FROM users WHERE id=%s", (order["user_id"],)))
        balance = user["hu_coins"] if user else 0
    return {
        "message": "Cancellation replayed" if replay else "Order cancelled",
        "order_id": order_id,
        "status": "Cancelled",
        "refund_status": order.get("refund_status") or "CoinsRefunded",
        "refunded_coins": int(order.get("coins_spent") or 0),
        "reversed_coins": int(order.get("coins_earned") or 0),
        "new_hu_coins": int(balance),
        "idempotent_replay": replay,
    }


def cancel_order(connection, user_id, order_id):
    with transaction(connection):
        order = _row(_execute(connection,
                              _locked(connection, "SELECT * FROM orders WHERE id=%s AND user_id=%s"),
                              (order_id, user_id)))
        if not order:
            raise JourneyNotFound("order not found")
        if not require_cancellable_order(order):
            return _cancel_result(connection, order, True)

        user = _row(_execute(connection,
                             _locked(connection, "SELECT id,hu_coins FROM users WHERE id=%s"),
                             (user_id,)))
        if not user:
            raise JourneyNotFound("user not found")

        items = _rows(_execute(connection,
                               "SELECT product_id,quantity FROM order_items WHERE order_id=%s",
                               (order_id,)))
        for item in items:
            _execute(connection, "UPDATE products SET stock=stock+%s WHERE id=%s",
                     (item["quantity"], item["product_id"]))

        before = int(user.get("hu_coins") or 0)
        refunded = int(order.get("coins_spent") or 0)
        reversed_reward = int(order.get("coins_earned") or 0)
        after_refund = before + refunded
        final_balance = after_refund - reversed_reward
        _ledger(connection, user_id, "CREDIT", refunded, "ORDER_CANCEL_COIN_REFUND",
                order_id, f"cancel:{order_id}:refund", before, after_refund)
        _ledger(connection, user_id, "DEBIT", reversed_reward, "ORDER_CANCEL_COIN_REVERSAL",
                order_id, f"cancel:{order_id}:reversal", after_refund, final_balance)
        _execute(connection, "UPDATE users SET hu_coins=%s,coins=%s WHERE id=%s",
                 (final_balance, final_balance, user_id))

        refund_status = "CoinsRefundedGatewayPending" if float(order.get("gateway_spent") or 0) else "CoinsRefunded"
        changed = _execute(connection, """UPDATE orders SET status=%s,refund_status=%s
            WHERE id=%s AND user_id=%s AND status=%s""",
            ("Cancelled", refund_status, order_id, user_id, order["status"]))
        if changed.rowcount != 1:
            raise JourneyConflict("order state changed during cancellation")
        order["status"] = "Cancelled"
        order["refund_status"] = refund_status

    return _cancel_result(connection, order, False)


checkout_cart = checkout

