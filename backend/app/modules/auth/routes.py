"""Flask routes for signup and login."""

from flask import Blueprint, jsonify, request

from .service import AuthError, AuthService
from .validators import ValidationError


def create_auth_blueprint(dependencies):
    service = AuthService(dependencies)
    blueprint = Blueprint("auth", __name__, url_prefix="/api/auth")

    @blueprint.post("/signup")
    def signup():
        is_multipart = (
            request.content_type and "multipart/form-data" in request.content_type
        )
        if is_multipart:
            data = request.form
            document_file = request.files.get("verification_doc")
        else:
            data = request.get_json(force=True, silent=True) or {}
            document_file = None

        try:
            return jsonify(service.signup(data, document_file)), 201
        except (ValidationError, AuthError) as exc:
            return jsonify(exc.payload), exc.status_code

    @blueprint.post("/login")
    def login():
        data = request.get_json(force=True, silent=True) or {}
        try:
            return jsonify(service.login(data))
        except (ValidationError, AuthError) as exc:
            return jsonify(exc.payload), exc.status_code

    return blueprint
