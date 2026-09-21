"""Direct-SQL persistence for administrator reward management."""

from decimal import Decimal
import json
import sqlite3
import uuid

from .constants import ADMIN_ADJUSTMENT_SOURCES


LEDGER_FIELDS = (
    "id",
    "user_id",
    "credit_debit",
    "value_type",
    "amount",
    "currency",
    "source_type",
    "source_id",
    "idempotency_key",
    "balance_before",
    "balance_after",
    "status",
    "action",
    "reversal_of_id",
    "actor_user_id",
    "reason",
    "created_at",
    "user_name",
    "user_email",
    "actor_name",
    "actor_email",
    "current_balance",
    "reversed_by_id",
    "can_reverse",
)

LEDGER_SELECT = """
SELECT
    wl.id,
    wl.user_id,
    wl.credit_debit,
    wl.value_type,
    wl.amount,
    wl.currency,
    wl.source_type,
    wl.source_id,
    wl.idempotency_key,
    wl.balance_before,
    wl.balance_after,
    wl.status,
    wl.action,
    wl.reversal_of_id,
    wl.actor_user_id,
    wl.reason,
    wl.created_at,
    recipient.name AS user_name,
    recipient.email AS user_email,
    actor.name AS actor_name,
    actor.email AS actor_email,
    recipient.hu_coins AS current_balance,
    (SELECT reversal.id
       FROM wallet_ledger reversal
      WHERE reversal.reversal_of_id=wl.id
      ORDER BY reversal.created_at DESC,reversal.id DESC
      LIMIT 1) AS reversed_by_id
FROM wallet_ledger wl
JOIN users recipient ON recipient.id=wl.user_id
LEFT JOIN users actor ON actor.id=wl.actor_user_id
"""


def _integer(value):
    return int(Decimal(str(value or 0)))


def _serialize_entry(row):
    entry = dict(row) if row else None
    if not entry:
        return None
    created_at = entry.get("created_at")
    if hasattr(created_at, "isoformat"):
        entry["created_at"] = created_at.isoformat()
    for field in ("amount", "balance_before", "balance_after", "current_balance"):
        entry[field] = _integer(entry.get(field))
    entry["can_reverse"] = bool(
        entry.get("source_type") in ADMIN_ADJUSTMENT_SOURCES
        and entry.get("actor_user_id")
        and entry.get("action") in {"credit", "debit"}
        and not entry.get("reversed_by_id")
    )
    return {field: entry.get(field) for field in LEDGER_FIELDS}


class AdminRewardsRepository:
    def __init__(self, get_db, db_exec):
        self.get_db = get_db
        self.db_exec = db_exec

    @staticmethod
    def _lock_suffix(conn, lock):
        return " FOR UPDATE OF wl" if lock and not isinstance(conn, sqlite3.Connection) else ""

    @staticmethod
    def _filters(query):
        clauses = ["wl.value_type=%s"]
        params = ["reward_coin"]
        if query["q"]:
            pattern = f"%{query['q'].lower()}%"
            clauses.append(
                "(LOWER(recipient.name) LIKE %s OR LOWER(recipient.email) LIKE %s "
                "OR LOWER(recipient.id) LIKE %s OR LOWER(COALESCE(actor.name,'')) LIKE %s "
                "OR LOWER(COALESCE(wl.reason,'')) LIKE %s "
                "OR LOWER(COALESCE(wl.source_type,'')) LIKE %s)"
            )
            params.extend([pattern] * 6)
        if query["user_ids"]:
            marks = ",".join(["%s"] * len(query["user_ids"]))
            clauses.append(f"wl.user_id IN ({marks})")
            params.extend(query["user_ids"])
        if query["directions"]:
            marks = ",".join(["%s"] * len(query["directions"]))
            clauses.append(f"UPPER(wl.credit_debit) IN ({marks})")
            params.extend(query["directions"])
        if query["source_types"]:
            marks = ",".join(["%s"] * len(query["source_types"]))
            clauses.append(f"UPPER(wl.source_type) IN ({marks})")
            params.extend(query["source_types"])
        return " WHERE " + " AND ".join(clauses), params

    def list_ledger(self, query):
        where_sql, params = self._filters(query)
        conn = self.get_db()
        try:
            count_row = self.db_exec(
                conn,
                "SELECT COUNT(*) AS total FROM wallet_ledger wl "
                "JOIN users recipient ON recipient.id=wl.user_id "
                "LEFT JOIN users actor ON actor.id=wl.actor_user_id"
                + where_sql,
                tuple(params),
            ).fetchone()
            rows = self.db_exec(
                conn,
                LEDGER_SELECT
                + where_sql
                + " ORDER BY wl.created_at DESC,wl.id DESC LIMIT %s OFFSET %s",
                tuple(params + [query["page_size"], query["offset"]]),
            ).fetchall()
            return [_serialize_entry(row) for row in rows], int(dict(count_row)["total"])
        finally:
            conn.close()

    def summary(self):
        conn = self.get_db()
        try:
            user_rows = self.db_exec(conn, "SELECT id,hu_coins FROM users").fetchall()
            ledger_rows = self.db_exec(
                conn,
                """SELECT user_id,
                          COALESCE(SUM(CASE WHEN UPPER(credit_debit)='CREDIT'
                              THEN amount ELSE -amount END),0) AS canonical_balance,
                          COALESCE(SUM(CASE WHEN UPPER(credit_debit)='CREDIT'
                              THEN amount ELSE 0 END),0) AS credits,
                          COALESCE(SUM(CASE WHEN UPPER(credit_debit)='DEBIT'
                              THEN amount ELSE 0 END),0) AS debits
                   FROM wallet_ledger
                   WHERE value_type=%s AND LOWER(status) IN (%s,%s,%s,%s)
                   GROUP BY user_id""",
                ("reward_coin", "available", "settled", "spent", "reversed"),
            ).fetchall()
        finally:
            conn.close()

        ledger_by_user = {str(row["user_id"]): dict(row) for row in ledger_rows}
        current_balances = 0
        mismatches = 0
        for row in user_rows:
            current = _integer(row["hu_coins"])
            canonical = _integer(
                ledger_by_user.get(str(row["id"]), {}).get("canonical_balance", 0)
            )
            current_balances += current
            if current != canonical:
                mismatches += 1
        return {
            "current_user_balances": current_balances,
            "credits": sum(_integer(row["credits"]) for row in ledger_rows),
            "debits": sum(_integer(row["debits"]) for row in ledger_rows),
            "balance_mismatches": mismatches,
        }

    def find_entry(self, conn, ledger_id, lock=False):
        row = self.db_exec(
            conn,
            LEDGER_SELECT + " WHERE wl.id=%s" + self._lock_suffix(conn, lock),
            (ledger_id,),
        ).fetchone()
        return _serialize_entry(row)

    def write_audit(self, conn, actor_user_id, entity_id, action, before, after):
        self.db_exec(
            conn,
            "INSERT INTO admin_audit_log "
            "(id,actor_user_id,entity_type,entity_id,action,before_value,after_value,created_at) "
            "VALUES (%s,%s,'wallet_ledger',%s,%s,%s,%s,CURRENT_TIMESTAMP)",
            (
                str(uuid.uuid4()),
                actor_user_id,
                entity_id,
                action,
                json.dumps(before, sort_keys=True, default=str) if before is not None else None,
                json.dumps(after, sort_keys=True, default=str) if after is not None else None,
            ),
        )
