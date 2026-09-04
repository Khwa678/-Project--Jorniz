import unittest

from backend.auth_policy import (
    ALLOWED_ACCOUNT_TYPES,
    account_state,
    is_active_account,
    is_allowed_account_type,
    is_permission_allowed,
    permission_decision,
    professional_approval_state,
)


class AuthPolicyTests(unittest.TestCase):
    def user(self, **changes):
        value = {
            "id": "user-1",
            "user_type": "general_user",
            "system_role": "member",
            "account_status": "active",
            "is_banned": False,
        }
        value.update(changes)
        return value

    def test_only_canonical_account_types_are_allowed(self):
        self.assertEqual(len(ALLOWED_ACCOUNT_TYPES), 9)
        self.assertTrue(is_allowed_account_type("job seeker"))
        self.assertFalse(is_allowed_account_type("admin"))
        self.assertFalse(is_allowed_account_type("patient"))

    def test_active_account_requires_known_type_and_active_state(self):
        self.assertTrue(is_active_account(self.user()))
        self.assertEqual(account_state(self.user(user_type="unknown")), "unknown_account_type")
        self.assertEqual(account_state(self.user(is_banned=True)), "banned")
        self.assertEqual(account_state(self.user(account_status="suspended")), "suspended")

    def test_non_professional_does_not_require_approval(self):
        self.assertEqual(professional_approval_state(self.user()), "not_required")

    def test_professional_uses_one_approval_status(self):
        doctor = self.user(user_type="doctor", verification_status="approved")
        self.assertEqual(professional_approval_state(doctor), "approved")
        self.assertEqual(
            professional_approval_state(self.user(user_type="doctor", verification_status="pending")),
            "pending",
        )

    def test_pending_and_rejected_professionals_are_denied(self):
        pending = self.user(user_type="doctor", verification_status="pending")
        rejected = self.user(user_type="doctor", verification_status="rejected")
        self.assertEqual(permission_decision(pending).reason, "professional_pending")
        self.assertEqual(permission_decision(rejected).reason, "professional_rejected")

    def test_account_type_permission(self):
        recruiter = self.user(user_type="recruiter")
        self.assertTrue(is_permission_allowed(recruiter, account_types={"recruiter"}))
        self.assertEqual(
            permission_decision(recruiter, account_types={"doctor"}).reason,
            "account_type_forbidden",
        )

    def test_system_role_permission(self):
        admin = self.user(system_role="admin")
        self.assertTrue(is_permission_allowed(admin, system_roles={"admin", "super_admin"}))
        self.assertEqual(
            permission_decision(self.user(), system_roles={"admin"}).reason,
            "system_role_forbidden",
        )

    def test_ownership_permission(self):
        self.assertTrue(is_permission_allowed(self.user(), resource_owner_id="user-1"))
        self.assertEqual(
            permission_decision(self.user(), resource_owner_id="user-2").reason,
            "ownership_required",
        )

    def test_resource_state_permission(self):
        self.assertTrue(is_permission_allowed(
            self.user(), resource_state="draft", allowed_resource_states={"draft"}
        ))
        self.assertEqual(
            permission_decision(
                self.user(), resource_state="paid", allowed_resource_states={"draft", "pending"}
            ).reason,
            "resource_state_forbidden",
        )

    def test_professional_gate_can_be_explicitly_relaxed(self):
        pending = self.user(user_type="doctor", verification_status="pending")
        self.assertTrue(is_permission_allowed(pending, require_professional_approval=False))


if __name__ == "__main__":
    unittest.main()
