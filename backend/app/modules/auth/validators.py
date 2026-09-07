"""Request validation for signup and login."""

from dataclasses import dataclass
import os


class ValidationError(Exception):
    def __init__(self, payload, status_code=400):
        super().__init__(payload.get("detail", "Invalid request"))
        self.payload = payload
        self.status_code = status_code


@dataclass(frozen=True)
class SignupData:
    name: str
    email: str
    password: str
    user_type: str
    specialty: str
    hospital: str
    bio: str
    title: str
    company_name: str
    store_name: str


@dataclass(frozen=True)
class VerificationDocument:
    content: bytes
    content_type: str
    extension: str


def validate_signup(data, normalize_user_type, allowed_user_types):
    name = (data.get("name") or "").strip()
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""
    requested_type = data.get("user_type") or data.get("role") or "general_user"
    user_type = normalize_user_type(requested_type)

    if not name:
        raise ValidationError({"detail": "Full name is required"})
    if not email or "@" not in email:
        raise ValidationError({"detail": "Valid email address is required"})
    if len(password) < 6:
        raise ValidationError({"detail": "Password must be at least 6 characters"})
    if user_type not in allowed_user_types:
        raise ValidationError({
            "detail": "Invalid user_type",
            "allowed_user_types": sorted(allowed_user_types),
        })

    return SignupData(
        name=name,
        email=email,
        password=password,
        user_type=user_type,
        specialty=(data.get("specialty") or "General Medicine").strip(),
        hospital=data.get("hospital") or "",
        bio=data.get("bio") or "",
        title=data.get("title") or "",
        company_name=data.get("company_name") or "",
        store_name=data.get("store_name") or "",
    )


def validate_login(data):
    email = (data.get("email") or data.get("username") or "").strip().lower()
    password = data.get("password") or ""
    if not email or not password:
        raise ValidationError({"detail": "Email and password are required"})
    return email, password


def prepare_verification_document(user_type, file, allowed_docs, max_file_bytes):
    if user_type not in {"doctor", "pharmacy_partner", "diagnostic_partner"}:
        return None
    if not file or not file.filename:
        raise ValidationError({
            "detail": (
                "Please upload the required professional certificate "
                f"to sign up as {user_type}."
            )
        })

    content_type = file.content_type or ""
    if content_type not in allowed_docs:
        raise ValidationError({
            "detail": "Verification document must be a PDF, JPG, PNG, or WEBP file"
        })

    content = file.read()
    if len(content) > max_file_bytes:
        raise ValidationError({"detail": "Verification document is too large"})

    return VerificationDocument(
        content=content,
        content_type=content_type,
        extension=os.path.splitext(file.filename)[1] or ".pdf",
    )
