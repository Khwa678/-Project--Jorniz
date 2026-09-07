"""Authentication use cases and dependency contract."""

from dataclasses import dataclass
import uuid

import bcrypt

from .repository import AuthRepository
from .validators import prepare_verification_document, validate_login, validate_signup


class AuthError(Exception):
    def __init__(self, payload, status_code):
        super().__init__(payload.get("detail", "Authentication failed"))
        self.payload = payload
        self.status_code = status_code


@dataclass(frozen=True)
class AuthDependencies:
    db_one: object
    get_db: object
    db_exec: object
    create_session: object
    make_token: object
    user_payload: object
    normalize_user_type: object
    upload_verification_document: object
    allowed_user_types: object
    allowed_docs: object
    max_file_bytes: int


class AuthService:
    def __init__(self, dependencies):
        self.dependencies = dependencies
        self.repository = AuthRepository(
            dependencies.db_one,
            dependencies.get_db,
            dependencies.db_exec,
            dependencies.create_session,
        )

    def signup(self, data, document_file):
        signup = validate_signup(
            data,
            self.dependencies.normalize_user_type,
            self.dependencies.allowed_user_types,
        )
        if self.repository.find_user_id_by_email(signup.email):
            raise AuthError(
                {"detail": "This email is already registered. Please log in."},
                400,
            )

        document = prepare_verification_document(
            signup.user_type,
            document_file,
            self.dependencies.allowed_docs,
            self.dependencies.max_file_bytes,
        )
        needs_verification = document is not None
        document_url = ""
        verification_status = "pending" if needs_verification else "not_required"
        if document:
            filename = f"verification/{uuid.uuid4()}{document.extension}"
            try:
                document_url = self.dependencies.upload_verification_document(
                    document.content,
                    filename,
                    document.content_type,
                )
            except Exception as exc:
                raise AuthError(
                    {"detail": f"Could not upload verification document: {exc}"},
                    500,
                ) from exc

        password_hash = bcrypt.hashpw(
            signup.password.encode(), bcrypt.gensalt()
        ).decode()
        user_id, session_id, refresh_token = self.repository.create_account(
            signup,
            password_hash,
            document_url,
            verification_status,
        )
        user = self.dependencies.user_payload(
            self.repository.find_user_by_id(user_id)
        )
        message = f"Welcome to Healthy Universe, {signup.name}! 🎉"
        if needs_verification:
            message += (
                " Your professional documents are under review — you'll be marked "
                "verified once approved."
            )
        return {
            "access_token": self.dependencies.make_token(user_id, session_id),
            "refresh_token": refresh_token,
            "token_type": "bearer",
            "user": user,
            "message": message,
        }

    def login(self, data):
        email, password = validate_login(data)
        user = self.repository.find_user_by_email(email)
        if not user:
            raise AuthError(
                {"detail": "No account found with this email. Please sign up."},
                401,
            )
        if not bcrypt.checkpw(password.encode(), user["password"].encode()):
            raise AuthError(
                {"detail": "Incorrect password. Please try again."},
                401,
            )
        if user.get("is_banned"):
            raise AuthError(
                {"detail": "Your account has been suspended. Contact support."},
                403,
            )

        payload = self.dependencies.user_payload(user)
        session_id, refresh_token = self.repository.create_session_for_user(payload["id"])
        return {
            "access_token": self.dependencies.make_token(payload["id"], session_id),
            "refresh_token": refresh_token,
            "token_type": "bearer",
            "user": payload,
            "message": f"Welcome back, {payload['name']}! 👋",
        }
