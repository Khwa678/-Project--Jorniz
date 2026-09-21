"""Flask routes for administrator HU Coin management."""

from flask import Blueprint, jsonify, request

from .service import AdminRewardError, AdminRewardsService


def create_rewards_blueprint(dependencies):
    service = AdminRewardsService(dependencies)
    blueprint = Blueprint("admin_rewards", __name__, url_prefix="/api/admin/rewards")
    require_admin = dependencies.require_admin

    def execute(action):
        try:
            return action()
        except AdminRewardError as exc:
            return jsonify(exc.payload), exc.status_code

    @blueprint.get("/summary")
    @require_admin
    def summary():
        return execute(lambda: jsonify(service.summary()))

    @blueprint.get("/ledger")
    @require_admin
    def ledger():
        return execute(lambda: jsonify(service.list_ledger(request.args)))

    @blueprint.post("/adjustments")
    @require_admin
    def create_adjustment():
        payload = request.get_json(force=True, silent=True) or {}

        def action():
            entry, created = service.create_adjustment(payload, request.current_user)
            return jsonify({"entry": entry}), 201 if created else 200

        return execute(action)

    @blueprint.post("/adjustments/<ledger_id>/reverse")
    @require_admin
    def reverse_adjustment(ledger_id):
        payload = request.get_json(force=True, silent=True) or {}

        def action():
            entry, created = service.reverse_adjustment(
                ledger_id, payload, request.current_user
            )
            return jsonify({"entry": entry}), 201 if created else 200

        return execute(action)

    @blueprint.post("/adjustments/<ledger_id>/correct")
    @require_admin
    def correct_adjustment(ledger_id):
        payload = request.get_json(force=True, silent=True) or {}

        def action():
            result, created = service.correct_adjustment(
                ledger_id, payload, request.current_user
            )
            return jsonify(result), 201 if created else 200

        return execute(action)

    return blueprint
