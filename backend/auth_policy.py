"""Pure account and authorization policy helpers for Jorniz."""

from typing import NamedTuple


ALLOWED_ACCOUNT_TYPES = frozenset({
    "general_user",
    "creator",
    "job_seeker",
    "recruiter",
    "doctor",
    "seller",
    "pharmacy_partner",
    "diagnostic_partner",
    "advertiser",
})

PROFESSIONAL_ACCOUNT_TYPES = frozenset({
    "doctor",
    "pharmacy_partner",
    "diagnostic_partner",
})

INACTIVE_ACCOUNT_STATES = frozenset({
    "banned",
    "deleted",
    "deactivated",
    "disabled",
    "inactive",
    "suspended",
})


class PolicyDecision(NamedTuple):
    allowed: bool
    reason: str


def normalize_account_type(value):
    key = str(value or "").strip().lower().replace("-", "_").replace(" ", "_")
    return key if key in ALLOWED_ACCOUNT_TYPES else None


def is_allowed_account_type(value):
    return normalize_account_type(value) is not None


def _is_true(value):
    return value is True or str(value).strip().lower() in {"1", "true", "yes"}


def account_state(user):
    if not isinstance(user, dict):
        return "missing"
    if not is_allowed_account_type(user.get("user_type")):
        return "unknown_account_type"
    if _is_true(user.get("is_banned")):
        return "banned"
    state = str(user.get("account_status") or "active").strip().lower()
    return state if state in INACTIVE_ACCOUNT_STATES else "active"


def is_active_account(user):
    return account_state(user) == "active"


def professional_approval_state(user):
    account_type = normalize_account_type((user or {}).get("user_type"))
    if account_type not in PROFESSIONAL_ACCOUNT_TYPES:
        return "not_required"

    profile = (user or {}).get("profile") or {}
    status = str(
        (user or {}).get("verification_status")
        or profile.get("verification_status")
        or "pending"
    ).strip().lower()
    if status == "rejected":
        return "rejected"
    if status in {"approved", "verified"}:
        return "approved"
    return "pending"


def permission_decision(
    user,
    *,
    account_types=(),
    system_roles=(),
    resource_owner_id=None,
    resource_state=None,
    allowed_resource_states=(),
    require_professional_approval=True,
):
    state = account_state(user)
    if state != "active":
        return PolicyDecision(False, state)

    approval = professional_approval_state(user)
    if require_professional_approval and approval in {"pending", "rejected"}:
        return PolicyDecision(False, "professional_" + approval)

    allowed_types = {normalize_account_type(value) for value in account_types}
    allowed_types.discard(None)
    if allowed_types and normalize_account_type(user.get("user_type")) not in allowed_types:
        return PolicyDecision(False, "account_type_forbidden")

    allowed_roles = {str(value).strip().lower() for value in system_roles}
    current_role = str(user.get("system_role") or "member").strip().lower()
    if allowed_roles and current_role not in allowed_roles:
        return PolicyDecision(False, "system_role_forbidden")

    if resource_owner_id is not None and str(user.get("id")) != str(resource_owner_id):
        return PolicyDecision(False, "ownership_required")

    allowed_states = {str(value).strip().lower() for value in allowed_resource_states}
    if allowed_states and str(resource_state or "").strip().lower() not in allowed_states:
        return PolicyDecision(False, "resource_state_forbidden")

    return PolicyDecision(True, "allowed")


def is_permission_allowed(user, **requirements):
    return permission_decision(user, **requirements).allowed
