"""Validation and transactional use cases for administrator post management."""

from dataclasses import dataclass
import os
import uuid

from .repository import AdminPostsRepository, SORT_COLUMNS


TRUST_STATUSES = {"unreviewed", "trusted", "flagged", "rejected"}
EDITABLE_FIELDS = {"title", "content", "hashtags", "trust_status", "category"}
EDITOR_ROLES = {"admin", "super_admin"}


class AdminPostError(Exception):
    def __init__(self, payload, status_code=400):
        super().__init__(payload.get("detail", "Invalid post request"))
        self.payload = payload
        self.status_code = status_code


@dataclass(frozen=True)
class AdminPostDependencies:
    get_db: object
    db_exec: object
    require_admin: object
    upload_post_media: object
    delete_post_media: object
    normalize_hashtags: object
    allowed_media: object
    allowed_images: object
    max_file_bytes: int


class AdminPostsService:
    def __init__(self, dependencies):
        self.dependencies = dependencies
        self.repository = AdminPostsRepository(dependencies.get_db, dependencies.db_exec)

    def list_posts(self, args):
        page = self._positive_int(args.get("page"), 1, "page")
        page_size = self._positive_int(args.get("page_size"), 25, "page_size")
        if page_size > 100:
            raise AdminPostError({"detail": "page_size cannot exceed 100"})
        sort = str(args.get("sort") or "created_at").strip()
        if sort not in SORT_COLUMNS:
            raise AdminPostError({"detail": "Invalid sort", "allowed_sort": sorted(SORT_COLUMNS)})
        direction = str(args.get("direction") or "desc").strip().lower()
        if direction not in {"asc", "desc"}:
            raise AdminPostError({"detail": "Invalid direction", "allowed_direction": ["asc", "desc"]})
        query = {
            "search": str(args.get("search") or args.get("q") or "").strip(),
            "page": page,
            "page_size": page_size,
            "offset": (page - 1) * page_size,
            "sort": sort,
            "direction": direction,
        }
        posts, total = self.repository.list_posts(query)
        return {"items": posts, "page": page, "page_size": page_size, "total": total}

    def create_post(self, payload, actor, media=None):
        self._require_editor(actor)
        post_input = self._validate_create(payload)
        conn = self.dependencies.get_db()
        uploaded_url = ""
        try:
            if not self.repository.find_creator(conn, post_input["creator_user_id"]):
                raise AdminPostError({"detail": "Creator not found"}, 404)
            post_id = str(uuid.uuid4())
            media_type = ""
            if media and media.filename:
                uploaded_url, media_type = self._upload_media(
                    media, post_input["creator_user_id"], post_id
                )
            post_input.update(
                {"id": post_id, "media_url": uploaded_url, "media_type": media_type}
            )
            post_id = self.repository.create_post(conn, post_input)
            post = self.repository.find_posts(conn, [post_id])[0]
            self.repository.write_audit(conn, str(actor["id"]), post_id, "post_create", None, post)
            conn.commit()
            return post
        except AdminPostError:
            conn.rollback()
            if uploaded_url:
                self._delete_uncommitted_media(uploaded_url)
            raise
        except Exception:
            conn.rollback()
            if uploaded_url:
                self._delete_uncommitted_media(uploaded_url)
            raise
        finally:
            conn.close()

    def update_posts(self, updates, actor):
        self._require_editor(actor)
        normalized = self._validate_updates(updates)
        post_ids = [item["id"] for item in normalized]
        conn = self.dependencies.get_db()
        try:
            current = self.repository.find_posts(conn, post_ids, lock=True)
            current_by_id = {post["id"]: post for post in current}
            missing = [post_id for post_id in post_ids if post_id not in current_by_id]
            if missing:
                raise AdminPostError({"detail": "Post not found", "post_ids": missing}, 404)
            for update in normalized:
                before = current_by_id[update["id"]]
                changes = {field: value for field, value in update.items() if field != "id"}
                resulting_content = changes.get("content", before["content"])
                if not resulting_content and not before.get("media_url"):
                    raise AdminPostError(
                        {"detail": "A post must contain content or media", "post_id": before["id"]}
                    )
                self.repository.update_post(conn, before["id"], changes)
            saved = self.repository.find_posts(conn, post_ids)
            saved_by_id = {post["id"]: post for post in saved}
            for update in normalized:
                post_id = update["id"]
                self.repository.write_audit(
                    conn,
                    str(actor["id"]),
                    post_id,
                    "post_update",
                    current_by_id[post_id],
                    saved_by_id[post_id],
                )
            conn.commit()
            return [saved_by_id[post_id] for post_id in post_ids]
        except AdminPostError:
            conn.rollback()
            raise
        except Exception:
            conn.rollback()
            raise
        finally:
            conn.close()

    def delete_posts(self, post_ids, actor):
        self._require_editor(actor)
        ids = self._validate_post_ids(post_ids)
        conn = self.dependencies.get_db()
        media_urls = []
        try:
            current = self.repository.find_posts(conn, ids, lock=True)
            current_by_id = {post["id"]: post for post in current}
            missing = [post_id for post_id in ids if post_id not in current_by_id]
            if missing:
                raise AdminPostError({"detail": "Post not found", "post_ids": missing}, 404)
            for post_id in ids:
                post = current_by_id[post_id]
                if post.get("media_url"):
                    media_urls.append(post["media_url"])
                self.repository.write_audit(
                    conn, str(actor["id"]), post_id, "post_delete", post, None
                )
                self.repository.delete_post(conn, post_id)
            conn.commit()
        except AdminPostError:
            conn.rollback()
            raise
        except Exception:
            conn.rollback()
            raise
        finally:
            conn.close()
        for media_url in media_urls:
            try:
                self.dependencies.delete_post_media(media_url)
            except Exception:
                pass
        return ids

    def replace_media(self, post_id, media, actor):
        self._require_editor(actor)
        post_id = self._required_id(post_id)

        conn = self.dependencies.get_db()
        uploaded_url = ""
        old_media_url = ""
        try:
            current_rows = self.repository.find_posts(conn, [post_id], lock=True)
            if not current_rows:
                raise AdminPostError({"detail": "Post not found"}, 404)
            before = current_rows[0]
            old_media_url = before.get("media_url") or ""
            uploaded_url, media_type = self._upload_media(
                media, before["creator_user_id"], post_id
            )
            self.repository.update_media(conn, post_id, uploaded_url, media_type)
            saved = self.repository.find_posts(conn, [post_id])[0]
            self.repository.write_audit(
                conn, str(actor["id"]), post_id, "post_media_replace", before, saved
            )
            conn.commit()
        except AdminPostError:
            conn.rollback()
            if uploaded_url:
                self._delete_uncommitted_media(uploaded_url)
            raise
        except Exception:
            conn.rollback()
            if uploaded_url:
                self._delete_uncommitted_media(uploaded_url)
            raise
        finally:
            conn.close()

        warning = None
        if old_media_url and old_media_url != uploaded_url:
            try:
                self.dependencies.delete_post_media(old_media_url)
            except Exception:
                warning = "Post media was replaced, but the previous media could not be removed."
        return saved, warning

    def remove_media(self, post_id, actor):
        self._require_editor(actor)
        post_id = self._required_id(post_id)
        conn = self.dependencies.get_db()
        old_media_url = ""
        try:
            current_rows = self.repository.find_posts(conn, [post_id], lock=True)
            if not current_rows:
                raise AdminPostError({"detail": "Post not found"}, 404)
            before = current_rows[0]
            old_media_url = before.get("media_url") or ""
            if not before.get("content"):
                raise AdminPostError({"detail": "Media cannot be removed from a post without content"})
            self.repository.update_media(conn, post_id, "", "")
            saved = self.repository.find_posts(conn, [post_id])[0]
            self.repository.write_audit(
                conn, str(actor["id"]), post_id, "post_media_remove", before, saved
            )
            conn.commit()
        except AdminPostError:
            conn.rollback()
            raise
        except Exception:
            conn.rollback()
            raise
        finally:
            conn.close()

        warning = None
        if old_media_url:
            try:
                self.dependencies.delete_post_media(old_media_url)
            except Exception:
                warning = "Post media was removed, but the Blob could not be deleted."
        return saved, warning

    def _validate_create(self, payload):
        if not isinstance(payload, dict):
            raise AdminPostError({"detail": "Request body must be an object"})
        allowed = EDITABLE_FIELDS | {"creator_user_id"}
        unknown = set(payload) - allowed
        if unknown:
            raise AdminPostError({"detail": "Unsupported post fields", "fields": sorted(unknown)})
        creator_user_id = self._required_id(payload.get("creator_user_id"), "creator_user_id")
        title = self._clean_title(payload.get("title"))
        content = str(payload.get("content") or "").strip()
        if not content:
            raise AdminPostError({"detail": "Content is required when creating a post without media"})
        return {
            "creator_user_id": creator_user_id,
            "title": title,
            "content": content,
            "hashtags": self._normalize_hashtags(payload.get("hashtags")),
            "trust_status": self._trust_status(payload.get("trust_status") or "unreviewed"),
            "category": self._category(payload.get("category") or "General Wellness"),
        }

    def _validate_updates(self, updates):
        if not isinstance(updates, list) or not updates:
            raise AdminPostError({"detail": "updates must be a non-empty list"})
        if len(updates) > 100:
            raise AdminPostError({"detail": "updates cannot contain more than 100 posts"})
        normalized = []
        seen = set()
        for index, item in enumerate(updates):
            if not isinstance(item, dict):
                raise AdminPostError({"detail": f"Update at index {index} must be an object"})
            post_id = self._required_id(item.get("id"), f"updates[{index}].id")
            if post_id in seen:
                raise AdminPostError({"detail": "Duplicate post id in updates", "post_id": post_id})
            unknown = set(item) - EDITABLE_FIELDS - {"id"}
            if unknown:
                raise AdminPostError({"detail": "Unsupported editable fields", "fields": sorted(unknown)})
            changes = {"id": post_id}
            if "title" in item:
                changes["title"] = self._clean_title(item.get("title"))
            if "content" in item:
                changes["content"] = str(item.get("content") or "").strip()
            if "hashtags" in item:
                changes["hashtags"] = self._normalize_hashtags(item.get("hashtags"))
            if "trust_status" in item:
                changes["trust_status"] = self._trust_status(item.get("trust_status"))
            if "category" in item:
                changes["category"] = self._category(item.get("category"))
            if len(changes) == 1:
                raise AdminPostError({"detail": "Each update must include an editable field", "post_id": post_id})
            normalized.append(changes)
            seen.add(post_id)
        return normalized

    def _normalize_hashtags(self, value):
        if isinstance(value, list):
            value = ",".join(str(item) for item in value)
        return self.dependencies.normalize_hashtags(value)

    @staticmethod
    def _clean_title(value):
        title = str(value or "").strip()
        if not title:
            raise AdminPostError({"detail": "Title is required"})
        if len(title) > 180:
            raise AdminPostError({"detail": "Title cannot exceed 180 characters"})
        return title

    @staticmethod
    def _category(value):
        category = str(value or "").strip()
        if not category:
            raise AdminPostError({"detail": "Category is required"})
        if len(category) > 120:
            raise AdminPostError({"detail": "Category cannot exceed 120 characters"})
        return category

    @staticmethod
    def _trust_status(value):
        status = str(value or "").strip().lower()
        if status not in TRUST_STATUSES:
            raise AdminPostError(
                {"detail": "Invalid trust_status", "allowed_trust_status": sorted(TRUST_STATUSES)}
            )
        return status

    @staticmethod
    def _positive_int(value, default, field):
        try:
            parsed = int(value if value is not None else default)
        except (TypeError, ValueError) as exc:
            raise AdminPostError({"detail": f"{field} must be a positive integer"}) from exc
        if parsed < 1:
            raise AdminPostError({"detail": f"{field} must be a positive integer"})
        return parsed

    @staticmethod
    def _required_id(value, field="post_id"):
        identifier = str(value or "").strip()
        if not identifier:
            raise AdminPostError({"detail": f"{field} is required"})
        return identifier

    @classmethod
    def _validate_post_ids(cls, post_ids):
        if not isinstance(post_ids, list) or not post_ids:
            raise AdminPostError({"detail": "post_ids must be a non-empty list"})
        if len(post_ids) > 100:
            raise AdminPostError({"detail": "post_ids cannot contain more than 100 posts"})
        ids = [cls._required_id(post_id) for post_id in post_ids]
        if len(ids) != len(set(ids)):
            raise AdminPostError({"detail": "Duplicate post id in request"})
        return ids

    @staticmethod
    def _require_editor(actor):
        if actor.get("system_role") not in EDITOR_ROLES:
            raise AdminPostError({"detail": "This administrator has read-only post access"}, 403)

    def _delete_uncommitted_media(self, media_url):
        try:
            self.dependencies.delete_post_media(media_url)
        except Exception:
            pass

    def _upload_media(self, media, creator_user_id, post_id):
        if not media or not media.filename:
            raise AdminPostError({"detail": "Media file is required"})
        content_type = str(media.content_type or "")
        if content_type not in self.dependencies.allowed_media:
            raise AdminPostError({"detail": "Only images and videos are allowed"})
        file_bytes = media.read()
        if not file_bytes:
            raise AdminPostError({"detail": "Media file cannot be empty"})
        if len(file_bytes) > self.dependencies.max_file_bytes:
            raise AdminPostError({"detail": "File is too large"})
        extension = os.path.splitext(media.filename)[1].lower() or ".bin"
        pathname = f"posts/uploaded/{creator_user_id}/{post_id}/{uuid.uuid4()}{extension}"
        try:
            media_url = self.dependencies.upload_post_media(
                file_bytes, pathname, content_type
            )
        except Exception as exc:
            raise AdminPostError({"detail": f"Could not upload media: {exc}"}, 502) from exc
        media_type = "image" if content_type in self.dependencies.allowed_images else "video"
        return media_url, media_type
