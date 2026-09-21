"""Direct-SQL persistence for administrator user management."""

import sqlite3
import uuid


SORT_COLUMNS = {
    "id": "users.id",
    "name": "LOWER(users.name)",
    "email": "LOWER(users.email)",
    "user_type": "users.user_type",
    "system_role": "users.system_role",
    "specialty": "LOWER(COALESCE(doctors.specialty, ''))",
    "created_at": "users.created_at",
}


def _as_dict(row):
    return dict(row) if row else None


def _serialize_user(row):
    user = _as_dict(row)
    if not user:
        return None
    created_at = user.get("created_at")
    if hasattr(created_at, "isoformat"):
        user["created_at"] = created_at.isoformat()
    return user


class UsersRepository:
    def __init__(self, get_db, db_exec):
        self.get_db = get_db
        self.db_exec = db_exec

    def list_users(self, query):
        conditions = []
        params = []
        if query["q"]:
            search = f"%{query['q'].lower()}%"
            conditions.append(
                "(LOWER(users.id) LIKE %s OR LOWER(users.name) LIKE %s "
                "OR LOWER(users.email) LIKE %s OR "
                "LOWER(COALESCE(doctors.specialty, '')) LIKE %s)"
            )
            params.extend((search, search, search, search))
        if query["user_type"]:
            conditions.append("users.user_type=%s")
            params.append(query["user_type"])
        if query["system_role"]:
            conditions.append("users.system_role=%s")
            params.append(query["system_role"])

        where_sql = f"WHERE {' AND '.join(conditions)}" if conditions else ""
        base_sql = (
            "FROM users LEFT JOIN doctors ON doctors.user_id=users.id "
            f"{where_sql}"
        )
        conn = self.get_db()
        try:
            count = self.db_exec(
                conn,
                f"SELECT COUNT(*) AS total {base_sql}",
                tuple(params),
            ).fetchone()
            sort_column = SORT_COLUMNS[query["sort"]]
            rows = self.db_exec(
                conn,
                "SELECT users.id,users.name,users.email,users.user_type,"
                "users.system_role,doctors.specialty,users.created_at "
                f"{base_sql} ORDER BY {sort_column} {query['direction'].upper()} "
                "LIMIT %s OFFSET %s",
                tuple(params + [query["page_size"], query["offset"]]),
            ).fetchall()
            return [_serialize_user(row) for row in rows], int(dict(count)["total"])
        finally:
            conn.close()

    def find_user_by_email(self, conn, email):
        return _as_dict(
            self.db_exec(
                conn,
                "SELECT id FROM users WHERE LOWER(email)=LOWER(%s)",
                (email,),
            ).fetchone()
        )

    def find_users(self, conn, user_ids, lock=False):
        if not user_ids:
            return []
        placeholders = ",".join(["%s"] * len(user_ids))
        lock_sql = " FOR UPDATE" if lock and not isinstance(conn, sqlite3.Connection) else ""
        rows = self.db_exec(
            conn,
            "SELECT users.id,users.name,users.email,users.user_type,"
            "users.system_role,doctors.specialty,users.created_at "
            "FROM users LEFT JOIN doctors ON doctors.user_id=users.id "
            f"WHERE users.id IN ({placeholders}){lock_sql}",
            tuple(user_ids),
        ).fetchall()
        return [_serialize_user(row) for row in rows]

    def count_super_admins(self, conn):
        row = self.db_exec(
            conn,
            "SELECT COUNT(*) AS total FROM users WHERE system_role='super_admin'",
        ).fetchone()
        return int(dict(row)["total"])

    def create_user(self, conn, user):
        user_id = str(uuid.uuid4())
        self.db_exec(
            conn,
            "INSERT INTO users "
            "(id,name,email,password,user_type,system_role,hu_coins) "
            "VALUES (%s,%s,%s,%s,%s,%s,0)",
            (
                user_id,
                user["name"],
                user["email"],
                user["password_hash"],
                user["user_type"],
                user["system_role"],
            ),
        )
        if user["user_type"] == "doctor":
            self.db_exec(
                conn,
                "INSERT INTO doctors "
                "(id,user_id,name,specialty,verification_status,created_at,updated_at) "
                "VALUES (%s,%s,%s,%s,'pending',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP)",
                (str(uuid.uuid4()), user_id, user["name"], user["specialty"]),
            )
        return user_id

    def update_user(self, conn, current_user, changes):
        if "name" in changes:
            self.db_exec(
                conn,
                "UPDATE users SET name=%s WHERE id=%s",
                (changes["name"], current_user["id"]),
            )
        if "system_role" in changes:
            self.db_exec(
                conn,
                "UPDATE users SET system_role=%s WHERE id=%s",
                (changes["system_role"], current_user["id"]),
            )
        target_user_type = changes.get("user_type", current_user["user_type"])
        if "user_type" in changes:
            self.db_exec(
                conn,
                "UPDATE users SET user_type=%s WHERE id=%s",
                (target_user_type, current_user["id"]),
            )
        doctor = self.db_exec(
            conn,
            "SELECT id FROM doctors WHERE user_id=%s",
            (current_user["id"],),
        ).fetchone()
        if target_user_type == "doctor":
            doctor_name = changes.get("name", current_user["name"])
            specialty = changes.get("specialty", current_user.get("specialty"))
            if doctor:
                self.db_exec(
                    conn,
                    "UPDATE doctors SET name=%s,specialty=%s,updated_at=CURRENT_TIMESTAMP WHERE user_id=%s",
                    (doctor_name, specialty, current_user["id"]),
                )
            else:
                self.db_exec(
                    conn,
                    "INSERT INTO doctors (id,user_id,name,specialty,verification_status,created_at,updated_at) VALUES (%s,%s,%s,%s,'pending',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP)",
                    (str(uuid.uuid4()), current_user["id"], doctor_name, specialty),
                )
        elif doctor and current_user["user_type"] == "doctor":
            self.db_exec(conn, "DELETE FROM doctors WHERE user_id=%s", (current_user["id"],))

    def delete_user(self, conn, user_id):
        self.db_exec(conn, "DELETE FROM user_sessions WHERE user_id=%s", (user_id,))
        self.db_exec(conn, "DELETE FROM doctors WHERE user_id=%s", (user_id,))
        self.db_exec(conn, "DELETE FROM users WHERE id=%s", (user_id,))
