"""Validation and transactional use cases for administrator rewards."""

from dataclasses import dataclass
from decimal import Decimal, InvalidOperation

from services.wallet_service import (
    IdempotencyConflict,
    InsufficientCoins,
    InvalidCoinAmount,
    WalletError,
    WalletUserNotFound,
)

from .constants import (
    ADJUSTMENT_ROLES,
    ADMIN_ADJUSTMENT_SOURCE_DIRECTIONS,
    ADMIN_ADJUSTMENT_SOURCES,
    DIRECTIONS,
    REVERSAL_ROLES,
)
from .repository import AdminRewardsRepository


class AdminRewardError(Exception):
    def __init__(self, payload, status_code=400):
        super().__init__(payload.get("detail", "Invalid reward request"))
        self.payload = payload
        self.status_code = status_code


@dataclass(frozen=True)
class AdminRewardDependencies:
    get_db: object
    db_exec: object
    require_admin: object
    wallet_credit: object
    wallet_debit: object
    wallet_reverse_entry: object


class AdminRewardsService:
    def __init__(self, dependencies):
        self.dependencies = dependencies
        self.repository = AdminRewardsRepository(dependencies.get_db, dependencies.db_exec)

    def summary(self):
        return self.repository.summary()

    def list_ledger(self, args):
        page = self._positive_int(args.get("page"), 1, "page")
        page_size = self._positive_int(args.get("page_size"), 25, "page_size")
        if page_size > 100:
            raise AdminRewardError({"detail": "page_size cannot exceed 100"})
        directions = self._values(args.get("direction"))
        invalid_directions = sorted(set(directions) - DIRECTIONS)
        if invalid_directions:
            raise AdminRewardError(
                {"detail": "Invalid direction", "invalid_directions": invalid_directions, "allowed_direction": sorted(DIRECTIONS)}
            )
        source_types = self._values(args.get("source_type"))
        if any(len(source_type) > 120 for source_type in source_types):
            raise AdminRewardError({"detail": "source_type cannot exceed 120 characters"})
        query = {
            "q": str(args.get("q") or "").strip()[:200],
            "user_ids": self._user_ids(args.get("user_ids")),
            "directions": directions,
            "source_types": source_types,
            "page": page,
            "page_size": page_size,
            "offset": (page - 1) * page_size,
        }
        entries, total = self.repository.list_ledger(query)
        return {"items": entries, "page": page, "page_size": page_size, "total": total}

    def create_adjustment(self, payload, actor):
        self._require_role(actor, ADJUSTMENT_ROLES, "Reward adjustment access required")
        if not isinstance(payload, dict):
            raise AdminRewardError({"detail": "Request body must be an object"})
        user_id = self._required(payload.get("user_id"), "user_id")
        source_type, direction = self._admin_source(payload)
        amount = self._amount(payload.get("amount"))
        reason = self._reason(payload.get("reason"))
        request_id = self._required(payload.get("request_id"), "request_id")
        actor_id = str(actor["id"])

        conn = self.dependencies.get_db()
        try:
            operation = (
                self.dependencies.wallet_credit
                if direction == "CREDIT"
                else self.dependencies.wallet_debit
            )
            result = operation(
                conn,
                user_id,
                amount,
                source_type,
                request_id,
                request_id,
                actor_user_id=actor_id,
                reason=reason,
            )
            entry = self.repository.find_entry(conn, result.entry_id)
            if result.created:
                self.repository.write_audit(
                    conn,
                    actor_id,
                    result.entry_id,
                    "reward_admin_credit" if direction == "CREDIT" else "reward_admin_debit",
                    None,
                    entry,
                )
            conn.commit()
            return entry, result.created
        except Exception as exc:
            conn.rollback()
            self._raise_wallet_error(exc)
            raise
        finally:
            conn.close()

    def reverse_adjustment(self, ledger_id, payload, actor):
        self._require_role(actor, REVERSAL_ROLES, "Finance administrator access required")
        if not isinstance(payload, dict):
            raise AdminRewardError({"detail": "Request body must be an object"})
        ledger_id = self._required(ledger_id, "ledger_id")
        reason = self._reason(payload.get("reason"))
        request_id = self._required(payload.get("request_id"), "request_id")
        actor_id = str(actor["id"])

        conn = self.dependencies.get_db()
        try:
            original = self.repository.find_entry(conn, ledger_id, lock=True)
            if not original:
                raise AdminRewardError({"detail": "Ledger entry not found"}, 404)
            if (
                original.get("source_type") not in ADMIN_ADJUSTMENT_SOURCES
                or not original.get("actor_user_id")
                or original.get("action") not in {"credit", "debit"}
            ):
                raise AdminRewardError(
                    {"detail": "Only administrator adjustments can be reversed"}, 409
                )
            result = self.dependencies.wallet_reverse_entry(
                conn,
                original["user_id"],
                ledger_id,
                request_id,
                source_type="ADMIN_ADJUSTMENT_REVERSAL",
                source_id=ledger_id,
                actor_user_id=actor_id,
                reason=reason,
            )
            entry = self.repository.find_entry(conn, result.entry_id)
            if result.created:
                self.repository.write_audit(
                    conn,
                    actor_id,
                    result.entry_id,
                    "reward_admin_reversal",
                    original,
                    entry,
                )
            conn.commit()
            return entry, result.created
        except AdminRewardError:
            conn.rollback()
            raise
        except Exception as exc:
            conn.rollback()
            self._raise_wallet_error(exc)
            raise
        finally:
            conn.close()

    def correct_adjustment(self, ledger_id, payload, actor):
        self._require_role(actor, REVERSAL_ROLES, "Finance administrator access required")
        if not isinstance(payload, dict):
            raise AdminRewardError({"detail": "Request body must be an object"})
        ledger_id = self._required(ledger_id, "ledger_id")
        source_type, direction = self._admin_source(payload)
        amount = self._amount(payload.get("amount"))
        reason = self._reason(payload.get("reason"))
        request_id = self._required(payload.get("request_id"), "request_id")
        actor_id = str(actor["id"])

        conn = self.dependencies.get_db()
        try:
            original = self.repository.find_entry(conn, ledger_id, lock=True)
            if not original:
                raise AdminRewardError({"detail": "Ledger entry not found"}, 404)
            if (
                original.get("source_type") not in ADMIN_ADJUSTMENT_SOURCES
                or not original.get("actor_user_id")
                or original.get("action") not in {"credit", "debit"}
            ):
                raise AdminRewardError(
                    {"detail": "Only administrator adjustments can be corrected"}, 409
                )

            reversal_result = self.dependencies.wallet_reverse_entry(
                conn,
                original["user_id"],
                ledger_id,
                f"{request_id}:reverse",
                source_type="ADMIN_ADJUSTMENT_REVERSAL",
                source_id=ledger_id,
                actor_user_id=actor_id,
                reason=reason,
            )
            operation = (
                self.dependencies.wallet_credit
                if direction == "CREDIT"
                else self.dependencies.wallet_debit
            )
            replacement_result = operation(
                conn,
                original["user_id"],
                amount,
                source_type,
                ledger_id,
                f"{request_id}:replacement",
                actor_user_id=actor_id,
                reason=reason,
            )
            reversal = self.repository.find_entry(conn, reversal_result.entry_id)
            replacement = self.repository.find_entry(conn, replacement_result.entry_id)
            if reversal_result.created:
                self.repository.write_audit(
                    conn,
                    actor_id,
                    reversal_result.entry_id,
                    "reward_admin_correction_reversal",
                    original,
                    reversal,
                )
            if replacement_result.created:
                self.repository.write_audit(
                    conn,
                    actor_id,
                    replacement_result.entry_id,
                    "reward_admin_correction_replacement",
                    original,
                    replacement,
                )
            conn.commit()
            return {
                "reversal": reversal,
                "entry": replacement,
            }, reversal_result.created or replacement_result.created
        except AdminRewardError:
            conn.rollback()
            raise
        except Exception as exc:
            conn.rollback()
            self._raise_wallet_error(exc)
            raise
        finally:
            conn.close()

    @staticmethod
    def _raise_wallet_error(exc):
        if isinstance(exc, WalletUserNotFound):
            raise AdminRewardError({"detail": str(exc)}, 404) from exc
        if isinstance(exc, (IdempotencyConflict, InsufficientCoins)):
            raise AdminRewardError({"detail": str(exc)}, 409) from exc
        if isinstance(exc, (InvalidCoinAmount, WalletError)):
            raise AdminRewardError({"detail": str(exc)}, 400) from exc

    @staticmethod
    def _require_role(actor, roles, message):
        if actor.get("system_role") not in roles:
            raise AdminRewardError({"detail": message}, 403)

    @staticmethod
    def _required(value, field):
        text = str(value or "").strip()
        if not text:
            raise AdminRewardError({"detail": f"{field} is required"})
        return text

    @classmethod
    def _admin_source(cls, payload):
        source_type = str(payload.get("source_type") or "").strip().upper()
        if not source_type:
            direction = str(payload.get("direction") or "").strip().upper()
            if direction in DIRECTIONS:
                source_type = "ADMIN_REWARD" if direction == "CREDIT" else "ADMIN_REVOCATION"
        if source_type not in ADMIN_ADJUSTMENT_SOURCE_DIRECTIONS:
            raise AdminRewardError(
                {
                    "detail": "Invalid administrator reward source",
                    "allowed_source_type": sorted(ADMIN_ADJUSTMENT_SOURCE_DIRECTIONS),
                }
            )
        return source_type, ADMIN_ADJUSTMENT_SOURCE_DIRECTIONS[source_type]

    @staticmethod
    def _values(value):
        return list(dict.fromkeys(part.strip().upper() for part in str(value or "").split(",") if part.strip()))

    @classmethod
    def _reason(cls, value):
        reason = cls._required(value, "reason")
        if len(reason) > 500:
            raise AdminRewardError({"detail": "reason cannot exceed 500 characters"})
        return reason

    @staticmethod
    def _amount(value):
        try:
            amount = Decimal(str(value))
        except (InvalidOperation, TypeError, ValueError) as exc:
            raise AdminRewardError({"detail": "amount must be a positive integer"}) from exc
        if not amount.is_finite() or amount <= 0 or amount != amount.to_integral_value():
            raise AdminRewardError({"detail": "amount must be a positive integer"})
        return int(amount)

    @staticmethod
    def _positive_int(value, default, field):
        try:
            parsed = int(value if value is not None else default)
        except (TypeError, ValueError) as exc:
            raise AdminRewardError({"detail": f"{field} must be a positive integer"}) from exc
        if parsed < 1:
            raise AdminRewardError({"detail": f"{field} must be a positive integer"})
        return parsed

    @staticmethod
    def _user_ids(value):
        if not value:
            return []
        identifiers = []
        for item in str(value).split(","):
            identifier = item.strip()
            if identifier and identifier not in identifiers:
                identifiers.append(identifier)
        if len(identifiers) > 100:
            raise AdminRewardError({"detail": "user_ids cannot contain more than 100 users"})
        return identifiers
