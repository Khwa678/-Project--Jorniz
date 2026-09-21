"""Flask routes for administrator post management."""

from flask import Blueprint, jsonify, request

from .service import AdminPostError, AdminPostsService


def create_posts_blueprint(dependencies):
    service = AdminPostsService(dependencies)
    blueprint = Blueprint("admin_posts", __name__, url_prefix="/api/admin/posts")
    require_admin = dependencies.require_admin

    def execute(action):
        try:
            return action()
        except AdminPostError as exc:
            return jsonify(exc.payload), exc.status_code

    @blueprint.get("")
    @require_admin
    def list_posts():
        return execute(lambda: jsonify(service.list_posts(request.args)))

    @blueprint.post("")
    @require_admin
    def create_post():
        media = request.files.get("media") or request.files.get("file")
        payload = request.form.to_dict() if request.form or media else (
            request.get_json(force=True, silent=True) or {}
        )

        def action():
            post = service.create_post(payload, request.current_user, media)
            return jsonify({"post": post}), 201

        return execute(action)

    @blueprint.patch("")
    @require_admin
    def update_posts():
        payload = request.get_json(force=True, silent=True) or {}

        def action():
            posts = service.update_posts(payload.get("updates"), request.current_user)
            return jsonify({"updated_count": len(posts), "posts": posts})

        return execute(action)

    @blueprint.delete("")
    @require_admin
    def delete_posts():
        payload = request.get_json(force=True, silent=True) or {}

        def action():
            deleted_ids = service.delete_posts(payload.get("post_ids"), request.current_user)
            return jsonify({"deleted_count": len(deleted_ids), "deleted_ids": deleted_ids})

        return execute(action)

    @blueprint.post("/<post_id>/media")
    @require_admin
    def replace_media(post_id):
        media = request.files.get("media") or request.files.get("file")

        def action():
            post, warning = service.replace_media(post_id, media, request.current_user)
            response = {"post": post}
            if warning:
                response["warning"] = warning
            return jsonify(response)

        return execute(action)

    @blueprint.delete("/<post_id>/media")
    @require_admin
    def remove_media(post_id):
        def action():
            post, warning = service.remove_media(post_id, request.current_user)
            response = {"post": post}
            if warning:
                response["warning"] = warning
            return jsonify(response)

        return execute(action)

    return blueprint
