"""Validation and transactional use cases for user management."""

from dataclasses import dataclass

import bcrypt

from .repository import SORT_COLUMNS, UsersRepository


EDITABLE_FIELDS = {"name", "user_type", "specialty", "system_role"}


class UserManagementError(Exception):
    def __init__(self, payload, status_code=400):
        super().__init__(payload.get("detail", "Invalid user request"))
        self.payload = payload
        self.status_code = status_code


@dataclass(frozen=True)
class UserManagementDependencies:
    get_db: object
    db_exec: object
    require_admin: object
    allowed_user_types: object
    allowed_system_roles: object


class UserManagementService:
    def __init__(self, dependencies):
        self.dependencies = dependencies
        self.repository = UsersRepository(
            dependencies.get_db,
            dependencies.db_exec,
        )

    def list_users(self, args):
        page = self._positive_int(args.get("page"), 1, "page")
        page_size = self._positive_int(args.get("page_size"), 25, "page_size")
        if page_size > 100:
            raise UserManagementError({"detail": "page_size cannot exceed 100"})

        user_type = (args.get("user_type") or "").strip()
        system_role = (args.get("system_role") or "").strip()
        if user_type and user_type not in self.dependencies.allowed_user_types:
            self._invalid_enum("user_type", self.dependencies.allowed_user_types)
        if system_role and system_role not in self.dependencies.allowed_system_roles:
            self._invalid_enum("system_role", self.dependencies.allowed_system_roles)

        sort = (args.get("sort") or "created_at").strip()
        if sort not in SORT_COLUMNS:
            self._invalid_enum("sort", SORT_COLUMNS)
        direction = (args.get("direction") or "desc").strip().lower()
        if direction not in {"asc", "desc"}:
            self._invalid_enum("direction", {"asc", "desc"})

        query = {
            "q": (args.get("q") or args.get("search") or "").strip(),
            "user_type": user_type,
            "system_role": system_role,
            "page": page,
            "page_size": page_size,
            "offset": (page - 1) * page_size,
            "sort": sort,
            "direction": direction,
        }
        users, total = self.repository.list_users(query)
        return {"items": users, "page": page, "page_size": page_size, "total": total}

    def create_user(self, payload, actor):
        user = self._validate_create(payload, actor)
        conn = self.dependencies.get_db()
        try:
            if self.repository.find_user_by_email(conn, user["email"]):
                raise UserManagementError(
                    {"detail": "This email is already registered"},
                    409,
                )
            user_id = self.repository.create_user(conn, user)
            created = self.repository.find_users(conn, [user_id])[0]
            conn.commit()
            return created
        except UserManagementError:
            conn.rollback()
            raise
        except Exception:
            conn.rollback()
            raise
        finally:
            conn.close()

    def update_user(self, user_id, payload, actor):
        users = self.update_users([{"id": user_id, **payload}], actor)
        return users[0]

    def update_users(self, updates, actor):
        normalized = self._validate_updates(updates)
        user_ids = [item["id"] for item in normalized]
        conn = self.dependencies.get_db()
        try:
            current_rows = self.repository.find_users(conn, user_ids, lock=True)
            current_by_id = {row["id"]: row for row in current_rows}
            missing = [user_id for user_id in user_ids if user_id not in current_by_id]
            if missing:
                raise UserManagementError(
                    {"detail": "User not found", "user_ids": missing},
                    404,
                )

            self._authorize_role_updates(normalized, current_by_id, actor)
            self._protect_last_super_admin(conn, normalized, current_by_id)
            for update in normalized:
                current = current_by_id[update["id"]]
                changes = {key: value for key, value in update.items() if key != "id"}
                target_user_type = changes.get("user_type", current["user_type"])
                if "specialty" in changes and target_user_type != "doctor":
                    raise UserManagementError(
                        {"detail": "Specialty can only be updated for doctor accounts", "user_id": current["id"]}
                    )
                target_specialty = changes.get("specialty", current.get("specialty"))
                if target_user_type == "doctor" and not target_specialty:
                    raise UserManagementError(
                        {"detail": "Specialty is required for doctor accounts", "user_id": current["id"]}
                    )
                self.repository.update_user(conn, current, changes)

            saved = self.repository.find_users(conn, user_ids)
            saved_by_id = {row["id"]: row for row in saved}
            conn.commit()
            return [saved_by_id[user_id] for user_id in user_ids]
        except UserManagementError:
            conn.rollback()
            raise
        except Exception:
            conn.rollback()
            raise
        finally:
            conn.close()

    def delete_user(self, user_id, actor):
        return self.delete_users([user_id], actor)

    def delete_users(self, user_ids, actor):
        ids = self._validate_user_ids(user_ids)
        actor_id = str(actor["id"])
        if actor_id in ids:
            raise UserManagementError(
                {"detail": "You cannot delete your own active administrator account"},
                409,
            )

        conn = self.dependencies.get_db()
        try:
            current_rows = self.repository.find_users(conn, ids, lock=True)
            current_by_id = {row["id"]: row for row in current_rows}
            missing = [user_id for user_id in ids if user_id not in current_by_id]
            if missing:
                raise UserManagementError(
                    {"detail": "User not found", "user_ids": missing},
                    404,
                )

            super_admin_deletes = sum(
                row["system_role"] == "super_admin" for row in current_rows
            )
            current_super_admins = self.repository.count_super_admins(conn)
            if current_super_admins and current_super_admins - super_admin_deletes < 1:
                raise UserManagementError(
                    {"detail": "The last super administrator cannot be deleted"},
                    409,
                )
            if actor.get("system_role") != "super_admin" and any(
                row["system_role"] != "member" for row in current_rows
            ):
                raise UserManagementError(
                    {"detail": "Only a super administrator can delete privileged accounts"},
                    403,
                )

            for user_id in ids:
                self.repository.delete_user(conn, user_id)
            conn.commit()
            return ids
        except UserManagementError:
            conn.rollback()
            raise
        except Exception as exc:
            conn.rollback()
            raise UserManagementError(
                {"detail": "One or more users have related records and could not be deleted"},
                409,
            ) from exc
        finally:
            conn.close()

    def _validate_create(self, payload, actor):
        name = str(payload.get("name") or "").strip()
        email = str(payload.get("email") or "").strip().lower()
        password = str(payload.get("password") or "")
        user_type = str(payload.get("user_type") or "general_user").strip()
        system_role = str(payload.get("system_role") or "member").strip()
        specialty = str(payload.get("specialty") or "").strip()
        if not name:
            raise UserManagementError({"detail": "Full name is required"})
        if not email or "@" not in email:
            raise UserManagementError({"detail": "Valid email address is required"})
        if len(password) < 6:
            raise UserManagementError({"detail": "Password must be at least 6 characters"})
        if user_type not in self.dependencies.allowed_user_types:
            self._invalid_enum("user_type", self.dependencies.allowed_user_types)
        if system_role not in self.dependencies.allowed_system_roles:
            self._invalid_enum("system_role", self.dependencies.allowed_system_roles)
        actor_role = actor.get("system_role")
        if system_role != "member" and actor_role != "super_admin" and not (
            actor_role == "admin" and system_role == "admin"
        ):
            raise UserManagementError(
                {"detail": "Only a super administrator can assign privileged roles"},
                403,
            )
        if user_type == "doctor" and not specialty:
            raise UserManagementError({"detail": "Specialty is required for doctor accounts"})
        if user_type != "doctor" and specialty:
            raise UserManagementError({"detail": "Specialty is only available for doctor accounts"})
        return {
            "name": name,
            "email": email,
            "password_hash": bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode(),
            "user_type": user_type,
            "system_role": system_role,
            "specialty": specialty,
        }

    def _validate_updates(self, updates):
        if not isinstance(updates, list) or not updates:
            raise UserManagementError({"detail": "updates must be a non-empty list"})
        normalized = []
        seen = set()
        for index, item in enumerate(updates):
            if not isinstance(item, dict):
                raise UserManagementError({"detail": f"Update at index {index} must be an object"})
            user_id = str(item.get("id") or "").strip()
            if not user_id:
                raise UserManagementError({"detail": f"Update at index {index} requires id"})
            if user_id in seen:
                raise UserManagementError({"detail": "Duplicate user id in updates", "user_id": user_id})
            unknown = set(item) - EDITABLE_FIELDS - {"id"}
            if unknown:
                raise UserManagementError({"detail": "Unsupported editable fields", "fields": sorted(unknown)})
            changes = {"id": user_id}
            if "name" in item:
                changes["name"] = str(item.get("name") or "").strip()
                if not changes["name"]:
                    raise UserManagementError({"detail": "Name cannot be empty", "user_id": user_id})
            if "user_type" in item:
                changes["user_type"] = str(item.get("user_type") or "").strip()
                if changes["user_type"] not in self.dependencies.allowed_user_types:
                    self._invalid_enum("user_type", self.dependencies.allowed_user_types)
            if "specialty" in item:
                changes["specialty"] = str(item.get("specialty") or "").strip()
                if not changes["specialty"]:
                    raise UserManagementError({"detail": "Specialty cannot be empty", "user_id": user_id})
            if "system_role" in item:
                changes["system_role"] = str(item.get("system_role") or "").strip()
                if changes["system_role"] not in self.dependencies.allowed_system_roles:
                    self._invalid_enum("system_role", self.dependencies.allowed_system_roles)
            if len(changes) == 1:
                raise UserManagementError({"detail": "Each update must include at least one editable field", "user_id": user_id})
            normalized.append(changes)
            seen.add(user_id)
        return normalized

    def _authorize_role_updates(self, updates, current_by_id, actor):
        for update in updates:
            if "system_role" not in update:
                continue
            current_role = current_by_id[update["id"]]["system_role"]
            if update["system_role"] == current_role:
                continue
            actor_role = actor.get("system_role")
            if actor_role == "super_admin":
                continue
            if actor_role == "admin" and current_role in {"member", "admin"} and update["system_role"] in {"member", "admin"}:
                continue
            raise UserManagementError(
                {"detail": "You cannot assign this permission level"},
                403,
            )

    def _protect_last_super_admin(self, conn, updates, current_by_id):
        current_count = self.repository.count_super_admins(conn)
        final_count = current_count
        for update in updates:
            if "system_role" not in update:
                continue
            old_role = current_by_id[update["id"]]["system_role"]
            new_role = update["system_role"]
            if old_role == "super_admin" and new_role != "super_admin":
                final_count -= 1
            elif old_role != "super_admin" and new_role == "super_admin":
                final_count += 1
        if current_count and final_count < 1:
            raise UserManagementError(
                {"detail": "The last super administrator cannot be demoted"},
                409,
            )

    @staticmethod
    def _validate_user_ids(user_ids):
        if not isinstance(user_ids, list) or not user_ids:
            raise UserManagementError({"detail": "user_ids must be a non-empty list"})
        ids = [str(user_id or "").strip() for user_id in user_ids]
        if any(not user_id for user_id in ids):
            raise UserManagementError({"detail": "Every user id must be non-empty"})
        if len(ids) != len(set(ids)):
            raise UserManagementError({"detail": "Duplicate user id in request"})
        return ids

    @staticmethod
    def _positive_int(value, default, field):
        try:
            parsed = int(value if value is not None else default)
        except (TypeError, ValueError) as exc:
            raise UserManagementError({"detail": f"{field} must be a positive integer"}) from exc
        if parsed < 1:
            raise UserManagementError({"detail": f"{field} must be a positive integer"})
        return parsed

    @staticmethod
    def _invalid_enum(field, allowed):
        raise UserManagementError(
            {"detail": f"Invalid {field}", f"allowed_{field}": sorted(allowed)}
        )
