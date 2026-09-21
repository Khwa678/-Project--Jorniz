import io
import os
import sqlite3
import tempfile
import unittest
from functools import wraps

from flask import Flask, request

from app.modules.posts import AdminPostDependencies, create_posts_blueprint


SCHEMA = """
CREATE TABLE users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    system_role TEXT NOT NULL
);
CREATE TABLE posts (
    id TEXT PRIMARY KEY,
    creator_user_id TEXT NOT NULL REFERENCES users(id),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    hashtags TEXT NOT NULL DEFAULT '',
    trust_status TEXT NOT NULL DEFAULT 'unreviewed',
    category TEXT NOT NULL DEFAULT 'General Wellness',
    media_url TEXT NOT NULL DEFAULT '',
    media_type TEXT NOT NULL DEFAULT '',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE post_actions (
    id TEXT PRIMARY KEY,
    post_id TEXT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    action_type TEXT NOT NULL,
    action_value TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE creator_analytics (
    id TEXT PRIMARY KEY,
    post_id TEXT NOT NULL
);
CREATE TABLE admin_audit_log (
    id TEXT PRIMARY KEY,
    actor_user_id TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    action TEXT NOT NULL,
    before_value TEXT,
    after_value TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
"""


class AdminPostsApiTests(unittest.TestCase):
    def setUp(self):
        handle, self.db_path = tempfile.mkstemp(suffix=".sqlite3")
        os.close(handle)
        conn = sqlite3.connect(self.db_path)
        conn.executescript(SCHEMA)
        conn.executemany(
            "INSERT INTO users (id,name,email,system_role) VALUES (?,?,?,?)",
            [
                ("admin-1", "Admin", "admin@example.com", "admin"),
                ("author-1", "Doctor One", "doctor@example.com", "member"),
                ("viewer-1", "Viewer", "viewer@example.com", "member"),
            ],
        )
        conn.executemany(
            "INSERT INTO posts "
            "(id,creator_user_id,title,content,hashtags,trust_status,category,media_url,media_type,created_at) "
            "VALUES (?,?,?,?,?,?,?,?,?,?)",
            [
                ("post-old", "author-1", "Older Heart Note", "Old", "heart", "unreviewed", "Heart", "", "", "2026-01-01 10:00:00"),
                ("post-new", "author-1", "New Heart Guide", "New", "heart", "trusted", "Heart", "https://old.blob.vercel-storage.com/post.jpg", "image", "2026-01-02 10:00:00"),
                ("post-other", "author-1", "Nutrition Basics", "Food", "nutrition", "unreviewed", "Nutrition", "", "", "2026-01-03 10:00:00"),
            ],
        )
        conn.executemany(
            "INSERT INTO post_actions (id,post_id,user_id,action_type,action_value) VALUES (?,?,?,?,?)",
            [
                ("comment-1", "post-new", "viewer-1", "comment", "Useful"),
                ("view-1", "post-new", "viewer-1", "view", None),
                ("view-2", "post-old", "viewer-1", "view", None),
            ],
        )
        conn.commit()
        conn.close()

        self.uploaded = []
        self.deleted_blobs = []

        def get_db():
            connection = sqlite3.connect(self.db_path)
            connection.row_factory = sqlite3.Row
            connection.execute("PRAGMA foreign_keys=ON")
            return connection

        def db_exec(connection, sql, params=()):
            return connection.execute(sql.replace("%s", "?"), params)

        def require_admin(handler):
            @wraps(handler)
            def decorated(*args, **kwargs):
                role = request.headers.get("X-Test-Role", "admin")
                if role not in {"admin", "finance_admin", "super_admin"}:
                    return {"detail": "Admin access required"}, 403
                request.current_user = {"id": "admin-1", "system_role": role}
                return handler(*args, **kwargs)

            return decorated

        def upload_media(file_bytes, pathname, content_type):
            self.uploaded.append((file_bytes, pathname, content_type))
            return "https://new.blob.vercel-storage.com/post.jpg"

        def delete_media(url):
            self.deleted_blobs.append(url)
            return True

        def normalize_hashtags(value):
            tags = []
            for item in str(value or "").split(","):
                tag = item.strip().lstrip("#").replace(" ", "")
                if tag:
                    tags.append(tag)
            return ",".join(tags)

        dependencies = AdminPostDependencies(
            get_db=get_db,
            db_exec=db_exec,
            require_admin=require_admin,
            upload_post_media=upload_media,
            delete_post_media=delete_media,
            normalize_hashtags=normalize_hashtags,
            allowed_media={"image/png", "image/jpeg", "video/mp4"},
            allowed_images={"image/png", "image/jpeg"},
            max_file_bytes=1024 * 1024,
        )
        app = Flask(__name__)
        app.register_blueprint(create_posts_blueprint(dependencies))
        app.config.update(TESTING=True)
        self.client = app.test_client()

    def tearDown(self):
        os.unlink(self.db_path)

    def rows(self, sql, params=()):
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        try:
            return [dict(row) for row in conn.execute(sql, params).fetchall()]
        finally:
            conn.close()

    def test_list_searches_title_only_and_returns_recent_posts_with_aggregates(self):
        response = self.client.get("/api/admin/posts?search=heart&page=1&page_size=10")
        self.assertEqual(200, response.status_code)
        body = response.get_json()
        self.assertEqual({"page": 1, "page_size": 10, "total": 2}, {key: body[key] for key in ("page", "page_size", "total")})
        self.assertEqual(["post-new", "post-old"], [post["id"] for post in body["items"]])
        self.assertEqual("Doctor One", body["items"][0]["creator_name"])
        self.assertEqual("doctor@example.com", body["items"][0]["creator_email"])
        self.assertEqual(1, body["items"][0]["comments_count"])
        self.assertEqual(1, body["items"][0]["views_count"])

    def test_rejects_unallowlisted_sort_and_finance_admin_mutation(self):
        response = self.client.get("/api/admin/posts?sort=created_at;DROP TABLE posts")
        self.assertEqual(400, response.status_code)
        response = self.client.patch(
            "/api/admin/posts",
            headers={"X-Test-Role": "finance_admin"},
            json={"updates": [{"id": "post-new", "trust_status": "flagged"}]},
        )
        self.assertEqual(403, response.status_code)

    def test_create_and_bulk_update_are_audited(self):
        created = self.client.post(
            "/api/admin/posts",
            json={
                "creator_user_id": "author-1",
                "title": "Admin Post",
                "content": "Created by an administrator.",
                "hashtags": "#HeartHealth, Healthy Heart",
                "category": "Heart",
            },
        )
        self.assertEqual(201, created.status_code, created.get_json())
        post = created.get_json()["post"]
        self.assertEqual("HeartHealth,HealthyHeart", post["hashtags"])

        updated = self.client.patch(
            "/api/admin/posts",
            json={
                "updates": [
                    {"id": post["id"], "trust_status": "trusted"},
                    {"id": "post-old", "category": "Cardiology"},
                ]
            },
        )
        self.assertEqual(200, updated.status_code, updated.get_json())
        self.assertEqual(2, updated.get_json()["updated_count"])
        audits = self.rows("SELECT action FROM admin_audit_log ORDER BY created_at,id")
        self.assertEqual(1, sum(row["action"] == "post_create" for row in audits))
        self.assertEqual(2, sum(row["action"] == "post_update" for row in audits))

    def test_create_with_media_uploads_blob_and_saves_url(self):
        response = self.client.post(
            "/api/admin/posts",
            data={
                "creator_user_id": "author-1",
                "title": "Post with media",
                "content": "Created with one media request.",
                "hashtags": "HeartHealth",
                "category": "Heart",
                "media": (io.BytesIO(b"image"), "heart.png"),
            },
            content_type="multipart/form-data",
        )

        self.assertEqual(201, response.status_code, response.get_json())
        post = response.get_json()["post"]
        self.assertEqual("https://new.blob.vercel-storage.com/post.jpg", post["media_url"])
        self.assertEqual("image", post["media_type"])
        self.assertEqual(1, len(self.uploaded))
        self.assertIn(f"posts/uploaded/author-1/{post['id']}/", self.uploaded[0][1])

    def test_bulk_update_rolls_back_when_any_post_is_missing(self):
        response = self.client.patch(
            "/api/admin/posts",
            json={
                "updates": [
                    {"id": "post-old", "trust_status": "flagged"},
                    {"id": "missing", "trust_status": "rejected"},
                ]
            },
        )
        self.assertEqual(404, response.status_code)
        post = self.rows("SELECT trust_status FROM posts WHERE id='post-old'")[0]
        self.assertEqual("unreviewed", post["trust_status"])
        self.assertEqual([], self.rows("SELECT * FROM admin_audit_log"))

    def test_bulk_delete_removes_posts_actions_and_media_after_commit(self):
        response = self.client.delete(
            "/api/admin/posts",
            json={"post_ids": ["post-new", "post-old"]},
        )
        self.assertEqual(200, response.status_code, response.get_json())
        self.assertEqual(2, response.get_json()["deleted_count"])
        self.assertEqual([], self.rows("SELECT id FROM posts WHERE id IN ('post-new','post-old')"))
        self.assertEqual([], self.rows("SELECT id FROM post_actions WHERE post_id IN ('post-new','post-old')"))
        self.assertEqual(["https://old.blob.vercel-storage.com/post.jpg"], self.deleted_blobs)

    def test_replace_and_remove_media_use_blob_helpers_and_audit(self):
        response = self.client.post(
            "/api/admin/posts/post-new/media",
            data={"media": (io.BytesIO(b"image"), "new.png")},
            content_type="multipart/form-data",
        )
        self.assertEqual(200, response.status_code, response.get_json())
        self.assertEqual("https://new.blob.vercel-storage.com/post.jpg", response.get_json()["post"]["media_url"])
        self.assertEqual("image", response.get_json()["post"]["media_type"])
        self.assertIn("https://old.blob.vercel-storage.com/post.jpg", self.deleted_blobs)

        response = self.client.delete("/api/admin/posts/post-new/media")
        self.assertEqual(200, response.status_code, response.get_json())
        self.assertEqual("", response.get_json()["post"]["media_url"])
        self.assertIn("https://new.blob.vercel-storage.com/post.jpg", self.deleted_blobs)
        actions = [row["action"] for row in self.rows("SELECT action FROM admin_audit_log")]
        self.assertIn("post_media_replace", actions)
        self.assertIn("post_media_remove", actions)


if __name__ == "__main__":
    unittest.main()
