"""Direct-SQL persistence for administrator post management."""

import json
import sqlite3
import uuid


POST_FIELDS = (
    "id",
    "creator_user_id",
    "title",
    "content",
    "hashtags",
    "trust_status",
    "category",
    "media_url",
    "media_type",
    "created_at",
    "creator_name",
    "creator_email",
    "comments_count",
    "views_count",
)

SORT_COLUMNS = {
    "created_at": "posts.created_at",
    "title": "LOWER(posts.title)",
    "trust_status": "posts.trust_status",
    "category": "LOWER(COALESCE(posts.category, ''))",
    "comments_count": "COALESCE(actions.comments_count, 0)",
    "views_count": "COALESCE(actions.views_count, 0)",
}

EDITABLE_COLUMNS = {
    "title": "title",
    "content": "content",
    "hashtags": "hashtags",
    "trust_status": "trust_status",
    "category": "category",
}

SELECT_POSTS = """
SELECT
    posts.id,
    posts.creator_user_id,
    posts.title,
    posts.content,
    posts.hashtags,
    posts.trust_status,
    posts.category,
    posts.media_url,
    posts.media_type,
    posts.created_at,
    users.name AS creator_name,
    users.email AS creator_email,
    COALESCE(actions.comments_count, 0) AS comments_count,
    COALESCE(actions.views_count, 0) AS views_count
FROM posts
JOIN users ON users.id = posts.creator_user_id
LEFT JOIN (
    SELECT
        post_id,
        SUM(CASE WHEN action_type='comment' THEN 1 ELSE 0 END) AS comments_count,
        SUM(CASE WHEN action_type='view' THEN 1 ELSE 0 END) AS views_count
    FROM post_actions
    GROUP BY post_id
) actions ON actions.post_id = posts.id
"""


def _serialize_post(row):
    post = dict(row) if row else None
    if not post:
        return None
    created_at = post.get("created_at")
    if hasattr(created_at, "isoformat"):
        post["created_at"] = created_at.isoformat()
    post["comments_count"] = int(post.get("comments_count") or 0)
    post["views_count"] = int(post.get("views_count") or 0)
    return {field: post.get(field) for field in POST_FIELDS}


class AdminPostsRepository:
    def __init__(self, get_db, db_exec):
        self.get_db = get_db
        self.db_exec = db_exec

    @staticmethod
    def _lock_suffix(conn, lock):
        return " FOR UPDATE OF posts" if lock and not isinstance(conn, sqlite3.Connection) else ""

    def list_posts(self, query):
        params = []
        where_sql = ""
        if query["search"]:
            where_sql = "WHERE LOWER(posts.title) LIKE %s"
            params.append(f"%{query['search'].lower()}%")

        conn = self.get_db()
        try:
            count_row = self.db_exec(
                conn,
                f"SELECT COUNT(*) AS total FROM posts {where_sql}",
                tuple(params),
            ).fetchone()
            sort_column = SORT_COLUMNS[query["sort"]]
            rows = self.db_exec(
                conn,
                SELECT_POSTS
                + f" {where_sql} ORDER BY {sort_column} {query['direction'].upper()}, "
                + f"posts.id {query['direction'].upper()} LIMIT %s OFFSET %s",
                tuple(params + [query["page_size"], query["offset"]]),
            ).fetchall()
            return [_serialize_post(row) for row in rows], int(dict(count_row)["total"])
        finally:
            conn.close()

    def find_creator(self, conn, user_id):
        row = self.db_exec(
            conn,
            "SELECT id,name,email FROM users WHERE id=%s",
            (user_id,),
        ).fetchone()
        return dict(row) if row else None

    def find_posts(self, conn, post_ids, lock=False):
        if not post_ids:
            return []
        placeholders = ",".join(["%s"] * len(post_ids))
        rows = self.db_exec(
            conn,
            SELECT_POSTS
            + f" WHERE posts.id IN ({placeholders})"
            + self._lock_suffix(conn, lock),
            tuple(post_ids),
        ).fetchall()
        return [_serialize_post(row) for row in rows]

    def create_post(self, conn, post):
        post_id = post.get("id") or str(uuid.uuid4())
        self.db_exec(
            conn,
            "INSERT INTO posts "
            "(id,creator_user_id,title,content,hashtags,trust_status,category,media_url,media_type) "
            "VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s)",
            (
                post_id,
                post["creator_user_id"],
                post["title"],
                post["content"],
                post["hashtags"],
                post["trust_status"],
                post["category"],
                post.get("media_url", ""),
                post.get("media_type", ""),
            ),
        )
        return post_id

    def update_post(self, conn, post_id, changes):
        assignments = []
        params = []
        for field, value in changes.items():
            assignments.append(f"{EDITABLE_COLUMNS[field]}=%s")
            params.append(value)
        params.append(post_id)
        self.db_exec(
            conn,
            f"UPDATE posts SET {','.join(assignments)} WHERE id=%s",
            tuple(params),
        )

    def update_media(self, conn, post_id, media_url, media_type):
        self.db_exec(
            conn,
            "UPDATE posts SET media_url=%s,media_type=%s WHERE id=%s",
            (media_url, media_type, post_id),
        )

    def delete_post(self, conn, post_id):
        self.db_exec(conn, "DELETE FROM post_actions WHERE post_id=%s", (post_id,))
        self.db_exec(conn, "DELETE FROM creator_analytics WHERE post_id=%s", (post_id,))
        self.db_exec(conn, "DELETE FROM posts WHERE id=%s", (post_id,))

    def write_audit(self, conn, actor_user_id, entity_id, action, before, after):
        self.db_exec(
            conn,
            "INSERT INTO admin_audit_log "
            "(id,actor_user_id,entity_type,entity_id,action,before_value,after_value,created_at) "
            "VALUES (%s,%s,'post',%s,%s,%s,%s,CURRENT_TIMESTAMP)",
            (
                str(uuid.uuid4()),
                actor_user_id,
                entity_id,
                action,
                json.dumps(before, sort_keys=True, default=str) if before is not None else None,
                json.dumps(after, sort_keys=True, default=str) if after is not None else None,
            ),
        )
