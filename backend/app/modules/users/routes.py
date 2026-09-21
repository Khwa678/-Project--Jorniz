"""Flask routes for administrator user management."""

from flask import Blueprint, jsonify, request

from .service import UserManagementError, UserManagementService


def create_users_blueprint(dependencies):
    service = UserManagementService(dependencies)
    blueprint = Blueprint("admin_users", __name__, url_prefix="/api/admin/users")
    require_admin = dependencies.require_admin

    def execute(action):
        try:
            return action()
        except UserManagementError as exc:
            return jsonify(exc.payload), exc.status_code

    @blueprint.get("")
    @require_admin
    def list_users():
        return execute(lambda: jsonify(service.list_users(request.args)))

    @blueprint.post("")
    @require_admin
    def create_user():
        payload = request.get_json(force=True, silent=True) or {}

        def action():
            user = service.create_user(payload, request.current_user)
            return jsonify({"user": user}), 201

        return execute(action)

    @blueprint.patch("/<user_id>")
    @require_admin
    def update_user(user_id):
        payload = request.get_json(force=True, silent=True) or {}
        return execute(
            lambda: jsonify({"user": service.update_user(user_id, payload, request.current_user)})
        )

    @blueprint.patch("")
    @require_admin
    def update_users():
        payload = request.get_json(force=True, silent=True) or {}

        def action():
            users = service.update_users(payload.get("updates"), request.current_user)
            return jsonify({"updated_count": len(users), "users": users})

        return execute(action)

    @blueprint.delete("/<user_id>")
    @require_admin
    def delete_user(user_id):
        def action():
            deleted_ids = service.delete_user(user_id, request.current_user)
            return jsonify({"deleted_count": 1, "deleted_ids": deleted_ids})

        return execute(action)

    @blueprint.delete("")
    @require_admin
    def delete_users():
        payload = request.get_json(force=True, silent=True) or {}

        def action():
            deleted_ids = service.delete_users(payload.get("user_ids"), request.current_user)
            return jsonify({"deleted_count": len(deleted_ids), "deleted_ids": deleted_ids})

        return execute(action)

    return blueprint
