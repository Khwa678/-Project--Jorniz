"""Direct-SQL persistence for signup and login."""

import uuid


class AuthRepository:
    def __init__(self, db_one, get_db, db_exec, create_session):
        self.db_one = db_one
        self.get_db = get_db
        self.db_exec = db_exec
        self.create_session = create_session

    def find_user_by_email(self, email):
        return self.db_one("SELECT * FROM users WHERE email=%s", (email,))

    def find_user_id_by_email(self, email):
        return self.db_one("SELECT id FROM users WHERE email=%s", (email,))

    def find_user_by_id(self, user_id):
        return self.db_one("SELECT * FROM users WHERE id=%s", (user_id,))

    def create_session_for_user(self, user_id):
        return self.create_session(user_id)

    def create_account(self, signup, password_hash, document_url, verification_status):
        user_id = str(uuid.uuid4())
        profile_id = str(uuid.uuid4())
        conn = self.get_db()
        try:
            self.db_exec(
                conn,
                """INSERT INTO users (id,name,email,password,user_type,system_role,hu_coins)
                   VALUES (%s,%s,%s,%s,%s,%s,0)""",
                (
                    user_id,
                    signup.name,
                    signup.email,
                    password_hash,
                    signup.user_type,
                    "member",
                ),
            )
            self._create_profile(
                conn,
                profile_id,
                user_id,
                signup,
                document_url,
                verification_status,
            )
            session_id, refresh_token = self.create_session(user_id, conn)
            conn.commit()
        except Exception:
            conn.rollback()
            raise
        finally:
            conn.close()
        return user_id, session_id, refresh_token

    def _create_profile(
        self,
        conn,
        profile_id,
        user_id,
        signup,
        document_url,
        verification_status,
    ):
        if signup.user_type == "doctor":
            self.db_exec(
                conn,
                """INSERT INTO doctors
                   (id,user_id,name,specialty,hospital,bio,verification_document_url,verification_status)
                   VALUES (%s,%s,%s,%s,%s,%s,%s,%s)""",
                (
                    profile_id,
                    user_id,
                    signup.name,
                    signup.specialty,
                    signup.hospital,
                    signup.bio,
                    document_url,
                    verification_status,
                ),
            )
        elif signup.user_type == "job_seeker":
            self.db_exec(
                conn,
                "INSERT INTO candidate_profiles (id,user_id,title) VALUES (%s,%s,%s)",
                (profile_id, user_id, signup.title),
            )
        elif signup.user_type == "recruiter":
            self.db_exec(
                conn,
                "INSERT INTO company_profiles (id,user_id,company_name) VALUES (%s,%s,%s)",
                (profile_id, user_id, signup.company_name or signup.hospital or signup.name),
            )
        elif signup.user_type == "seller":
            self.db_exec(
                conn,
                "INSERT INTO seller_profiles (id,user_id,store_name) VALUES (%s,%s,%s)",
                (profile_id, user_id, signup.store_name or signup.name),
            )
        elif signup.user_type == "advertiser":
            self.db_exec(
                conn,
                "INSERT INTO advertisers (id,user_id,company_name) VALUES (%s,%s,%s)",
                (profile_id, user_id, signup.company_name or signup.name),
            )
        elif signup.user_type in {"pharmacy_partner", "diagnostic_partner"}:
            self.db_exec(
                conn,
                """INSERT INTO creator_verifications
                   (id,user_id,category,document_url,status) VALUES (%s,%s,%s,%s,%s)""",
                (profile_id, user_id, signup.user_type, document_url, "Pending"),
            )
