# import eventlet
# eventlet.monkey_patch()
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from datetime import datetime, timedelta, timezone
from functools import wraps
from dotenv import load_dotenv
import os, uuid, bcrypt, jwt, random, requests, hashlib, secrets
try:
    import psycopg2, psycopg2.extras
except ImportError:
    psycopg2 = None
from flask_socketio import SocketIO, emit, join_room
from auth_policy import is_active_account, permission_decision, professional_approval_state
from app.modules.auth import AuthDependencies, create_auth_blueprint

load_dotenv()


SUPABASE_URL          = os.getenv("SUPABASE_URL", "").strip()
SUPABASE_SERVICE_KEY  = os.getenv("SUPABASE_SERVICE_KEY", "").strip()
SUPABASE_BUCKET       = os.getenv("SUPABASE_BUCKET", "media").strip() or "media"
BLOB_READ_WRITE_TOKEN = os.getenv("BLOB_READ_WRITE_TOKEN", "").strip()

try:
    from vercel.blob import BlobClient
except ImportError:
    BlobClient = None

try:
    from supabase import create_client
    if SUPABASE_URL and SUPABASE_SERVICE_KEY:
        supabase_client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
        print("[INFO] Supabase Storage client ready")
    else:
        supabase_client = None
        print("[INFO] Supabase Storage not configured — using local storage fallback")
except Exception:
    supabase_client = None
    print("[INFO] Supabase SDK not installed — using local storage fallback")


def upload_to_supabase(file_bytes: bytes, filename: str, content_type: str) -> str:
    """Uploads bytes to Supabase Storage and returns a public URL."""
    if not supabase_client:
        raise RuntimeError("Supabase Storage is not configured")

    supabase_client.storage.from_(SUPABASE_BUCKET).upload(
        filename,
        file_bytes,
        {"content-type": content_type}
    )
    return supabase_client.storage.from_(SUPABASE_BUCKET).get_public_url(filename)


def upload_post_media_to_blob(file_bytes: bytes, filename: str, content_type: str) -> str:
    """Upload public post media to Vercel Blob and return its durable URL."""
    if not BLOB_READ_WRITE_TOKEN:
        raise RuntimeError("Vercel Blob is not configured")
    if BlobClient is None:
        raise RuntimeError("Vercel Blob SDK is not installed")

    with BlobClient(token=BLOB_READ_WRITE_TOKEN) as client:
        blob = client.put(
            filename,
            file_bytes,
            access="public",
            content_type=content_type,
            add_random_suffix=True,
        )
    return blob.url


def delete_post_media_blob(media_url: str) -> bool:
    """Delete only media URLs that belong to Vercel Blob."""
    if not media_url or ".blob.vercel-storage.com/" not in media_url:
        return False
    if not BLOB_READ_WRITE_TOKEN:
        raise RuntimeError("Vercel Blob is not configured")
    if BlobClient is None:
        raise RuntimeError("Vercel Blob SDK is not installed")

    with BlobClient(token=BLOB_READ_WRITE_TOKEN) as client:
        client.delete(media_url)
    return True

# ─── CONFIG ────────────────────────────────────────────────────────────────────
ENVIRONMENT  = os.getenv("ENVIRONMENT", os.getenv("FLASK_ENV", "development")).strip().lower()
IS_PRODUCTION = ENVIRONMENT in ("production", "prod")

def _as_list_csv(value):
    return [v.strip() for v in (value or "").split(",") if v.strip()]

def _get_required(name, default=""):
    value = os.getenv(name, default)
    return str(value).strip() if value is not None else default

SECRET_KEY = _get_required("SECRET_KEY")
if not SECRET_KEY:
    if IS_PRODUCTION:
        raise RuntimeError("SECURITY ERROR: SECRET_KEY must be set in production")
    SECRET_KEY = "dev-not-secure-change-before-deploy"
    print("[WARN] SECRET_KEY not set; using development fallback")

ALLOWED_ORIGINS = _as_list_csv(os.getenv("ALLOWED_ORIGINS", ""))
LOCAL_DEVELOPMENT_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:8000",
    "http://127.0.0.1:8000",
]
if not ALLOWED_ORIGINS:
    if IS_PRODUCTION:
        raise RuntimeError("SECURITY ERROR: ALLOWED_ORIGINS is required in production")
    ALLOWED_ORIGINS = LOCAL_DEVELOPMENT_ORIGINS.copy()
elif "*" in ALLOWED_ORIGINS:
    if IS_PRODUCTION:
        raise RuntimeError("SECURITY ERROR: ALLOWED_ORIGINS cannot be wildcard (*) in production")
    ALLOWED_ORIGINS = [x for x in ALLOWED_ORIGINS if x != "*"] or ["http://localhost:3000"]
if not IS_PRODUCTION:
    ALLOWED_ORIGINS = list(dict.fromkeys(ALLOWED_ORIGINS + LOCAL_DEVELOPMENT_ORIGINS))

TOKEN_EXPIRE_DAYS = int(_get_required("TOKEN_EXPIRE_DAYS", "1"))
UPLOAD_DIR        = os.path.join(os.path.dirname(__file__), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    ""
)

# ─── EMAIL (EmailJS REST API) CONFIG — for OTP / forgot password ──────────────
EMAILJS_SERVICE_ID  = _get_required("EMAILJS_SERVICE_ID", "")
EMAILJS_TEMPLATE_ID = _get_required("EMAILJS_TEMPLATE_ID", "")
EMAILJS_PUBLIC_KEY  = _get_required("EMAILJS_PUBLIC_KEY", "")
EMAILJS_PRIVATE_KEY = _get_required("EMAILJS_PRIVATE_KEY", "")
OTP_EXPIRE_MINUTES  = int(os.getenv("OTP_EXPIRE_MINUTES", 10))
MAX_OTP_ATTEMPTS    = 5

# ─── AD REWARDS CONFIG — HU Coins for viewing/clicking ads ────────────────────
COIN_REWARD_PER_IMPRESSION = int(_get_required("COIN_REWARD_PER_IMPRESSION", "1"))
COIN_REWARD_PER_CLICK      = int(_get_required("COIN_REWARD_PER_CLICK", "5"))
COST_PER_IMPRESSION        = float(_get_required("COST_PER_IMPRESSION", "0.01"))

ALLOWED_IMAGES = {"image/jpeg","image/png","image/gif","image/webp"}
ALLOWED_VIDEOS = {"video/mp4","video/webm","video/quicktime"}
ALLOWED_AUDIO = {"audio/webm","audio/mp4","audio/mpeg","audio/ogg","audio/wav"}
ALLOWED_DOCS = {"application/pdf","image/jpeg","image/png","image/webp"}
MAX_FILE_BYTES = 500 * 1024 * 1024

# ─── ROLES THAT REQUIRE A VERIFICATION DOCUMENT AT SIGNUP ─────────────────────
# Anyone signing up as one of these professional roles MUST attach a degree /
# registration / license document at signup time. Patients / general users don't.
PROFESSIONAL_ROLES = {
    "Doctor", "Ayurvedic Doctor", "Homeopathic Doctor", "Unani Practitioner",
    "Naturopath", "Nurse", "Dentist", "Pharmacist", "Physiotherapist",
    "Psychologist", "Nutritionist", "Researcher", "Healthcare Professional",
}

USER_TYPES = {
    "general_user", "creator", "job_seeker", "recruiter", "doctor",
    "seller", "pharmacy_partner", "diagnostic_partner", "advertiser",
}
SYSTEM_ROLES = {"member", "moderator", "admin", "finance_admin", "super_admin"}
USER_TYPE_ALIASES = {
    "patient": "general_user", "general user": "general_user",
    "job seeker": "job_seeker", "employer": "recruiter",
    "brand": "seller", "pharmacist": "pharmacy_partner",
    "pharmacy partner": "pharmacy_partner",
    "diagnostic partner": "diagnostic_partner",
}
USER_TYPE_ALIASES.update({role.lower(): "doctor" for role in PROFESSIONAL_ROLES if role != "Pharmacist"})


def normalize_user_type(value):
    key = str(value or "general_user").strip().lower().replace("-", " ").replace("_", " ")
    canonical = key.replace(" ", "_")
    return canonical if canonical in USER_TYPES else USER_TYPE_ALIASES.get(key)

# ─── APP ───────────────────────────────────────────────────────────────────────
app = Flask(__name__)
cors_env = ALLOWED_ORIGINS
CORS(app, origins=cors_env)

socketio = SocketIO(app, cors_allowed_origins=cors_env, async_mode="threading")

online_users = {}
sid_to_user  = {}

# ─── DB HELPERS ────────────────────────────────────────────────────────────────
import sqlite3

def get_db():
    if DATABASE_URL and DATABASE_URL.startswith("postgresql"):
        import psycopg2, psycopg2.extras
        return psycopg2.connect(DATABASE_URL, cursor_factory=psycopg2.extras.RealDictCursor)
    else:
        db_path = os.path.join(os.path.dirname(__file__), "healthy_universe.db")
        conn = sqlite3.connect(db_path)
        conn.row_factory = sqlite3.Row
        return conn

def db_one(sql, params=()):
    conn = get_db()
    try:
        cur = conn.cursor()
        exec_sql = sql.replace("%s", "?") if isinstance(conn, sqlite3.Connection) else sql
        cur.execute(exec_sql, params)
        row = cur.fetchone()
        return dict(row) if row else None
    finally:
        conn.close()

def db_all(sql, params=()):
    conn = get_db()
    try:
        cur = conn.cursor()
        exec_sql = sql.replace("%s", "?") if isinstance(conn, sqlite3.Connection) else sql
        cur.execute(exec_sql, params)
        rows = cur.fetchall()
        return [dict(r) for r in rows] if rows else []
    finally:
        conn.close()

def db_run(sql, params=()):
    conn = get_db()
    try:
        cur = conn.cursor()
        exec_sql = sql.replace("%s", "?") if isinstance(conn, sqlite3.Connection) else sql
        cur.execute(exec_sql, params)
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()

def db_exec(conn, sql, params=()):
    cur = conn.cursor()
    cur.execute(sql.replace("%s", "?") if isinstance(conn, sqlite3.Connection) else sql, params)
    return cur

def safe_user(u) -> dict:
    if not u: return {}
    u = dict(u)
    u.pop("password", None)
    u.pop("verification_doc", None)
    u.pop("verification_doc_url", None)
    for k, v in u.items():
        if isinstance(v, datetime):
            u[k] = v.isoformat()
    return u

def user_payload(user) -> dict:
    data = safe_user(user)
    user_type = normalize_user_type(data.get("user_type") or data.get("role")) or "general_user"
    data["user_type"] = user_type
    data["system_role"] = data.get("system_role") if data.get("system_role") in SYSTEM_ROLES else "member"
    uid = data.get("id")
    profile_queries = {
        "doctor": "SELECT id,specialty,qualification,experience_years,hospital,location,consultation_fee,rating,reviews_count,verification_status FROM doctors WHERE user_id=%s",
        "job_seeker": "SELECT id,title,experience_summary,skills,certifications,portfolio_url FROM candidate_profiles WHERE user_id=%s",
        "recruiter": "SELECT id,company_name,logo_url,website,industry,is_verified FROM company_profiles WHERE user_id=%s",
        "seller": "SELECT id,store_name,rating,status FROM seller_profiles WHERE user_id=%s",
        "advertiser": "SELECT id,company_name,verified,prepaid_balance FROM advertisers WHERE user_id=%s",
        "pharmacy_partner": "SELECT id,category AS partner_type,status AS verification_status FROM creator_verifications WHERE user_id=%s ORDER BY created_at DESC LIMIT 1",
        "diagnostic_partner": "SELECT id,category AS partner_type,status AS verification_status FROM creator_verifications WHERE user_id=%s ORDER BY created_at DESC LIMIT 1",
    }
    data["profile"] = db_one(profile_queries[user_type], (uid,)) if uid and user_type in profile_queries else {}
    data["verification_status"] = professional_approval_state(data)
    data["professional_access"] = data["verification_status"] in {"approved", "not_required"}
    return data

def create_notification(user_id, actor_id, ntype, post_id=None, message=""):
    """user_id = recipient, actor_id = who did the action. Never notify yourself."""
    if not user_id or not actor_id or str(user_id) == str(actor_id):
        return
    db_run(
        "INSERT INTO notifications (id, user_id, actor_id, type, post_id, message) VALUES (%s,%s,%s,%s,%s,%s)",
        (str(uuid.uuid4()), user_id, actor_id, ntype, post_id, message)
    )

def broadcast_new_post_notification(actor_id, post_id, snippet):
    """A new post notifies every OTHER user on the platform."""
    others = db_all("SELECT id FROM users WHERE id != %s", (actor_id,))
    for row in others:
        create_notification(row["id"], actor_id, "post", post_id, snippet)

def optional_uid_from_request():
    """Best-effort: return the user id from an Authorization header, or None."""
    auth  = request.headers.get("Authorization", "")
    token = auth[7:] if auth.startswith("Bearer ") else None
    user, _sid = authenticated_user(token)
    return str(user["id"]) if user else None

def post_with_author(post, viewer_id=None) -> dict:
    if not post: return {}
    post = dict(post)
    for k, v in post.items():
        if isinstance(v, datetime): post[k] = v.isoformat()
    a = user_payload(db_one("SELECT id,name,user_type,system_role,avatar_url FROM users WHERE id=%s",
                            (post.get("user_id"),)) or {})
    profile = a.get("profile") or {}
    post["author"] = {
        "id":        str(a.get("id","")),
        "name":      a.get("name","Unknown"),
        "user_type": a.get("user_type", "general_user"),
        "specialty": profile.get("specialty", ""),
        "avatar":    a.get("avatar_url",""),
        "verified":  a.get("verification_status") == "approved",
    }
    cc = db_one("SELECT COUNT(*) AS n FROM post_comments WHERE post_id=%s", (post["id"],))
    post["comments_count"] = cc["n"] if cc else 0
    post["shares"] = post.get("shares", 0) or 0
    if viewer_id:
        liked = db_one("SELECT id FROM post_likes WHERE post_id=%s AND user_id=%s", (post["id"], viewer_id))
        post["liked_by_me"] = bool(liked)
    else:
        post["liked_by_me"] = False
    return post

# ─── JWT ───────────────────────────────────────────────────────────────────────
def make_token(user_id: str, session_id: str) -> str:
    payload = {
        "sub": str(user_id),
        "sid": session_id,
        "type": "access",
        "exp": datetime.now(timezone.utc) + timedelta(days=TOKEN_EXPIRE_DAYS),
        "iat": datetime.now(timezone.utc),
    }
    return jwt.encode(payload, SECRET_KEY, algorithm="HS256")

def decode_token(token: str):
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
    except Exception:
        return None

def create_session(user_id, conn=None):
    session_id = str(uuid.uuid4())
    refresh_token = secrets.token_urlsafe(48)
    params = (
        session_id, str(user_id), request.headers.get("User-Agent", "")[:500],
        request.remote_addr or "", hashlib.sha256(refresh_token.encode()).hexdigest(),
    )
    query = "INSERT INTO user_sessions (id,user_id,device_info,ip_address,refresh_token) VALUES (%s,%s,%s,%s,%s)"
    db_exec(conn, query, params) if conn else db_run(query, params)
    return session_id, refresh_token

def authenticated_user(token):
    payload = decode_token(token) if token else None
    if not payload or payload.get("type") != "access" or not payload.get("sid"):
        return None, None
    session = db_one(
        "SELECT id,user_id FROM user_sessions WHERE id=%s AND user_id=%s AND is_revoked=0",
        (payload["sid"], payload.get("sub")),
    )
    if not session:
        return None, None
    user = db_one("SELECT * FROM users WHERE id=%s", (session["user_id"],))
    if not is_active_account(user):
        return None, None
    return user, session["id"]

def require_auth(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        auth  = request.headers.get("Authorization", "")
        token = auth[7:] if auth.startswith("Bearer ") else None
        if not token:
            return jsonify({"error": "Authentication required"}), 401
        user, session_id = authenticated_user(token)
        if not user:
            return jsonify({"error": "Invalid or expired token. Please log in again."}), 401
        request.current_user = user
        request.current_session_id = session_id
        return f(*args, **kwargs)
    return decorated


def require_admin(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        auth  = request.headers.get("Authorization", "")
        token = auth[7:] if auth.startswith("Bearer ") else None
        if not token:
            return jsonify({"error": "Authentication required"}), 401
        user, session_id = authenticated_user(token)
        if not user:
            return jsonify({"error": "Invalid or expired token"}), 401
        if user.get("system_role") not in {"admin", "finance_admin", "super_admin"}:
            return jsonify({"detail": "Admin access required"}), 403
        request.current_user = user
        request.current_session_id = session_id
        return f(*args, **kwargs)
    return decorated


def require_user_type(*account_types, require_approval=True):
    def decorator(f):
        @wraps(f)
        @require_auth
        def decorated(*args, **kwargs):
            decision = permission_decision(
                user_payload(request.current_user),
                account_types=account_types,
                require_professional_approval=require_approval,
            )
            if not decision.allowed:
                return jsonify({"detail": "This account cannot perform that action", "reason": decision.reason}), 403
            return f(*args, **kwargs)
        return decorated
    return decorator


# ─── EMAIL SENDING (via EmailJS REST API, called server-side) ─────────────────
def send_otp_email(to_email: str, to_name: str, otp_code: str) -> bool:
    """
    Sends the OTP using EmailJS's REST API from the backend (not the browser),
    so the OTP code never has to pass through the frontend.
    Requires an EmailJS template with variables: to_email, to_name, otp_code.
    """
    if not (EMAILJS_SERVICE_ID and EMAILJS_TEMPLATE_ID and EMAILJS_PUBLIC_KEY and EMAILJS_PRIVATE_KEY):
        print("⚠️ EmailJS is not configured — set EMAILJS_SERVICE_ID / EMAILJS_TEMPLATE_ID / "
              "EMAILJS_PUBLIC_KEY / EMAILJS_PRIVATE_KEY in your .env")
        return False

    payload = {
        "service_id":  EMAILJS_SERVICE_ID,
        "template_id": EMAILJS_TEMPLATE_ID,
        "user_id":     EMAILJS_PUBLIC_KEY,
        "accessToken": EMAILJS_PRIVATE_KEY,
        "template_params": {
            "to_email": to_email,
            "to_name":  to_name or "there",
            "otp_code": otp_code,
        },
    }
    try:
        res = requests.post(
            "https://api.emailjs.com/api/v1.0/email/send",
            json=payload,
            headers={"Content-Type": "application/json"},
            timeout=10,
        )
        if res.status_code == 200:
            return True
        print(f"⚠️ EmailJS send failed: {res.status_code} {res.text}")
        return False
    except Exception as e:
        print(f"⚠️ EmailJS request error: {e}")
        return False


def generate_otp_code() -> str:
    return str(random.randint(100000, 999999))


# ─── DB INIT ───────────────────────────────────────────────────────────────────
def init_db():
    if DATABASE_URL.startswith(("postgresql://", "postgres://")):
        db_one("SELECT 1")
    else:
        from database_schema import init_db as init_unified_db
        init_unified_db()

# ─── STARTUP ───────────────────────────────────────────────────────────────────
with app.app_context():
    try:
        init_db()
        print("[INFO] DB initialized on startup")
    except Exception as e:
        print(f"[INFO] DB init message: {e}")

# ─── SERVE UPLOADS ─────────────────────────────────────────────────────────────
@app.route("/uploads/<path:filename>")
def serve_upload(filename):
    return send_from_directory(UPLOAD_DIR, filename)

# ─── HEALTH CHECK ──────────────────────────────────────────────────────────────
@app.route("/")
@app.route("/api/health")
def health():
    try:
        db_one("SELECT 1")
        db_status = "connected ✅"
    except Exception as e:
        db_status = f"error: {e}"
    return jsonify({
        "status":    "ok",
        "database":  db_status,
        "message":   "Healthy Universe API 🏥",
        "version":   "2.1.0"
    })

# ══════════════════════════════════════════════════════════════════════════════
#  GENERIC IMAGE UPLOAD — used by "browse photo" fields (doctor avatar, job logo)
# ══════════════════════════════════════════════════════════════════════════════

@app.route("/api/upload/image", methods=["POST"])
@require_auth
def upload_generic_image():
    """Generic image upload used by any 'browse for a photo' field in the UI
    (doctor avatar, job/company logo, profile picture, etc). Returns a public URL."""
    file = request.files.get("file") or request.files.get("image")
    if not file or not file.filename:
        return jsonify({"detail": "No file provided"}), 400

    ct = file.content_type or ""
    if ct not in ALLOWED_IMAGES:
        return jsonify({"detail": "Only jpg/png/gif/webp images are allowed"}), 400

    file_bytes = file.read()
    if len(file_bytes) > MAX_FILE_BYTES:
        return jsonify({"detail": "File too large"}), 400

    ext   = os.path.splitext(file.filename)[1] or ".jpg"
    fname = str(uuid.uuid4()) + ext
    url   = upload_to_supabase(file_bytes, fname, ct)
    return jsonify({"url": url})


auth_dependencies = AuthDependencies(
    db_one=db_one,
    get_db=get_db,
    db_exec=db_exec,
    create_session=create_session,
    make_token=make_token,
    user_payload=user_payload,
    normalize_user_type=normalize_user_type,
    upload_verification_document=upload_to_supabase,
    allowed_user_types=USER_TYPES,
    allowed_docs=ALLOWED_DOCS,
    max_file_bytes=MAX_FILE_BYTES,
)
app.register_blueprint(create_auth_blueprint(auth_dependencies))

# ══════════════════════════════════════════════════════════════════════════════
#  AUTH ROUTES
# ══════════════════════════════════════════════════════════════════════════════


@app.route("/api/auth/me")
@require_auth
def get_me():
    return jsonify(user_payload(request.current_user))


@app.route("/api/auth/refresh", methods=["POST"])
def refresh_session():
    supplied = (request.get_json(force=True, silent=True) or {}).get("refresh_token") or ""
    token_hash = hashlib.sha256(supplied.encode()).hexdigest()
    session = db_one("SELECT * FROM user_sessions WHERE refresh_token=%s AND is_revoked=0", (token_hash,))
    if not session:
        return jsonify({"detail": "Invalid or revoked refresh token"}), 401
    user = db_one("SELECT * FROM users WHERE id=%s", (session["user_id"],))
    if not is_active_account(user):
        db_run("UPDATE user_sessions SET is_revoked=1 WHERE id=%s", (session["id"],))
        return jsonify({"detail": "This account is not active"}), 403
    new_refresh = secrets.token_urlsafe(48)
    db_run("UPDATE user_sessions SET refresh_token=%s WHERE id=%s",
           (hashlib.sha256(new_refresh.encode()).hexdigest(), session["id"]))
    return jsonify({"access_token": make_token(user["id"], session["id"]),
                    "refresh_token": new_refresh, "token_type": "bearer", "user": user_payload(user)})


@app.route("/api/auth/logout", methods=["POST"])
@require_auth
def logout():
    db_run("UPDATE user_sessions SET is_revoked=1 WHERE id=%s", (request.current_session_id,))
    return jsonify({"message": "Logged out"})


@app.route("/api/auth/logout-all", methods=["POST"])
@require_auth
def logout_all():
    db_run("UPDATE user_sessions SET is_revoked=1 WHERE user_id=%s", (str(request.current_user["id"]),))
    return jsonify({"message": "All sessions revoked"})


@app.route("/api/auth/update", methods=["PUT"])
@require_auth
def update_profile():
    data      = request.get_json(force=True) or {}
    uid       = str(request.current_user["id"])
    name      = (data.get("name") or "").strip()
    bio       =  data.get("bio")       or ""
    avatar_url = data.get("avatar_url") or request.current_user.get("avatar_url", "")

    if not name:
        return jsonify({"detail": "Name cannot be empty"}), 400

    db_run("UPDATE users SET name=%s,bio=%s,avatar_url=%s WHERE id=%s", (name, bio, avatar_url, uid))
    if normalize_user_type(request.current_user.get("user_type") or request.current_user.get("role")) == "doctor":
        db_run("UPDATE doctors SET name=%s,specialty=%s,hospital=%s,location=%s,bio=%s,updated_at=CURRENT_TIMESTAMP WHERE user_id=%s",
               (name, data.get("specialty") or "General Medicine", data.get("hospital") or "",
                data.get("location") or "", bio, uid))
    user = user_payload(db_one("SELECT * FROM users WHERE id=%s", (uid,)))
    return jsonify({"user": user, "message": "Profile updated successfully ✅"})


@app.route("/api/auth/change-password", methods=["PUT"])
@require_auth
def change_password():
    data         = request.get_json(force=True) or {}
    old_password =  data.get("old_password") or ""
    new_password =  data.get("new_password") or ""
    uid          =  str(request.current_user["id"])

    if not old_password or not new_password:
        return jsonify({"detail": "Both old and new passwords are required"}), 400
    if len(new_password) < 6:
        return jsonify({"detail": "New password must be at least 6 characters"}), 400

    user = db_one("SELECT password FROM users WHERE id=%s", (uid,))
    if not bcrypt.checkpw(old_password.encode(), user["password"].encode()):
        return jsonify({"detail": "Current password is incorrect"}), 401

    hashed = bcrypt.hashpw(new_password.encode(), bcrypt.gensalt()).decode()
    db_run("UPDATE users SET password=%s WHERE id=%s", (hashed, uid))
    db_run("UPDATE user_sessions SET is_revoked=1 WHERE user_id=%s", (uid,))
    return jsonify({"message": "Password changed; all sessions were revoked 🔐"})


# ══════════════════════════════════════════════════════════════════════════════
#  FORGOT PASSWORD — OTP via EmailJS (no login required)
# ══════════════════════════════════════════════════════════════════════════════

@app.route("/api/auth/forgot-password", methods=["POST"])
def forgot_password():
    """Step 1: user submits their email → we generate + email a 6-digit OTP."""
    data  = request.get_json(force=True) or {}
    email = (data.get("email") or "").strip().lower()

    if not email:
        return jsonify({"detail": "Email is required"}), 400

    user = db_one("SELECT id, name, email FROM users WHERE email=%s", (email,))
    generic_response = {"message": "If that email is registered, a verification code has been sent."}

    if not user:
        return jsonify(generic_response)

    db_run("UPDATE password_resets SET is_used=TRUE WHERE user_id=%s AND is_used=FALSE", (user["id"],))

    otp_code   = generate_otp_code()
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=OTP_EXPIRE_MINUTES)

    db_run(
        "INSERT INTO password_resets (id, user_id, otp_code, expires_at) VALUES (%s,%s,%s,%s)",
        (str(uuid.uuid4()), user["id"], otp_code, expires_at)
    )

    sent = send_otp_email(user["email"], user["name"], otp_code)
    if not sent:
        print(f"⚠️ Could not send OTP email to {user['email']}")

    return jsonify(generic_response)


@app.route("/api/auth/verify-otp", methods=["POST"])
def verify_otp():
    data     = request.get_json(force=True) or {}
    email    = (data.get("email") or "").strip().lower()
    otp_code = (data.get("otp") or "").strip()

    if not email or not otp_code:
        return jsonify({"detail": "Email and OTP are required"}), 400

    user = db_one("SELECT id FROM users WHERE email=%s", (email,))
    if not user:
        return jsonify({"detail": "Invalid or expired code"}), 400

    reset_row = db_one(
        """SELECT * FROM password_resets
           WHERE user_id=%s AND is_used=FALSE
           ORDER BY created_at DESC LIMIT 1""",
        (user["id"],)
    )
    if not reset_row:
        return jsonify({"detail": "No verification code found. Please request a new one."}), 400

    if reset_row["attempts"] >= MAX_OTP_ATTEMPTS:
        return jsonify({"detail": "Too many attempts. Please request a new code."}), 400

    expires_at = reset_row["expires_at"]
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    if datetime.now(timezone.utc) > expires_at:
        return jsonify({"detail": "This code has expired. Please request a new one."}), 400

    if reset_row["otp_code"] != otp_code:
        db_run("UPDATE password_resets SET attempts=attempts+1 WHERE id=%s", (reset_row["id"],))
        return jsonify({"detail": "Incorrect verification code"}), 400

    return jsonify({"message": "Code verified", "verified": True})


@app.route("/api/auth/reset-password", methods=["POST"])
def reset_password():
    data         = request.get_json(force=True) or {}
    email        = (data.get("email") or "").strip().lower()
    otp_code     = (data.get("otp") or "").strip()
    new_password =  data.get("new_password") or ""

    if not email or not otp_code:
        return jsonify({"detail": "Email and OTP are required"}), 400
    if len(new_password) < 6:
        return jsonify({"detail": "Password must be at least 6 characters"}), 400

    user = db_one("SELECT id FROM users WHERE email=%s", (email,))
    if not user:
        return jsonify({"detail": "Invalid or expired code"}), 400

    reset_row = db_one(
        """SELECT * FROM password_resets
           WHERE user_id=%s AND is_used=FALSE
           ORDER BY created_at DESC LIMIT 1""",
        (user["id"],)
    )
    if not reset_row:
        return jsonify({"detail": "No verification code found. Please request a new one."}), 400

    if reset_row["attempts"] >= MAX_OTP_ATTEMPTS:
        return jsonify({"detail": "Too many attempts. Please request a new code."}), 400

    expires_at = reset_row["expires_at"]
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    if datetime.now(timezone.utc) > expires_at:
        return jsonify({"detail": "This code has expired. Please request a new one."}), 400

    if reset_row["otp_code"] != otp_code:
        db_run("UPDATE password_resets SET attempts=attempts+1 WHERE id=%s", (reset_row["id"],))
        return jsonify({"detail": "Incorrect verification code"}), 400

    hashed = bcrypt.hashpw(new_password.encode(), bcrypt.gensalt()).decode()
    db_run("UPDATE users SET password=%s WHERE id=%s", (hashed, user["id"]))
    db_run("UPDATE password_resets SET is_used=TRUE WHERE id=%s", (reset_row["id"],))
    db_run("UPDATE user_sessions SET is_revoked=1 WHERE user_id=%s", (user["id"],))

    return jsonify({"message": "Password reset successfully. You can now log in. ✅"})


# ══════════════════════════════════════════════════════════════════════════════
#  POST ROUTES
# ══════════════════════════════════════════════════════════════════════════════

@app.route("/api/posts/create", methods=["POST"])
@require_auth
def create_post():
    content  = (request.form.get("content") or "").strip()
    category =  request.form.get("category") or "General Wellness"
    media    =  request.files.get("media")
    uid      =  str(request.current_user["id"])

    request_key = (request.headers.get("Idempotency-Key") or "").strip()[:128]
    post_id = str(uuid.uuid5(uuid.NAMESPACE_URL, f"jorniz:post:{uid}:{request_key}")) if request_key else str(uuid.uuid4())
    existing = db_one("SELECT * FROM posts WHERE id=%s", (post_id,)) if request_key else None
    if existing:
        result = post_with_author(existing, uid)
        result.update({"reward_earned": 0, "idempotent_replay": True})
        return jsonify(result), 200

    if not content and not media:
        return jsonify({"detail": "Please add text or media to your post"}), 400

    media_url = ""; media_type = ""; upload_warning = ""
    if media and media.filename:
        ct = media.content_type or ""
        if ct not in (ALLOWED_IMAGES | ALLOWED_VIDEOS):
            return jsonify({"detail": "Only images and videos are allowed"}), 400
        file_bytes = media.read()
        if len(file_bytes) > MAX_FILE_BYTES:
            return jsonify({"detail": "File too large (max 50MB)"}), 400
        ext   = os.path.splitext(media.filename)[1] or ".bin"
        fname = f"posts/uploaded/{uid}/{post_id}{ext}"
        try:
            media_url = upload_post_media_to_blob(file_bytes, fname, ct)
            if not media_url:
                raise RuntimeError("Upload returned no URL")
            media_type = "image" if ct in ALLOWED_IMAGES else "video"
        except Exception as exc:
            print(f"[WARN] Post media upload failed: {exc}")
            media_url = ""
            media_type = ""
            upload_warning = "Media upload failed. Your post was created without media."

    if not content and not media_url:
        return jsonify({"detail": "Please add text or successfully uploaded media to your post"}), 400

    conn = get_db()
    try:
        db_exec(conn, "INSERT INTO posts (id,user_id,content,media_url,media_type,category) VALUES (%s,%s,%s,%s,%s,%s)",
                (post_id, uid, content, media_url, media_type, category))
        lock = "SELECT hu_coins FROM users WHERE id=%s" + (" FOR UPDATE" if not isinstance(conn, sqlite3.Connection) else "")
        row = db_exec(conn, lock, (uid,)).fetchone()
        current_coins = (dict(row).get("hu_coins") if row else 0) or 0
        new_coins = current_coins + 10
        db_exec(conn, "UPDATE users SET hu_coins=%s,coins=%s WHERE id=%s", (new_coins, new_coins, uid))
        db_exec(conn, """INSERT INTO wallet_ledger
                  (id,user_id,credit_debit,value_type,amount,source_type,source_id,idempotency_key,balance_before,balance_after,status)
                  VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)""",
                (str(uuid.uuid4()), uid, "CREDIT", "HU Coins", 10, "SOCIAL_POST_REWARD", post_id,
                 f"post_rew_{post_id}", current_coins, new_coins, "Settled"))
        post = dict(db_exec(conn, "SELECT * FROM posts WHERE id=%s", (post_id,)).fetchone())
        conn.commit()
    except Exception:
        conn.rollback()
        if media_url:
            try:
                delete_post_media_blob(media_url)
            except Exception as cleanup_error:
                print(f"[WARN] Could not remove orphaned post media: {cleanup_error}")
        raise
    finally:
        conn.close()

    # Broadcast: everyone on the platform gets notified about a new post.
    actor_name = request.current_user.get("name", "Someone")
    snippet = (content[:80] + "…") if len(content) > 80 else content
    try:
        broadcast_new_post_notification(uid, post_id, f"{actor_name} shared a new post: \"{snippet}\"" if snippet else f"{actor_name} shared a new post")
    except Exception as exc:
        print(f"[WARN] Post notification failed: {exc}")

    ret_data = post_with_author(post, uid)
    ret_data["reward_earned"] = 10
    ret_data["new_hu_coins"] = new_coins
    if upload_warning:
        ret_data["warning"] = upload_warning
    return jsonify(ret_data), 201


@app.route("/api/posts")
def get_posts():
    try:
        limit = max(1, min(int(request.args.get("limit", 20)), 100))
        offset = max(0, int(request.args.get("offset", 0)))
    except ValueError:
        return jsonify({"detail": "limit and offset must be integers"}), 400
    viewer_id = optional_uid_from_request()
    posts  = db_all(
        "SELECT * FROM posts ORDER BY created_at DESC LIMIT %s OFFSET %s",
        (limit, offset)
    )
    return jsonify([post_with_author(p, viewer_id) for p in posts])


@app.route("/api/posts/mine")
@require_auth
def get_my_posts():
    uid   = str(request.current_user["id"])
    posts = db_all(
        "SELECT * FROM posts WHERE user_id=%s ORDER BY created_at DESC", (uid,)
    )
    return jsonify([post_with_author(p, uid) for p in posts])


@app.route("/api/posts/<post_id>/like", methods=["POST"])
@require_auth
def like_post(post_id):
    """Toggle like on/off for the current user (real per-user like state,
    not just a counter)."""
    uid = str(request.current_user["id"])
    if not db_one("SELECT id FROM posts WHERE id=%s", (post_id,)):
        return jsonify({"detail": "Post not found"}), 404

    existing = db_one("SELECT id FROM post_likes WHERE post_id=%s AND user_id=%s", (post_id, uid))
    if existing:
        db_run("DELETE FROM post_likes WHERE id=%s", (existing["id"],))
        db_run("UPDATE posts SET likes=GREATEST(likes-1,0) WHERE id=%s", (post_id,))
        liked = False
    else:
        db_run("INSERT INTO post_likes (id, post_id, user_id) VALUES (%s,%s,%s)",
               (str(uuid.uuid4()), post_id, uid))
        db_run("UPDATE posts SET likes=likes+1 WHERE id=%s", (post_id,))
        liked = True
        # Notify ONLY the post's owner (not on unlike, and never notify yourself).
        post_row = db_one("SELECT user_id FROM posts WHERE id=%s", (post_id,))
        actor_name = request.current_user.get("name", "Someone")
        if post_row:
            create_notification(post_row["user_id"], uid, "like", post_id, f"{actor_name} liked your post")

    updated = db_one("SELECT likes FROM posts WHERE id=%s", (post_id,))
    return jsonify({"likes": updated["likes"], "liked": liked})


@app.route("/api/posts/<post_id>/share", methods=["POST"])
def share_post(post_id):
    """Log a share/reshare. Works for logged-out viewers too (just bumps the count)."""
    if not db_one("SELECT id FROM posts WHERE id=%s", (post_id,)):
        return jsonify({"detail": "Post not found"}), 404
    db_run("UPDATE posts SET shares=COALESCE(shares,0)+1 WHERE id=%s", (post_id,))
    updated = db_one("SELECT shares FROM posts WHERE id=%s", (post_id,))
    return jsonify({"shares": updated["shares"]})


@app.route("/api/posts/<post_id>/comments", methods=["GET"])
def get_comments(post_id):
    if not db_one("SELECT id FROM posts WHERE id=%s", (post_id,)):
        return jsonify({"detail": "Post not found"}), 404
    rows = db_all(
        "SELECT * FROM post_comments WHERE post_id=%s ORDER BY created_at ASC", (post_id,)
    )
    out = []
    for c in rows:
        c = dict(c)
        for k, v in c.items():
            if isinstance(v, datetime): c[k] = v.isoformat()
        a = db_one("SELECT name, avatar_url, is_verified FROM users WHERE id=%s", (c["user_id"],)) or {}
        c["author"] = {
            "name": a.get("name", "Unknown"),
            "avatar": a.get("avatar_url", ""),
            "verified": bool(a.get("is_verified", False)),
        }
        out.append(c)
    return jsonify(out)


@app.route("/api/posts/<post_id>/comments", methods=["POST"])
@require_auth
def add_comment(post_id):
    uid = str(request.current_user["id"])
    data = request.get_json(force=True) or {}
    content = (data.get("content") or "").strip()
    if not content:
        return jsonify({"detail": "Comment cannot be empty"}), 400
    if not db_one("SELECT id FROM posts WHERE id=%s", (post_id,)):
        return jsonify({"detail": "Post not found"}), 404

    cid = str(uuid.uuid4())
    db_run(
        "INSERT INTO post_comments (id, post_id, user_id, content) VALUES (%s,%s,%s,%s)",
        (cid, post_id, uid, content)
    )

    # Notify ONLY the post's owner (not everyone) — never notify yourself.
    post_row = db_one("SELECT user_id FROM posts WHERE id=%s", (post_id,))
    actor_name = request.current_user.get("name", "Someone")
    if post_row:
        snippet = (content[:60] + "…") if len(content) > 60 else content
        create_notification(post_row["user_id"], uid, "comment", post_id, f'{actor_name} commented: "{snippet}"')

    comment = dict(db_one("SELECT * FROM post_comments WHERE id=%s", (cid,)))
    for k, v in comment.items():
        if isinstance(v, datetime): comment[k] = v.isoformat()
    comment["author"] = {
        "name": request.current_user.get("name", "Unknown"),
        "avatar": request.current_user.get("avatar_url", ""),
        "verified": bool(request.current_user.get("is_verified", False)),
    }
    return jsonify(comment), 201


@app.route("/api/posts/<post_id>", methods=["PUT"])
@require_auth
def update_post(post_id):
    uid = str(request.current_user["id"])
    post = db_one("SELECT * FROM posts WHERE id=%s", (post_id,))
    if not post:
        return jsonify({"detail": "Post not found"}), 404
    if str(post["user_id"]) != uid:
        return jsonify({"detail": "You can only edit your own posts"}), 403

    content = (request.form.get("content", post.get("content") or "") or "").strip()
    category = request.form.get("category", post.get("category") or "General Wellness")
    media = request.files.get("media")
    remove_media = (request.form.get("remove_media") or "").lower() in {"1", "true", "yes"}
    old_media_url = post.get("media_url") or ""
    media_url = old_media_url
    media_type = post.get("media_type") or ""
    uploaded_url = ""

    if media and media.filename:
        content_type = media.content_type or ""
        if content_type not in (ALLOWED_IMAGES | ALLOWED_VIDEOS):
            return jsonify({"detail": "Only images and videos are allowed"}), 400
        file_bytes = media.read()
        if len(file_bytes) > MAX_FILE_BYTES:
            return jsonify({"detail": "File too large (max 50MB)"}), 400
        extension = os.path.splitext(media.filename)[1] or ".bin"
        pathname = f"posts/uploaded/{uid}/{post_id}/{uuid.uuid4()}{extension}"
        try:
            uploaded_url = upload_post_media_to_blob(file_bytes, pathname, content_type)
        except Exception as exc:
            return jsonify({"detail": f"Could not upload replacement media: {exc}"}), 502
        media_url = uploaded_url
        media_type = "image" if content_type in ALLOWED_IMAGES else "video"
    elif remove_media:
        media_url = ""
        media_type = ""

    if not content and not media_url:
        if uploaded_url:
            try:
                delete_post_media_blob(uploaded_url)
            except Exception as cleanup_error:
                print(f"[WARN] Could not remove rejected post media: {cleanup_error}")
        return jsonify({"detail": "A post must contain text or media"}), 400

    try:
        db_run(
            "UPDATE posts SET content=%s,category=%s,media_url=%s,media_type=%s WHERE id=%s",
            (content, category, media_url, media_type, post_id),
        )
    except Exception:
        if uploaded_url:
            try:
                delete_post_media_blob(uploaded_url)
            except Exception as cleanup_error:
                print(f"[WARN] Could not remove uncommitted post media: {cleanup_error}")
        raise

    warning = ""
    if old_media_url and old_media_url != media_url:
        try:
            delete_post_media_blob(old_media_url)
        except Exception as cleanup_error:
            print(f"[WARN] Could not remove replaced post media: {cleanup_error}")
            warning = "Post updated, but the previous media could not be removed."

    result = post_with_author(db_one("SELECT * FROM posts WHERE id=%s", (post_id,)), uid)
    if warning:
        result["warning"] = warning
    return jsonify(result)


@app.route("/api/posts/<post_id>", methods=["DELETE"])
@require_auth
def delete_post(post_id):
    uid  = str(request.current_user["id"])
    post = db_one("SELECT id,user_id,media_url FROM posts WHERE id=%s", (post_id,))
    if not post:
        return jsonify({"detail": "Post not found"}), 404
    if str(post["user_id"]) != uid:
        return jsonify({"detail": "You can only delete your own posts"}), 403
    db_run("DELETE FROM posts WHERE id=%s", (post_id,))
    response = {"message": "Post deleted", "media_deleted": False}
    if post.get("media_url"):
        try:
            response["media_deleted"] = delete_post_media_blob(post["media_url"])
        except Exception as cleanup_error:
            print(f"[WARN] Could not remove deleted post media: {cleanup_error}")
            response["warning"] = "Post deleted, but its media could not be removed."
    return jsonify(response)


# ══════════════════════════════════════════════════════════════════════════════
#  NOTIFICATIONS
#  - like / comment  → only ever sent to the post owner
#  - post            → broadcast to every other user (see broadcast_new_post_notification)
# ══════════════════════════════════════════════════════════════════════════════

def notification_to_frontend_shape(n) -> dict:
    n = dict(n)
    for k, v in n.items():
        if isinstance(v, datetime): n[k] = v.isoformat()
    actor = db_one("SELECT name, avatar_url FROM users WHERE id=%s", (n["actor_id"],)) or {}
    icon_map = {"like": "heart", "comment": "comment", "post": "post"}
    return {
        "id": n["id"],
        "name": actor.get("name", "Someone"),
        "avatar": actor.get("avatar_url", ""),
        "action": n.get("message", ""),
        "quote": None,
        "time": timeago_label(n["created_at"]),
        "iconType": icon_map.get(n["type"], "post"),
        "unread": not n.get("is_read", False),
        "post_id": n.get("post_id"),
    }

def timeago_label(iso_str):
    try:
        dt = datetime.fromisoformat(iso_str) if isinstance(iso_str, str) else iso_str
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=timezone.utc)
        diff = datetime.now(timezone.utc) - dt
        mins = int(diff.total_seconds() // 60)
        if mins < 1: return "Just now"
        if mins < 60: return f"{mins}m ago"
        hrs = mins // 60
        if hrs < 24: return f"{hrs}h ago"
        return f"{hrs // 24}d ago"
    except Exception:
        return ""


@app.route("/api/notifications")
@require_auth
def get_notifications():
    uid = str(request.current_user["id"])
    limit = min(int(request.args.get("limit", 50)), 100)
    rows = db_all(
        "SELECT * FROM notifications WHERE user_id=%s ORDER BY created_at DESC LIMIT %s",
        (uid, limit)
    )
    return jsonify([notification_to_frontend_shape(r) for r in rows])


@app.route("/api/notifications/unread-count")
@require_auth
def get_unread_notification_count():
    uid = str(request.current_user["id"])
    row = db_one("SELECT COUNT(*) AS n FROM notifications WHERE user_id=%s AND is_read=FALSE", (uid,))
    return jsonify({"unread": row["n"] if row else 0})


@app.route("/api/notifications/<notif_id>/read", methods=["POST"])
@require_auth
def mark_notification_read(notif_id):
    uid = str(request.current_user["id"])
    n = db_one("SELECT id FROM notifications WHERE id=%s AND user_id=%s", (notif_id, uid))
    if not n:
        return jsonify({"detail": "Notification not found"}), 404
    db_run("UPDATE notifications SET is_read=TRUE WHERE id=%s", (notif_id,))
    return jsonify({"message": "marked read"})


@app.route("/api/notifications/read-all", methods=["POST"])
@require_auth
def mark_all_notifications_read():
    uid = str(request.current_user["id"])
    db_run("UPDATE notifications SET is_read=TRUE WHERE user_id=%s AND is_read=FALSE", (uid,))
    return jsonify({"message": "all marked read"})


# ══════════════════════════════════════════════════════════════════════════════
#  ADS ENGINE — campaigns, creatives, serving, tracking, HU Coin rewards
# ══════════════════════════════════════════════════════════════════════════════

def campaign_with_stats(c) -> dict:
    if not c: return {}
    c = dict(c)
    for k, v in c.items():
        if isinstance(v, datetime): c[k] = v.isoformat()
    imp = db_one("SELECT COUNT(*) AS n FROM ad_impressions WHERE campaign_id=%s", (c["id"],))
    clk = db_one("SELECT COUNT(*) AS n FROM ad_clicks WHERE campaign_id=%s", (c["id"],))
    impressions = imp["n"] if imp else 0
    clicks      = clk["n"] if clk else 0
    ctr = round((clicks / impressions) * 100, 2) if impressions else 0.0
    creative = db_one("SELECT * FROM ad_creatives WHERE campaign_id=%s ORDER BY created_at DESC LIMIT 1", (c["id"],))
    if creative:
        creative = dict(creative)
        for k, v in creative.items():
            if isinstance(v, datetime): creative[k] = v.isoformat()
    c["impressions"] = impressions
    c["clicks"]      = clicks
    c["ctr"]         = ctr
    c["remaining"]   = round(float(c["budget"]) - float(c["spent"]), 2)
    c["creative"]    = creative or {}
    return c


@app.route("/api/ads/campaigns", methods=["POST"])
@require_auth
def create_campaign():
    uid = str(request.current_user["id"])

    name       = (request.form.get("name") or "").strip()
    objective  = request.form.get("objective") or "awareness"
    budget     = request.form.get("budget")
    bid_amount = request.form.get("bid_amount") or "2.00"
    specialty  = request.form.get("target_specialty") or "All"
    location   = request.form.get("target_location") or "All"
    end_date   = request.form.get("end_date") or None

    headline  = (request.form.get("headline") or "").strip()
    body_text = request.form.get("body_text") or ""
    cta_text  = request.form.get("cta_text") or "Learn More"
    cta_link  = request.form.get("cta_link") or ""
    image     = request.files.get("image")

    if not name:
        return jsonify({"detail": "Campaign name is required"}), 400
    if not headline:
        return jsonify({"detail": "Ad headline is required"}), 400
    try:
        budget = float(budget)
        bid_amount = float(bid_amount)
    except (TypeError, ValueError):
        return jsonify({"detail": "Budget and bid amount must be numbers"}), 400
    if budget <= 0:
        return jsonify({"detail": "Budget must be greater than 0"}), 400

    image_url = ""
    if image and image.filename:
        ct = image.content_type or ""
        if ct not in (ALLOWED_IMAGES | ALLOWED_VIDEOS):
            return jsonify({"detail": "Ad creative must be an image or video (jpg/png/gif/webp/mp4/webm)"}), 400
        file_bytes = image.read()
        if len(file_bytes) > MAX_FILE_BYTES:
            return jsonify({"detail": "File too large (max 500MB)"}), 400
        ext   = os.path.splitext(image.filename)[1] or ".jpg"
        fname = str(uuid.uuid4()) + ext
        image_url = upload_to_supabase(file_bytes, fname, ct)

    cid = str(uuid.uuid4())
    db_run(
        """INSERT INTO ad_campaigns
           (id, user_id, name, objective, status, budget, bid_amount, target_specialty, target_location, end_date)
           VALUES (%s,%s,%s,%s,'pending',%s,%s,%s,%s,%s)""",
        (cid, uid, name, objective, budget, bid_amount, specialty, location, end_date)
    )
    crid = str(uuid.uuid4())
    db_run(
        """INSERT INTO ad_creatives (id, campaign_id, headline, body_text, image_url, cta_text, cta_link)
           VALUES (%s,%s,%s,%s,%s,%s,%s)""",
        (crid, cid, headline, body_text, image_url, cta_text, cta_link)
    )

    campaign = db_one("SELECT * FROM ad_campaigns WHERE id=%s", (cid,))
    return jsonify(campaign_with_stats(campaign)), 201


@app.route("/api/ads/campaigns/mine")
@require_auth
def my_campaigns():
    uid = str(request.current_user["id"])
    rows = db_all("SELECT * FROM ad_campaigns WHERE user_id=%s ORDER BY created_at DESC", (uid,))
    return jsonify([campaign_with_stats(r) for r in rows])


@app.route("/api/ads/campaigns/<campaign_id>/status", methods=["PUT"])
@require_auth
def update_campaign_status(campaign_id):
    uid  = str(request.current_user["id"])
    data = request.get_json(force=True) or {}
    status = data.get("status")
    if status not in ("active", "paused"):
        return jsonify({"detail": "Status must be 'active' or 'paused'"}), 400

    c = db_one("SELECT id, user_id FROM ad_campaigns WHERE id=%s", (campaign_id,))
    if not c:
        return jsonify({"detail": "Campaign not found"}), 404
    if str(c["user_id"]) != uid:
        return jsonify({"detail": "Not your campaign"}), 403

    db_run("UPDATE ad_campaigns SET status=%s WHERE id=%s", (status, campaign_id))
    return jsonify({"message": "Campaign " + status})


@app.route("/api/ads/campaigns/<campaign_id>", methods=["DELETE"])
@require_auth
def delete_campaign(campaign_id):
    uid = str(request.current_user["id"])
    c = db_one("SELECT id, user_id FROM ad_campaigns WHERE id=%s", (campaign_id,))
    if not c:
        return jsonify({"detail": "Campaign not found"}), 404
    if str(c["user_id"]) != uid:
        return jsonify({"detail": "Not your campaign"}), 403
    db_run("DELETE FROM ad_campaigns WHERE id=%s", (campaign_id,))
    return jsonify({"message": "Campaign deleted"})


@app.route("/api/ads/serve")
def serve_ad():
    row = db_one(
        """SELECT c.*, cr.id AS creative_id, cr.headline, cr.body_text,
                  cr.image_url, cr.cta_text, cr.cta_link
           FROM ad_campaigns c
           JOIN ad_creatives cr ON cr.campaign_id = c.id
           WHERE LOWER(c.status) = 'active'
             AND (c.spent_amount IS NULL OR c.spent_amount < c.total_budget)
           ORDER BY RANDOM()
           LIMIT 1"""
    )
    if not row:
        return jsonify(None)
    row = dict(row)
    for k, v in row.items():
        if isinstance(v, datetime): row[k] = v.isoformat()
    advertiser = db_one("SELECT name, avatar_url FROM users WHERE id=%s", (row["user_id"],)) or {}
    row["advertiser_name"] = advertiser.get("name", "Sponsored")
    row["impression_reward"] = COIN_REWARD_PER_IMPRESSION
    row["click_reward"]      = COIN_REWARD_PER_CLICK
    return jsonify(row)


@app.route("/api/ads/impression", methods=["POST"])
def log_impression():
    data = request.get_json(force=True) or {}
    campaign_id = data.get("campaign_id")
    creative_id = data.get("creative_id")
    if not campaign_id or not creative_id:
        return jsonify({"detail": "campaign_id and creative_id required"}), 400

    auth  = request.headers.get("Authorization", "")
    token = auth[7:] if auth.startswith("Bearer ") else None
    uid   = decode_token(token) if token else None

    campaign = db_one("SELECT * FROM ad_campaigns WHERE id=%s", (campaign_id,))
    if not campaign:
        return jsonify({"detail": "Campaign not found"}), 404

    coins_earned = 0
    new_balance  = None

    if uid and campaign["status"] == "active":
        already_seen = db_one(
            "SELECT id FROM ad_impressions WHERE campaign_id=%s AND user_id=%s LIMIT 1",
            (campaign_id, uid)
        )
        if not already_seen:
            remaining = float(campaign["budget"]) - float(campaign["spent"])
            if remaining > 0:
                cost = min(COST_PER_IMPRESSION, remaining)
                new_spent = float(campaign["spent"]) + cost
                db_run("UPDATE ad_campaigns SET spent=%s WHERE id=%s", (new_spent, campaign_id))
                if new_spent >= float(campaign["budget"]):
                    db_run("UPDATE ad_campaigns SET status='paused' WHERE id=%s", (campaign_id,))

                db_run("UPDATE users SET hu_coins = hu_coins + %s WHERE id=%s",
                       (COIN_REWARD_PER_IMPRESSION, uid))
                coins_earned = COIN_REWARD_PER_IMPRESSION
                bal = db_one("SELECT hu_coins FROM users WHERE id=%s", (uid,))
                new_balance = bal["hu_coins"] if bal else None

    db_run(
        "INSERT INTO ad_impressions (id, campaign_id, creative_id, user_id) VALUES (%s,%s,%s,%s)",
        (str(uuid.uuid4()), campaign_id, creative_id, uid)
    )
    return jsonify({"message": "logged", "coins_earned": coins_earned, "hu_coins": new_balance})


@app.route("/api/ads/click", methods=["POST"])
def log_click():
    data = request.get_json(force=True) or {}
    campaign_id = data.get("campaign_id")
    creative_id = data.get("creative_id")
    if not campaign_id or not creative_id:
        return jsonify({"detail": "campaign_id and creative_id required"}), 400

    auth  = request.headers.get("Authorization", "")
    token = auth[7:] if auth.startswith("Bearer ") else None
    uid   = decode_token(token) if token else None

    campaign = db_one("SELECT * FROM ad_campaigns WHERE id=%s", (campaign_id,))
    if not campaign:
        return jsonify({"detail": "Campaign not found"}), 404

    db_run(
        "INSERT INTO ad_clicks (id, campaign_id, creative_id, user_id) VALUES (%s,%s,%s,%s)",
        (str(uuid.uuid4()), campaign_id, creative_id, uid)
    )

    new_spent = float(campaign["spent"]) + float(campaign["bid_amount"])
    db_run("UPDATE ad_campaigns SET spent=%s WHERE id=%s", (new_spent, campaign_id))

    if new_spent >= float(campaign["budget"]):
        db_run("UPDATE ad_campaigns SET status='paused' WHERE id=%s", (campaign_id,))

    coins_earned = 0
    new_balance  = None
    if uid:
        prior_clicks = db_one(
            "SELECT COUNT(*) AS n FROM ad_clicks WHERE campaign_id=%s AND user_id=%s",
            (campaign_id, uid)
        )
        if prior_clicks and prior_clicks["n"] <= 1:
            db_run("UPDATE users SET hu_coins = hu_coins + %s WHERE id=%s",
                   (COIN_REWARD_PER_CLICK, uid))
            coins_earned = COIN_REWARD_PER_CLICK
            bal = db_one("SELECT hu_coins FROM users WHERE id=%s", (uid,))
            new_balance = bal["hu_coins"] if bal else None

    return jsonify({
        "message": "logged",
        "spent": new_spent,
        "coins_earned": coins_earned,
        "hu_coins": new_balance,
    })


# ══════════════════════════════════════════════════════════════════════════════
#  MESSAGING ENGINE — REST routes
# ══════════════════════════════════════════════════════════════════════════════

def get_or_create_conversation(uid_a, uid_b):
    a, b = sorted([str(uid_a), str(uid_b)])
    conv = db_one("SELECT * FROM conversations WHERE user_a_id=%s AND user_b_id=%s", (a, b))
    if conv:
        return conv
    cid = str(uuid.uuid4())
    db_run("INSERT INTO conversations (id, user_a_id, user_b_id) VALUES (%s,%s,%s)", (cid, a, b))
    return db_one("SELECT * FROM conversations WHERE id=%s", (cid,))


@app.route("/api/users")
@require_auth
def search_users():
    q = (request.args.get("q") or "").strip()
    uid = str(request.current_user["id"])
    if q:
        rows = db_all(
            """SELECT id, name, specialty, avatar_url FROM users
               WHERE id != %s AND name ILIKE %s LIMIT 20""",
            (uid, f"%{q}%")
        )
    else:
        rows = db_all(
            "SELECT id, name, specialty, avatar_url FROM users WHERE id != %s LIMIT 20",
            (uid,)
        )
    return jsonify([dict(r) for r in rows])


@app.route("/api/messages/conversations")
@require_auth
def list_conversations():
    uid = str(request.current_user["id"])
    rows = db_all(
        "SELECT * FROM conversations WHERE user_a_id=%s OR user_b_id=%s ORDER BY created_at DESC",
        (uid, uid)
    )
    pinned_rows = db_all("SELECT conversation_id FROM pinned_conversations WHERE user_id=%s", (uid,))
    pinned_ids = set(str(p["conversation_id"]) for p in pinned_rows)

    blocked_rows = db_all("SELECT blocked_id FROM blocked_users WHERE blocker_id=%s", (uid,))
    blocked_by_me = set(str(b["blocked_id"]) for b in blocked_rows)

    result = []
    for c in rows:
        c = dict(c)
        other_id = c["user_b_id"] if str(c["user_a_id"]) == uid else c["user_a_id"]
        other = db_one("SELECT id, name, specialty, avatar_url FROM users WHERE id=%s", (other_id,)) or {}
        last_msg = db_one(
            "SELECT * FROM messages WHERE conversation_id=%s AND is_deleted=FALSE ORDER BY created_at DESC LIMIT 1",
            (c["id"],)
        )
        unread = db_one(
            "SELECT COUNT(*) AS n FROM messages WHERE conversation_id=%s AND sender_id!=%s AND read_at IS NULL AND is_deleted=FALSE",
            (c["id"], uid)
        )
        result.append({
            "id": c["id"],
            "is_pinned": str(c["id"]) in pinned_ids,
            "other_user": {
                "id": str(other.get("id","")),
                "name": other.get("name","Unknown"),
                "specialty": other.get("specialty",""),
                "avatar": other.get("avatar_url",""),
                "online": online_users.get(str(other.get("id","")), False),
                "blocked_by_me": str(other.get("id","")) in blocked_by_me,
            },
            "last_message": (dict(last_msg)["content"] if last_msg else ""),
            "last_media_type": (dict(last_msg).get("media_type","") if last_msg else ""),
            "last_time": (dict(last_msg)["created_at"].isoformat() if last_msg else ""),
            "unread_count": unread["n"] if unread else 0,
        })

    result.sort(key=lambda r: (not r["is_pinned"], r["last_time"] or ""), reverse=False)
    result.sort(key=lambda r: r["is_pinned"], reverse=True)
    return jsonify(result)


@app.route("/api/messages/conversations/start", methods=["POST"])
@require_auth
def start_conversation():
    data = request.get_json(force=True) or {}
    other_id = data.get("other_user_id")
    uid = str(request.current_user["id"])
    if not other_id or other_id == uid:
        return jsonify({"detail": "Invalid user"}), 400
    if not db_one("SELECT id FROM users WHERE id=%s", (other_id,)):
        return jsonify({"detail": "User not found"}), 404
    conv = get_or_create_conversation(uid, other_id)
    return jsonify({"conversation_id": conv["id"]})


@app.route("/api/messages/upload-media", methods=["POST"])
@require_auth
def upload_message_media():
    media = request.files.get("media")
    if not media or not media.filename:
        return jsonify({"detail": "No file provided"}), 400

    ct = media.content_type or ""
    if ct not in (ALLOWED_IMAGES | ALLOWED_VIDEOS | ALLOWED_AUDIO):
        return jsonify({"detail": "Only images, videos, and audio are allowed"}), 400

    file_bytes = media.read()
    if len(file_bytes) > MAX_FILE_BYTES:
        return jsonify({"detail": "File too large (max 50MB)"}), 400

    ext = os.path.splitext(media.filename)[1] or ".bin"
    fname = str(uuid.uuid4()) + ext
    media_url = upload_to_supabase(file_bytes, fname, ct)

    media_type = "image" if ct in ALLOWED_IMAGES else ("video" if ct in ALLOWED_VIDEOS else "audio")
    return jsonify({"media_url": media_url, "media_type": media_type})


@app.route("/api/messages/<message_id>", methods=["DELETE"])
@require_auth
def delete_message(message_id):
    uid = str(request.current_user["id"])
    msg = db_one("SELECT * FROM messages WHERE id=%s", (message_id,))
    if not msg:
        return jsonify({"detail": "Message not found"}), 404
    if str(msg["sender_id"]) != uid:
        return jsonify({"detail": "You can only delete your own messages"}), 403
    db_run("UPDATE messages SET is_deleted=TRUE, content='', media_url='', media_type='' WHERE id=%s", (message_id,))
    socketio.emit("message_deleted", {"message_id": message_id}, room="conv_" + str(msg["conversation_id"]))
    return jsonify({"message": "Message deleted"})


@app.route("/api/messages/<message_id>", methods=["PUT"])
@require_auth
def edit_message(message_id):
    uid = str(request.current_user["id"])
    data = request.get_json(force=True) or {}
    new_content = (data.get("content") or "").strip()
    if not new_content:
        return jsonify({"detail": "Message content cannot be empty"}), 400

    msg = db_one("SELECT * FROM messages WHERE id=%s", (message_id,))
    if not msg:
        return jsonify({"detail": "Message not found"}), 404
    if str(msg["sender_id"]) != uid:
        return jsonify({"detail": "You can only edit your own messages"}), 403
    if msg["is_deleted"]:
        return jsonify({"detail": "Cannot edit a deleted message"}), 400

    db_run("UPDATE messages SET content=%s, edited_at=CURRENT_TIMESTAMP WHERE id=%s", (new_content, message_id))
    socketio.emit("message_edited", {
        "message_id": message_id, "content": new_content
    }, room="conv_" + str(msg["conversation_id"]))
    return jsonify({"message": "Message updated"})


@app.route("/api/messages/conversations/<conv_id>/pin", methods=["POST"])
@require_auth
def toggle_pin_conversation(conv_id):
    uid = str(request.current_user["id"])
    conv = db_one("SELECT * FROM conversations WHERE id=%s", (conv_id,))
    if not conv or uid not in (str(conv["user_a_id"]), str(conv["user_b_id"])):
        return jsonify({"detail": "Conversation not found"}), 404

    existing = db_one("SELECT id FROM pinned_conversations WHERE user_id=%s AND conversation_id=%s", (uid, conv_id))
    if existing:
        db_run("DELETE FROM pinned_conversations WHERE id=%s", (existing["id"],))
        return jsonify({"pinned": False})
    else:
        db_run("INSERT INTO pinned_conversations (id, user_id, conversation_id) VALUES (%s,%s,%s)",
               (str(uuid.uuid4()), uid, conv_id))
        return jsonify({"pinned": True})


@app.route("/api/users/<other_user_id>/block", methods=["POST"])
@require_auth
def toggle_block_user(other_user_id):
    uid = str(request.current_user["id"])
    if uid == other_user_id:
        return jsonify({"detail": "Cannot block yourself"}), 400

    existing = db_one("SELECT id FROM blocked_users WHERE blocker_id=%s AND blocked_id=%s", (uid, other_user_id))
    if existing:
        db_run("DELETE FROM blocked_users WHERE id=%s", (existing["id"],))
        return jsonify({"blocked": False})
    else:
        db_run("INSERT INTO blocked_users (id, blocker_id, blocked_id) VALUES (%s,%s,%s)",
               (str(uuid.uuid4()), uid, other_user_id))
        return jsonify({"blocked": True})


@app.route("/api/messages/conversations/<conv_id>/search")
@require_auth
def search_conversation_messages(conv_id):
    uid = str(request.current_user["id"])
    q = (request.args.get("q") or "").strip()
    conv = db_one("SELECT * FROM conversations WHERE id=%s", (conv_id,))
    if not conv or uid not in (str(conv["user_a_id"]), str(conv["user_b_id"])):
        return jsonify({"detail": "Conversation not found"}), 404
    if not q:
        return jsonify([])

    rows = db_all(
        """SELECT * FROM messages WHERE conversation_id=%s AND is_deleted=FALSE
           AND content ILIKE %s ORDER BY created_at ASC""",
        (conv_id, f"%{q}%")
    )
    out = []
    for m in rows:
        m = dict(m)
        for k, v in m.items():
            if isinstance(v, datetime): m[k] = v.isoformat()
        out.append(m)
    return jsonify(out)


@app.route("/api/messages/conversations/<conv_id>/messages")
@require_auth
def get_messages(conv_id):
    uid = str(request.current_user["id"])
    conv = db_one("SELECT * FROM conversations WHERE id=%s", (conv_id,))
    if not conv or uid not in (str(conv["user_a_id"]), str(conv["user_b_id"])):
        return jsonify({"detail": "Conversation not found"}), 404

    limit = min(int(request.args.get("limit", 50)), 200)
    before = request.args.get("before")

    if before:
        rows = db_all(
            "SELECT * FROM messages WHERE conversation_id=%s AND created_at < %s ORDER BY created_at DESC LIMIT %s",
            (conv_id, before, limit)
        )
        rows = list(reversed(rows))
    else:
        rows = db_all(
            "SELECT * FROM messages WHERE conversation_id=%s ORDER BY created_at DESC LIMIT %s",
            (conv_id, limit)
        )
        rows = list(reversed(rows))
        db_run(
            "UPDATE messages SET read_at=CURRENT_TIMESTAMP WHERE conversation_id=%s AND sender_id!=%s AND read_at IS NULL",
            (conv_id, uid)
        )

    out = []
    for m in rows:
        m = dict(m)
        for k, v in m.items():
            if isinstance(v, datetime): m[k] = v.isoformat()
        if m.get("reply_to_id"):
            reply_msg = db_one("SELECT id, content, sender_id, is_deleted FROM messages WHERE id=%s", (m["reply_to_id"],))
            if reply_msg:
                m["reply_to"] = {
                    "id": str(reply_msg["id"]),
                    "content": "Message deleted" if reply_msg["is_deleted"] else reply_msg["content"],
                    "sender_id": str(reply_msg["sender_id"]),
                }
        out.append(m)
    return jsonify(out)


# ══════════════════════════════════════════════════════════════════════════════
#  MESSAGING ENGINE — Socket.IO events
# ══════════════════════════════════════════════════════════════════════════════

@socketio.on("connect")
def ws_connect():
    token = request.args.get("token")
    uid = decode_token(token) if token else None
    if not uid:
        return False
    uid = str(uid)
    join_room(uid)
    online_users[uid] = True
    sid_to_user[request.sid] = uid
    emit("presence", {"user_id": uid, "online": True}, broadcast=True)


@socketio.on("disconnect")
def ws_disconnect():
    uid = sid_to_user.pop(request.sid, None)
    if uid:
        online_users.pop(uid, None)
        emit("presence", {"user_id": uid, "online": False}, broadcast=True)


@socketio.on("join_conversation")
def ws_join_conversation(data):
    conv_id = data.get("conversation_id")
    if conv_id:
        join_room("conv_" + conv_id)


@socketio.on("send_message")
def ws_send_message(data):
    conv_id = data.get("conversation_id")
    content = (data.get("content") or "").strip()
    media_url = data.get("media_url") or ""
    media_type = data.get("media_type") or ""
    reply_to_id = data.get("reply_to_id") or None
    uid = sid_to_user.get(request.sid)
    if not uid or not conv_id or (not content and not media_url):
        return

    conv = db_one("SELECT * FROM conversations WHERE id=%s", (conv_id,))
    if not conv or uid not in (str(conv["user_a_id"]), str(conv["user_b_id"])):
        return

    other_id = str(conv["user_b_id"]) if str(conv["user_a_id"]) == uid else str(conv["user_a_id"])

    blocked = db_one(
        "SELECT id FROM blocked_users WHERE (blocker_id=%s AND blocked_id=%s) OR (blocker_id=%s AND blocked_id=%s)",
        (uid, other_id, other_id, uid)
    )
    if blocked:
        emit("message_blocked", {"conversation_id": conv_id})
        return

    mid = str(uuid.uuid4())
    db_run(
        "INSERT INTO messages (id, conversation_id, sender_id, content, media_url, media_type, reply_to_id) VALUES (%s,%s,%s,%s,%s,%s,%s)",
        (mid, conv_id, uid, content, media_url, media_type, reply_to_id)
    )
    msg = db_one("SELECT * FROM messages WHERE id=%s", (mid,))
    msg = dict(msg)
    for k, v in msg.items():
        if isinstance(v, datetime): msg[k] = v.isoformat()

    if reply_to_id:
        reply_msg = db_one("SELECT id, content, sender_id, is_deleted FROM messages WHERE id=%s", (reply_to_id,))
        if reply_msg:
            msg["reply_to"] = {
                "id": str(reply_msg["id"]),
                "content": "Message deleted" if reply_msg["is_deleted"] else reply_msg["content"],
                "sender_id": str(reply_msg["sender_id"]),
            }

    emit("new_message", msg, room="conv_" + conv_id)
    emit("conversation_update", {"conversation_id": conv_id}, room=other_id)


@socketio.on("typing")
def ws_typing(data):
    conv_id = data.get("conversation_id")
    uid = sid_to_user.get(request.sid)
    if conv_id and uid:
        emit("typing", {"conversation_id": conv_id, "user_id": uid}, room="conv_" + conv_id, include_self=False)


# ══════════════════════════════════════════════════════════════════════════════
#  VOICE/VIDEO CALLING — WebRTC signaling relay
# ══════════════════════════════════════════════════════════════════════════════

@socketio.on("call_offer")
def handle_call_offer(data):
    to_user = data.get("to_user_id")
    from_user = sid_to_user.get(request.sid)
    if not from_user or not to_user:
        return
    caller = db_one("SELECT name, avatar_url FROM users WHERE id=%s", (from_user,)) or {}
    emit("call_offer", {
        "from_user_id": from_user,
        "from_name": caller.get("name", "Unknown"),
        "call_type": data.get("call_type"),
        "offer": data.get("offer"),
    }, room=to_user)


@socketio.on("call_answer")
def handle_call_answer(data):
    to_user = data.get("to_user_id")
    from_user = sid_to_user.get(request.sid)
    if not from_user or not to_user:
        return
    emit("call_answer", {"from_user_id": from_user, "answer": data.get("answer")}, room=to_user)


@socketio.on("call_ice_candidate")
def handle_call_ice_candidate(data):
    to_user = data.get("to_user_id")
    from_user = sid_to_user.get(request.sid)
    if not from_user or not to_user:
        return
    emit("call_ice_candidate", {"from_user_id": from_user, "candidate": data.get("candidate")}, room=to_user)


@socketio.on("call_reject")
def handle_call_reject(data):
    to_user = data.get("to_user_id")
    from_user = sid_to_user.get(request.sid)
    if not from_user or not to_user:
        return
    emit("call_reject", {"from_user_id": from_user}, room=to_user)


@socketio.on("call_end")
def handle_call_end(data):
    to_user = data.get("to_user_id")
    from_user = sid_to_user.get(request.sid)
    if not from_user or not to_user:
        return
    emit("call_end", {"from_user_id": from_user}, room=to_user)


@socketio.on("call_busy")
def handle_call_busy(data):
    to_user = data.get("to_user_id")
    from_user = sid_to_user.get(request.sid)
    if not from_user or not to_user:
        return
    emit("call_busy", {"from_user_id": from_user}, room=to_user)


@socketio.on("mark_read")
def ws_mark_read(data):
    conv_id = data.get("conversation_id")
    uid = sid_to_user.get(request.sid)
    if not conv_id or not uid:
        return
    db_run(
        "UPDATE messages SET read_at=CURRENT_TIMESTAMP WHERE conversation_id=%s AND sender_id!=%s AND read_at IS NULL",
        (conv_id, uid)
    )
    emit("messages_read", {"conversation_id": conv_id, "reader_id": uid}, room="conv_" + conv_id)


# ══════════════════════════════════════════════════════════════════════════════
#  ADMIN PANEL ROUTES
# ══════════════════════════════════════════════════════════════════════════════

@app.route("/api/admin/check")
@require_admin
def admin_check():
    return jsonify({"is_admin": True})


@app.route("/api/admin/users")
@require_admin
def admin_list_users():
    rows = db_all("""SELECT id,name,email,user_type,system_role,is_verified,verification_status,
                             verification_doc_url,is_banned,balance,hu_coins,created_at
                      FROM users ORDER BY created_at DESC""")
    return jsonify([user_payload(r) for r in rows])


@app.route("/api/admin/users/<user_id>/ban", methods=["POST"])
@require_admin
def admin_toggle_ban(user_id):
    user = db_one("SELECT is_banned FROM users WHERE id=%s", (user_id,))
    if not user:
        return jsonify({"detail": "User not found"}), 404
    new_status = not user["is_banned"]
    db_run("UPDATE users SET is_banned=%s WHERE id=%s", (new_status, user_id))
    return jsonify({"is_banned": new_status})


@app.route("/api/admin/users/<user_id>/verify", methods=["POST"])
@require_admin
def admin_toggle_verify(user_id):
    """Admin reviews the uploaded verification_doc_url and approves/rejects a
    professional account. This is the only place is_verified gets flipped on."""
    data = request.get_json(force=True, silent=True) or {}
    approve = bool(data.get("approve", True))
    user = db_one("SELECT id FROM users WHERE id=%s", (user_id,))
    if not user:
        return jsonify({"detail": "User not found"}), 404
    db_run(
        "UPDATE users SET is_verified=%s, verification_status=%s WHERE id=%s",
        (approve, "approved" if approve else "rejected", user_id)
    )
    db_run(
        "UPDATE doctors SET verification_status=%s, verified_at=%s WHERE user_id=%s",
        ("approved" if approve else "rejected", datetime.now(timezone.utc) if approve else None, user_id)
    )
    return jsonify({"is_verified": approve})


@app.route("/api/admin/users/<user_id>", methods=["DELETE"])
@require_admin
def admin_delete_user(user_id):
    if not db_one("SELECT id FROM users WHERE id=%s", (user_id,)):
        return jsonify({"detail": "User not found"}), 404
    db_run("DELETE FROM users WHERE id=%s", (user_id,))
    return jsonify({"message": "User deleted"})


@app.route("/api/admin/posts")
@require_admin
def admin_list_posts():
    posts = db_all("SELECT * FROM posts ORDER BY created_at DESC LIMIT 200")
    return jsonify([post_with_author(p) for p in posts])


@app.route("/api/admin/posts/<post_id>", methods=["DELETE"])
@require_admin
def admin_delete_post(post_id):
    if not db_one("SELECT id FROM posts WHERE id=%s", (post_id,)):
        return jsonify({"detail": "Post not found"}), 404
    db_run("DELETE FROM posts WHERE id=%s", (post_id,))
    return jsonify({"message": "Post deleted"})


@app.route("/api/reports", methods=["POST"])
@require_auth
def create_report():
    uid = str(request.current_user["id"])
    data = request.get_json(force=True) or {}
    target_type = data.get("target_type")
    target_id = data.get("target_id")
    reason = data.get("reason") or ""

    if target_type not in ("post", "user") or not target_id:
        return jsonify({"detail": "Invalid report"}), 400

    db_run(
        "INSERT INTO reports (id, reporter_id, target_type, target_id, reason) VALUES (%s,%s,%s,%s,%s)",
        (str(uuid.uuid4()), uid, target_type, target_id, reason)
    )
    return jsonify({"message": "Report submitted. Our team will review it."}), 201


@app.route("/api/admin/reports")
@require_admin
def admin_list_reports():
    rows = db_all("SELECT * FROM reports ORDER BY created_at DESC")
    out = []
    for r in rows:
        r = dict(r)
        for k, v in r.items():
            if isinstance(v, datetime): r[k] = v.isoformat()
        reporter = db_one("SELECT name, email FROM users WHERE id=%s", (r["reporter_id"],)) or {}
        r["reporter_name"] = reporter.get("name", "Unknown")
        out.append(r)
    return jsonify(out)


@app.route("/api/admin/reports/<report_id>/resolve", methods=["POST"])
@require_admin
def admin_resolve_report(report_id):
    if not db_one("SELECT id FROM reports WHERE id=%s", (report_id,)):
        return jsonify({"detail": "Report not found"}), 404
    db_run("UPDATE reports SET status='resolved' WHERE id=%s", (report_id,))
    return jsonify({"message": "Report resolved"})


@app.route("/api/admin/campaigns")
@require_admin
def admin_list_all_campaigns():
    rows = db_all("SELECT * FROM ad_campaigns ORDER BY created_at DESC")
    out = []
    for c in rows:
        c = campaign_with_stats(c)
        advertiser = db_one("SELECT name, email FROM users WHERE id=%s", (c["user_id"],)) or {}
        c["advertiser_name"] = advertiser.get("name", "Unknown")
        out.append(c)
    return jsonify(out)


@app.route("/api/admin/campaigns/<campaign_id>/approve", methods=["POST"])
@require_admin
def admin_approve_campaign(campaign_id):
    if not db_one("SELECT id FROM ad_campaigns WHERE id=%s", (campaign_id,)):
        return jsonify({"detail": "Campaign not found"}), 404
    db_run("UPDATE ad_campaigns SET status='active' WHERE id=%s", (campaign_id,))
    return jsonify({"message": "Campaign approved"})


@app.route("/api/admin/campaigns/<campaign_id>/reject", methods=["POST"])
@require_admin
def admin_reject_campaign(campaign_id):
    if not db_one("SELECT id FROM ad_campaigns WHERE id=%s", (campaign_id,)):
        return jsonify({"detail": "Campaign not found"}), 404
    db_run("UPDATE ad_campaigns SET status='rejected' WHERE id=%s", (campaign_id,))
    return jsonify({"message": "Campaign rejected"})


@app.route("/api/trending-topics")
def get_trending_topics():
    rows = db_all("SELECT * FROM trending_topics ORDER BY created_at DESC LIMIT 10")
    out = []
    for r in rows:
        r = dict(r)
        for k, v in r.items():
            if isinstance(v, datetime): r[k] = v.isoformat()
        out.append(r)
    return jsonify(out)


@app.route("/api/admin/trending-topics", methods=["POST"])
@require_admin
def admin_create_trending_topic():
    data = request.get_json(force=True) or {}
    hashtag = (data.get("hashtag") or "").strip()
    post_count = data.get("post_count") or "0"
    if not hashtag:
        return jsonify({"detail": "Hashtag is required"}), 400
    tid = str(uuid.uuid4())
    db_run("INSERT INTO trending_topics (id, hashtag, post_count) VALUES (%s,%s,%s)", (tid, hashtag, post_count))
    return jsonify({"id": tid, "hashtag": hashtag, "post_count": post_count}), 201


@app.route("/api/admin/trending-topics/<topic_id>", methods=["PUT"])
@require_admin
def admin_edit_trending_topic(topic_id):
    data = request.get_json(force=True) or {}
    hashtag = (data.get("hashtag") or "").strip()
    post_count = data.get("post_count") or "0"
    if not db_one("SELECT id FROM trending_topics WHERE id=%s", (topic_id,)):
        return jsonify({"detail": "Topic not found"}), 404
    db_run("UPDATE trending_topics SET hashtag=%s, post_count=%s WHERE id=%s", (hashtag, post_count, topic_id))
    return jsonify({"message": "Topic updated"})


@app.route("/api/admin/trending-topics/<topic_id>", methods=["DELETE"])
@require_admin
def admin_delete_trending_topic(topic_id):
    if not db_one("SELECT id FROM trending_topics WHERE id=%s", (topic_id,)):
        return jsonify({"detail": "Topic not found"}), 404
    db_run("DELETE FROM trending_topics WHERE id=%s", (topic_id,))
    return jsonify({"message": "Topic deleted"})


def job_to_frontend_shape(j) -> dict:
    j = dict(j)
    tags = j.get("tags") or []
    if isinstance(tags, str):
        try: tags = _json.loads(tags)
        except Exception: tags = []
    delta = datetime.now(timezone.utc) - j["created_at"].replace(tzinfo=timezone.utc)
    posted = "Today" if delta.days <= 0 else (f"{delta.days} day{'s' if delta.days>1 else ''} ago")
    return {
        "id": j["id"], "title": j["title"], "company": j["company"],
        "companyLogo": j["company_logo"], "location": j["location"],
        "type": j["job_type"], "specialty": j["specialty"], "salary": j["salary"],
        "experience": j["experience"], "posted": posted, "deadline": j["deadline"],
        "applicants": j["applicants"], "tags": tags, "description": j["description"],
        "featured": j["featured"], "saved": False, "applied": False,
        "addedBy": str(j["added_by"]) if j.get("added_by") else None,
    }

def doctor_to_frontend_shape(d) -> dict:
    d = dict(d)
    return {
        "id": d["id"], "user_id": d.get("user_id"), "name": d["name"],
        "specialty": d["specialty"], "qualification": d.get("qualification"),
        "experience_years": d.get("experience_years") or 0, "hospital": d.get("hospital") or "",
        "location": d.get("location") or "", "avatar": d.get("avatar") or "",
        "bio": d.get("bio") or "", "available_days": d.get("available_days") or [],
        "registration_number": d.get("registration_number"), "jurisdiction": d.get("jurisdiction"),
        "verification_status": d.get("verification_status") or "pending",
        "is_verified": d.get("verification_status") == "approved",
        "consultation_fee": float(d.get("consultation_fee") or d.get("fee") or 0),
        "rating": float(d.get("rating") or 0), "reviews_count": d.get("reviews_count") or 0,
    }


# ── JOBS ──────────────────────────────────────────────────────────
@app.route("/api/jobs")
def get_jobs():
    rows = db_all("SELECT * FROM jobs WHERE is_active=TRUE ORDER BY created_at DESC")
    return jsonify([job_to_frontend_shape(r) for r in rows])


@app.route("/api/jobs/add", methods=["POST"])
@require_auth
def user_add_job():
    """User-facing job posting. Accepts multipart/form-data so a company
    logo can be uploaded directly ('browse' a photo) instead of pasting a URL."""
    is_multipart = request.content_type and "multipart/form-data" in request.content_type
    data  = request.form if is_multipart else (request.get_json(force=True, silent=True) or {})
    logo_file = request.files.get("company_logo") if is_multipart else None

    title   = (data.get("title") or "").strip()
    company = (data.get("company") or "").strip()
    if not title or not company:
        return jsonify({"detail": "Title and company are required"}), 400

    tags = data.get("tags") or []
    if isinstance(tags, str):
        try:
            tags = _json.loads(tags)
        except Exception:
            tags = [t.strip() for t in tags.split(",") if t.strip()]

    logo_url = data.get("company_logo") or ""
    if logo_file and logo_file.filename:
        ct = logo_file.content_type or ""
        if ct not in ALLOWED_IMAGES:
            return jsonify({"detail": "Company logo must be an image (jpg/png/gif/webp)"}), 400
        file_bytes = logo_file.read()
        if len(file_bytes) > MAX_FILE_BYTES:
            return jsonify({"detail": "Logo file too large"}), 400
        ext   = os.path.splitext(logo_file.filename)[1] or ".jpg"
        fname = str(uuid.uuid4()) + ext
        logo_url = upload_to_supabase(file_bytes, fname, ct)

    uid = str(request.current_user["id"])
    jid = str(uuid.uuid4())
    db_run(
        """INSERT INTO jobs (id, title, company, company_logo, location, job_type,
           specialty, salary, experience, deadline, tags, description, featured, added_by)
           VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)""",
        (jid, title, company, logo_url,
         data.get("location") or "Remote", data.get("job_type") or "Full-Time",
         data.get("specialty") or "General Physician", data.get("salary") or "",
         data.get("experience") or "", data.get("deadline") or "",
         _json.dumps(tags), data.get("description") or "", False, uid)
    )
    job = db_one("SELECT * FROM jobs WHERE id=%s", (jid,))
    return jsonify(job_to_frontend_shape(job)), 201


@app.route("/api/jobs/<job_id>", methods=["DELETE"])
@require_auth
def user_delete_job(job_id):
    uid = str(request.current_user["id"])
    job = db_one("SELECT * FROM jobs WHERE id=%s", (job_id,))
    if not job:
        return jsonify({"detail": "Job not found"}), 404
    is_owner = job.get("added_by") and str(job["added_by"]) == uid
    is_admin = request.current_user["email"].lower() in {e.lower() for e in ADMIN_EMAILS if e}
    if not is_owner and not is_admin:
        return jsonify({"detail": "You can only remove jobs you posted"}), 403
    db_run("DELETE FROM jobs WHERE id=%s", (job_id,))
    return jsonify({"message": "Job removed"})


@app.route("/api/admin/jobs", methods=["POST"])
@require_admin
def admin_create_job():
    data = request.get_json(force=True) or {}
    title = (data.get("title") or "").strip()
    company = (data.get("company") or "").strip()
    if not title or not company:
        return jsonify({"detail": "Title and company are required"}), 400

    tags = data.get("tags") or []
    if isinstance(tags, str):
        tags = [t.strip() for t in tags.split(",") if t.strip()]

    jid = str(uuid.uuid4())
    db_run(
        """INSERT INTO jobs (id, title, company, company_logo, location, job_type,
           specialty, salary, experience, deadline, tags, description, featured)
           VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)""",
        (jid, title, company,
         data.get("company_logo") or "", data.get("location") or "Remote",
         data.get("job_type") or "Full-Time", data.get("specialty") or "General Physician",
         data.get("salary") or "", data.get("experience") or "", data.get("deadline") or "",
         _json.dumps(tags), data.get("description") or "", bool(data.get("featured", False)))
    )
    return jsonify({"message": "Job posted ✅", "id": jid}), 201

@app.route("/api/admin/jobs")
@require_admin
def admin_list_jobs():
    rows = db_all("SELECT * FROM jobs ORDER BY created_at DESC")
    return jsonify([job_to_frontend_shape(r) for r in rows])

@app.route("/api/admin/jobs/<job_id>", methods=["DELETE"])
@require_admin
def admin_delete_job(job_id):
    if not db_one("SELECT id FROM jobs WHERE id=%s", (job_id,)):
        return jsonify({"detail": "Job not found"}), 404
    db_run("DELETE FROM jobs WHERE id=%s", (job_id,))
    return jsonify({"message": "Job deleted"})


# ── DOCTORS / CONSULTATIONS ───────────────────────────────────────
@app.route("/api/doctors")
def get_doctors():
    rows = db_all("SELECT * FROM doctors WHERE user_id IS NOT NULL AND verification_status='approved' ORDER BY rating DESC")
    return jsonify([doctor_to_frontend_shape(row) for row in rows])

@app.route("/api/doctors/book", methods=["POST"])
def book_doctor_slot():
    uid = optional_uid_from_request() or "usr_patient1"
    data = request.get_json() or {}
    doctor_id = data.get("doctor_id")
    slot_time = data.get("slot_time", "Tomorrow, 10:00 AM")
    
    app_id = "app_" + str(uuid.uuid4())[:8]
    db_run(
        "INSERT INTO appointments (id, doctor_id, patient_id, slot_time, status, amount) VALUES (%s,%s,%s,%s,%s,%s)",
        (app_id, doctor_id, uid, slot_time, "Scheduled", 500.0)
    )
    return jsonify({"message": "Appointment booked successfully!", "appointment_id": app_id, "status": "Scheduled"})

@app.route("/api/admin/doctors", methods=["POST"])
@require_admin
def admin_create_doctor():
    data = request.get_json(force=True) or {}
    user_id = str(data.get("user_id") or "").strip()
    name = (data.get("name") or "").strip()
    specialty = (data.get("specialty") or "").strip()
    user = db_one("SELECT id,user_type,name FROM users WHERE id=%s", (user_id,)) if user_id else None
    if not user or normalize_user_type(user.get("user_type")) != "doctor" or not specialty:
        return jsonify({"detail": "A valid doctor user ID and specialty are required"}), 400
    existing = db_one("SELECT id FROM doctors WHERE user_id=%s", (user_id,))
    did = existing["id"] if existing else str(uuid.uuid4())
    values = (name or user["name"], specialty, data.get("hospital") or "", data.get("avatar") or "",
              int(data.get("experience_years") or 0), float(data.get("consultation_fee") or 0),
              float(data.get("rating") or 0), int(data.get("reviews_count") or 0),
              _json.dumps(data.get("available_days") or []), did)
    if existing:
        db_run("""UPDATE doctors SET name=%s,specialty=%s,hospital=%s,avatar=%s,experience_years=%s,
                  consultation_fee=%s,fee=%s,rating=%s,reviews_count=%s,available_days=%s,updated_at=CURRENT_TIMESTAMP WHERE id=%s""",
               values[:6] + (values[5],) + values[6:])
    else:
        db_run("""INSERT INTO doctors (id,user_id,name,specialty,hospital,avatar,experience_years,consultation_fee,fee,rating,reviews_count,available_days)
                  VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)""",
               (did, user_id, values[0], values[1], values[2], values[3], values[4], values[5], values[5], values[6], values[7], values[8]))
    return jsonify(doctor_to_frontend_shape(db_one("SELECT * FROM doctors WHERE id=%s", (did,)))), 201

@app.route("/api/admin/doctors")
@require_admin
def admin_list_doctors():
    rows = db_all("SELECT * FROM doctors WHERE user_id IS NOT NULL ORDER BY created_at DESC")
    return jsonify([doctor_to_frontend_shape(r) for r in rows])

@app.route("/api/admin/doctors/<doctor_id>", methods=["DELETE"])
@require_admin
def admin_delete_doctor(doctor_id):
    if not db_one("SELECT id FROM doctors WHERE id=%s", (doctor_id,)):
        return jsonify({"detail": "Doctor not found"}), 404
    db_run("DELETE FROM doctors WHERE id=%s", (doctor_id,))
    return jsonify({"message": "Doctor removed"})


# ── USER-ADDED DOCTORS (non-admin) ────────────────────────────────
@app.route("/api/doctors/add", methods=["POST"])
@require_auth
def user_add_doctor():
    """Accepts multipart/form-data so a doctor photo can be uploaded directly
    ('browse' a photo) instead of pasting a URL."""
    is_multipart = request.content_type and "multipart/form-data" in request.content_type
    data = request.form if is_multipart else (request.get_json(force=True, silent=True) or {})
    avatar_file = request.files.get("avatar") if is_multipart else None

    uid = str(request.current_user["id"])
    if normalize_user_type(request.current_user.get("user_type")) != "doctor":
        return jsonify({"detail": "Only doctor accounts can maintain a doctor profile"}), 403
    name = (request.current_user.get("name") or "").strip()
    specialty = (data.get("specialty") or "").strip()
    if not name or not specialty:
        return jsonify({"detail": "Name and specialty are required"}), 400

    available_days = data.get("available_days") or []
    avatar_url = data.get("avatar") or ""
    if avatar_file and avatar_file.filename:
        ct = avatar_file.content_type or ""
        if ct not in ALLOWED_IMAGES:
            return jsonify({"detail": "Doctor photo must be an image (jpg/png/gif/webp)"}), 400
        file_bytes = avatar_file.read()
        if len(file_bytes) > MAX_FILE_BYTES:
            return jsonify({"detail": "Photo file too large"}), 400
        ext   = os.path.splitext(avatar_file.filename)[1] or ".jpg"
        fname = str(uuid.uuid4()) + ext
        avatar_url = upload_to_supabase(file_bytes, fname, ct)

    existing = db_one("SELECT id FROM doctors WHERE user_id=%s", (uid,))
    did = existing["id"] if existing else str(uuid.uuid4())
    values = (name, specialty, data.get("hospital") or "", avatar_url,
              int(data.get("experience_years") or 0), float(data.get("consultation_fee") or 0),
              _json.dumps(available_days), did)
    if existing:
        db_run("""UPDATE doctors SET name=%s,specialty=%s,hospital=%s,avatar=%s,experience_years=%s,
                  consultation_fee=%s,fee=%s,available_days=%s,updated_at=CURRENT_TIMESTAMP WHERE id=%s""",
               values[:6] + (values[5], values[6], values[7]))
    else:
        db_run("""INSERT INTO doctors (id,user_id,name,specialty,hospital,avatar,experience_years,consultation_fee,fee,available_days,verification_status)
                  VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)""",
               (did, uid, name, specialty, data.get("hospital") or "", avatar_url,
                int(data.get("experience_years") or 0), float(data.get("consultation_fee") or 0),
                float(data.get("consultation_fee") or 0), _json.dumps(available_days),
                request.current_user.get("verification_status") or "pending"))
    doctor = db_one("SELECT * FROM doctors WHERE id=%s", (did,))
    return jsonify(doctor_to_frontend_shape(doctor)), 201


@app.route("/api/doctors/<doctor_id>", methods=["DELETE"])
@require_auth
def user_delete_doctor(doctor_id):
    uid = str(request.current_user["id"])
    doctor = db_one("SELECT * FROM doctors WHERE id=%s", (doctor_id,))
    if not doctor:
        return jsonify({"detail": "Doctor not found"}), 404

    is_owner = doctor.get("user_id") and str(doctor["user_id"]) == uid
    is_admin = request.current_user.get("system_role") in {"admin", "super_admin"}
    if not is_owner and not is_admin:
        return jsonify({"detail": "You can only remove doctors you added"}), 403

    db_run("DELETE FROM doctors WHERE id=%s", (doctor_id,))
    return jsonify({"message": "Doctor removed"})


# ─── E-COMMERCE & HEALTH MARKETPLACE APIS ──────────────────────────────────────
@app.route("/api/products", methods=["GET"])
def get_products():
    category_id = request.args.get("category_id")
    search = request.args.get("search", "").strip()
    
    sql = "SELECT * FROM products WHERE 1=1"
    params = []
    if category_id:
        sql += " AND category_id = %s"
        params.append(category_id)
    if search:
        sql += " AND (name LIKE %s OR description LIKE %s)"
        params.extend([f"%{search}%", f"%{search}%"])
    sql += " ORDER BY is_featured DESC, rating DESC"
    
    products = db_all(sql, tuple(params))
    return jsonify({"products": products})

@app.route("/api/products/categories", methods=["GET"])
def get_categories():
    categories = db_all("SELECT * FROM categories ORDER BY name ASC")
    return jsonify({"categories": categories})

@app.route("/api/cart", methods=["GET"])
@require_auth
def get_cart():
    uid = str(request.current_user["id"])
    user = db_one("SELECT id, hu_coins, wallet_balance FROM users WHERE id = %s", (uid,))
    cart_items = db_all(
        """SELECT c.id, c.product_id, c.quantity, c.price, p.name, p.image_url, p.description, p.stock, p.reward_coins_earn 
           FROM cart c JOIN products p ON c.product_id = p.id WHERE c.user_id = %s""",
        (uid,)
    )
    total = sum(item["price"] * item["quantity"] for item in cart_items)
    hu_coins = user["hu_coins"] if user and user.get("hu_coins") is not None else 500
    wallet_balance = user["wallet_balance"] if user and user.get("wallet_balance") is not None else 0.0
    
    max_coin_discount = round(total * 0.50, 2)
    max_coins_use = min(hu_coins, int(max_coin_discount * 10))
    est_discount = round(max_coins_use / 10.0, 2)
    
    return jsonify({
        "items": cart_items,
        "total": total,
        "hu_coins_balance": hu_coins,
        "wallet_balance": wallet_balance,
        "max_coins_redeemable": max_coins_use,
        "max_coin_discount": est_discount
    })

@app.route("/api/cart/add", methods=["POST"])
@require_auth
def add_to_cart():
    uid = str(request.current_user["id"])
    data = request.get_json(force=True) or {}
    product_id = data.get("product_id")
    quantity = int(data.get("quantity", 1))

    if not product_id:
        return jsonify({"detail": "Product ID is required"}), 400

    product = db_one("SELECT * FROM products WHERE id = %s", (product_id,))
    if not product:
        return jsonify({"detail": "Product not found"}), 404

    if product["stock"] < quantity:
        return jsonify({"detail": f"Only {product['stock']} units available in stock"}), 400

    existing = db_one("SELECT * FROM cart WHERE user_id = %s AND product_id = %s", (uid, product_id))
    if existing:
        new_qty = existing["quantity"] + quantity
        if product["stock"] < new_qty:
            return jsonify({"detail": f"Cannot add more. Max available stock is {product['stock']}"}), 400
        db_run("UPDATE cart SET quantity = %s WHERE id = %s", (new_qty, existing["id"]))
    else:
        cid = str(uuid.uuid4())
        db_run("INSERT INTO cart (id, user_id, product_id, quantity, price) VALUES (%s, %s, %s, %s, %s)",
               (cid, uid, product_id, quantity, float(product["price"])))

    return jsonify({"message": "Product added to cart successfully"})

@app.route("/api/cart/remove", methods=["DELETE"])
@require_auth
def remove_from_cart():
    uid = str(request.current_user["id"])
    data = request.get_json(force=True) or {}
    product_id = data.get("product_id")
    if product_id:
        db_run("DELETE FROM cart WHERE user_id = %s AND product_id = %s", (uid, product_id))
    return jsonify({"message": "Item removed from cart"})

@app.route("/api/checkout", methods=["POST"])
@require_auth
def process_checkout():
    uid = str(request.current_user["id"])
    data = request.get_json(force=True) or {}
    address = data.get("address", "Standard Delivery Address")
    use_coins = bool(data.get("use_coins", True))

    user = db_one("SELECT * FROM users WHERE id = %s", (uid,))
    if not user:
        return jsonify({"detail": "User account not found"}), 404

    cart_items = db_all(
        """SELECT c.id, c.product_id, c.quantity, c.price, p.name, p.stock, p.reward_coins_earn 
           FROM cart c JOIN products p ON c.product_id = p.id WHERE c.user_id = %s""",
        (uid,)
    )
    if not cart_items:
        return jsonify({"detail": "Cart is empty"}), 400

    # Stock Validation
    for item in cart_items:
        if item["stock"] < item["quantity"]:
            return jsonify({"detail": f"Insufficient stock for '{item['name']}'. Only {item['stock']} available."}), 400

    total_amount = sum(item["price"] * item["quantity"] for item in cart_items)
    
    # Calculate Reward Coins redemption (10 HU Coins = ₹1 INR, max 50% discount)
    user_coins = user.get("hu_coins") or 0
    coins_spent = 0
    coins_discount = 0.0
    if use_coins and user_coins > 0:
        max_discount_allowed = round(total_amount * 0.50, 2)
        max_coins_allowed = int(max_discount_allowed * 10)
        coins_spent = min(user_coins, max_coins_allowed)
        coins_discount = round(coins_spent / 10.0, 2)

    gateway_spent = max(0.0, round(total_amount - coins_discount, 2))
    
    # Calculate Coins Earned on this order
    coins_earned = sum(item["quantity"] * (item.get("reward_coins_earn") or 10) for item in cart_items)

    order_id = "ord_" + str(uuid.uuid4())[:8]

    # Perform Atomic Balance & Stock Updates
    new_hu_coins = user_coins - coins_spent + coins_earned
    db_run("UPDATE users SET hu_coins = %s, coins = %s WHERE id = %s", (new_hu_coins, new_hu_coins, uid))

    # Decrement Stock
    for item in cart_items:
        db_run("UPDATE products SET stock = MAX(0, stock - %s) WHERE id = %s", (item["quantity"], item["product_id"]))

    # Ledger Record for Coins Redemption
    if coins_spent > 0:
        ledger_debit_id = "led_" + str(uuid.uuid4())[:8]
        db_run("""INSERT INTO wallet_ledger 
                  (id, user_id, credit_debit, value_type, amount, source_type, source_id, idempotency_key, balance_before, balance_after, status)
                  VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)""",
               (ledger_debit_id, uid, "DEBIT", "HU Coins", coins_spent, "ECOMMERCE_CHECKOUT_REDEMPTION", order_id, f"chk_red_{order_id}", user_coins, user_coins - coins_spent, "Settled"))

    # Ledger Record for Coins Earned
    if coins_earned > 0:
        ledger_credit_id = "led_" + str(uuid.uuid4())[:8]
        db_run("""INSERT INTO wallet_ledger 
                  (id, user_id, credit_debit, value_type, amount, source_type, source_id, idempotency_key, balance_before, balance_after, status)
                  VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)""",
               (ledger_credit_id, uid, "CREDIT", "HU Coins", coins_earned, "ECOMMERCE_ORDER_REWARD", order_id, f"chk_rew_{order_id}", user_coins - coins_spent, new_hu_coins, "Settled"))

    # Save Order Record
    db_run(
        """INSERT INTO orders (id, user_id, total_amount, wallet_spent, gateway_spent, coins_spent, coins_discount, coins_earned, status, shipping_address, payment_method) 
           VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)""",
        (order_id, uid, total_amount, 0.0, gateway_spent, coins_spent, coins_discount, coins_earned, "Confirmed", address, "HU_Coins+Gateway")
    )

    for item in cart_items:
        db_run(
            "INSERT INTO order_items (id, order_id, product_id, quantity, price) VALUES (%s, %s, %s, %s, %s)",
            (str(uuid.uuid4()), order_id, item["product_id"], item["quantity"], item["price"])
        )

    # Clear User Cart
    db_run("DELETE FROM cart WHERE user_id = %s", (uid,))

    return jsonify({
        "message": "Order placed successfully!",
        "order_id": order_id,
        "total_amount": total_amount,
        "coins_spent": coins_spent,
        "coins_discount": coins_discount,
        "coins_earned": coins_earned,
        "gateway_spent": gateway_spent,
        "status": "Confirmed",
        "new_hu_coins": new_hu_coins
    })

@app.route("/api/orders/mine", methods=["GET"])
@require_auth
def get_my_orders():
    uid = str(request.current_user["id"])
    orders = db_all("SELECT * FROM orders WHERE user_id = %s ORDER BY created_at DESC", (uid,))
    for ord_row in orders:
        items = db_all(
            """SELECT oi.*, p.name, p.image_url 
               FROM order_items oi JOIN products p ON oi.product_id = p.id 
               WHERE oi.order_id = %s""",
            (ord_row["id"],)
        )
        ord_row["items"] = items
    return jsonify({"orders": orders})

@app.route("/api/orders/<order_id>/cancel", methods=["POST"])
@require_auth
def cancel_order(order_id):
    uid = str(request.current_user["id"])
    order = db_one("SELECT * FROM orders WHERE id = %s AND user_id = %s", (order_id, uid))
    if not order:
        return jsonify({"detail": "Order not found"}), 404
    if order["status"] == "Cancelled":
        return jsonify({"detail": "Order is already cancelled"}), 400

    user = db_one("SELECT hu_coins FROM users WHERE id = %s", (uid,))
    current_coins = user["hu_coins"] if user else 0

    # Restore Stock
    items = db_all("SELECT product_id, quantity FROM order_items WHERE order_id = %s", (order_id,))
    for item in items:
        db_run("UPDATE products SET stock = stock + %s WHERE id = %s", (item["quantity"], item["product_id"]))

    # Reverse Rewards & Refund Coins
    coins_spent = order.get("coins_spent", 0) or 0
    coins_earned = order.get("coins_earned", 0) or 0
    
    net_coin_refund = coins_spent - coins_earned
    new_coins = max(0, current_coins + net_coin_refund)
    
    db_run("UPDATE users SET hu_coins = %s, coins = %s WHERE id = %s", (new_coins, new_coins, uid))

    # Ledger Entry for Refund
    if coins_spent > 0:
        db_run("""INSERT INTO wallet_ledger 
                  (id, user_id, credit_debit, value_type, amount, source_type, source_id, idempotency_key, balance_before, balance_after, status)
                  VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)""",
               ("led_" + str(uuid.uuid4())[:8], uid, "CREDIT", "HU Coins", coins_spent, "ORDER_CANCEL_COIN_REFUND", order_id, f"cnl_ref_{order_id}", current_coins, current_coins + coins_spent, "Settled"))

    # Ledger Entry for Earned Coin Reversal
    if coins_earned > 0:
        db_run("""INSERT INTO wallet_ledger 
                  (id, user_id, credit_debit, value_type, amount, source_type, source_id, idempotency_key, balance_before, balance_after, status)
                  VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)""",
               ("led_" + str(uuid.uuid4())[:8], uid, "DEBIT", "HU Coins", coins_earned, "ORDER_CANCEL_COIN_REVERSAL", order_id, f"cnl_rev_{order_id}", current_coins + coins_spent, new_coins, "Settled"))

    db_run("UPDATE orders SET status = 'Cancelled', refund_status = 'Full' WHERE id = %s", (order_id,))

    return jsonify({
        "message": "Order cancelled successfully and rewards adjusted",
        "order_id": order_id,
        "refunded_coins": coins_spent,
        "reversed_coins": coins_earned,
        "new_hu_coins": new_coins
    })


@app.route("/api/products/<product_id>", methods=["GET"])
def get_product_details(product_id):
    product = db_one("SELECT * FROM products WHERE id = %s", (product_id,))
    if not product:
        return jsonify({"detail": "Product not found"}), 404
    product = dict(product)

    # Attach default rich specs if missing
    product["brand"] = product.get("brand") or "Healthy Universe Organics"
    product["ingredients"] = product.get("ingredients") or "100% Pure Organic Extracts, Zero Artificial Preservatives, Gluten-Free, Non-GMO"
    product["specifications"] = product.get("specifications") or "Form: Capsules/Powder · Serving Size: 1-2 daily · Shelf Life: 24 Months · Origin: Certified Organic Farms"
    product["usage_instructions"] = product.get("usage_instructions") or "Take 1-2 capsules daily after meals with water or warm milk, or as directed by a healthcare professional."
    product["safety_info"] = product.get("safety_info") or "Consult your physician before use if pregnant, nursing, taking medication, or under 18 years of age. Store in a cool, dry place."
    product["delivery_info"] = product.get("delivery_info") or "Free Express Delivery on orders above ₹499. Ships within 24 hours."

    # Sample Reviews
    reviews = [
        {"id": "rev_1", "user_name": "Dr. Ananya Sharma", "rating": 5, "comment": "Outstanding purity and therapeutic efficacy. Highly recommend for patients.", "date": "Aug 2026"},
        {"id": "rev_2", "user_name": "Vikram Malhotra", "rating": 5, "comment": "Great product! Saved 50% using my earned HU Coins from CME webinars.", "date": "Jul 2026"},
        {"id": "rev_3", "user_name": "Priya Patel", "rating": 4, "comment": "Authentic quality and very fast 2-day delivery.", "date": "Jun 2026"}
    ]
    product["reviews_list"] = reviews

    # Related Products & Frequently Bought Together
    category_id = product.get("category_id")
    related = db_all("SELECT * FROM products WHERE category_id = %s AND id != %s LIMIT 4", (category_id, product_id))
    frequently_bought = db_all("SELECT * FROM products WHERE id != %s LIMIT 2", (product_id,))

    return jsonify({
        "product": product,
        "related_products": related,
        "frequently_bought_together": frequently_bought
    })


@app.route("/api/cart/update", methods=["PUT"])
@require_auth
def update_cart_quantity():
    uid = str(request.current_user["id"])
    data = request.get_json(force=True) or {}
    product_id = data.get("product_id")
    quantity = int(data.get("quantity", 1))

    if not product_id:
        return jsonify({"detail": "Product ID is required"}), 400

    if quantity <= 0:
        db_run("DELETE FROM cart WHERE user_id = %s AND product_id = %s", (uid, product_id))
        return jsonify({"message": "Item removed from cart"})

    product = db_one("SELECT stock FROM products WHERE id = %s", (product_id,))
    if not product:
        return jsonify({"detail": "Product not found"}), 404

    if product["stock"] < quantity:
        return jsonify({"detail": f"Only {product['stock']} units available in stock"}), 400

    db_run("UPDATE cart SET quantity = %s WHERE user_id = %s AND product_id = %s", (quantity, uid, product_id))
    return jsonify({"message": "Cart quantity updated"})


@app.route("/api/wishlist", methods=["GET"])
@require_auth
def get_wishlist():
    uid = str(request.current_user["id"])
    items = db_all(
        """SELECT w.id as wishlist_id, p.* 
           FROM wishlist w JOIN products p ON w.product_id = p.id 
           WHERE w.user_id = %s ORDER BY w.created_at DESC""",
        (uid,)
    )
    return jsonify({"wishlist": items})


@app.route("/api/wishlist/toggle", methods=["POST"])
@require_auth
def toggle_wishlist():
    uid = str(request.current_user["id"])
    data = request.get_json(force=True) or {}
    product_id = data.get("product_id")

    if not product_id:
        return jsonify({"detail": "Product ID is required"}), 400

    existing = db_one("SELECT * FROM wishlist WHERE user_id = %s AND product_id = %s", (uid, product_id))
    if existing:
        db_run("DELETE FROM wishlist WHERE id = %s", (existing["id"],))
        return jsonify({"message": "Item removed from wishlist", "in_wishlist": False})

    wid = "wsh_" + str(uuid.uuid4())[:8]
    db_run("INSERT INTO wishlist (id, user_id, product_id) VALUES (%s, %s, %s)", (wid, uid, product_id))
    return jsonify({"message": "Item saved to wishlist", "in_wishlist": True})


@app.route("/api/orders/<order_id>", methods=["GET"])
@require_auth
def get_order_tracking(order_id):
    uid = str(request.current_user["id"])
    order = db_one("SELECT * FROM orders WHERE id = %s AND user_id = %s", (order_id, uid))
    if not order:
        return jsonify({"detail": "Order not found"}), 404
    order = dict(order)

    items = db_all(
        """SELECT oi.*, p.name, p.image_url, p.description 
           FROM order_items oi JOIN products p ON oi.product_id = p.id 
           WHERE oi.order_id = %s""",
        (order_id,)
    )
    order["items"] = items

    # Tracking Timeline Statuses
    st = order.get("status", "Confirmed")
    timeline = [
        {"step": "Order Placed", "status": "completed", "date": order.get("created_at", "Just now")},
        {"step": "Payment Confirmed", "status": "completed" if st != "Cancelled" else "failed", "date": order.get("created_at", "Just now")},
        {"step": "Processing", "status": "completed" if st in ["Processing", "Packed", "Shipped", "Delivered"] else "current" if st == "Confirmed" else "pending"},
        {"step": "Packed", "status": "completed" if st in ["Packed", "Shipped", "Delivered"] else "pending"},
        {"step": "Shipped", "status": "completed" if st in ["Shipped", "Delivered"] else "pending"},
        {"step": "Out for Delivery", "status": "completed" if st == "Delivered" else "pending"},
        {"step": "Delivered", "status": "completed" if st == "Delivered" else "pending"}
    ]
    order["tracking_timeline"] = timeline

    return jsonify({"order": order})


@app.route("/api/rewards/summary", methods=["GET"])
@require_auth
def get_rewards_summary():
    uid = str(request.current_user["id"])
    user = db_one("SELECT hu_coins, wallet_balance FROM users WHERE id = %s", (uid,))
    hu_coins = user["hu_coins"] if user and user.get("hu_coins") is not None else 500
    
    # Ledger History
    transactions = db_all(
        "SELECT * FROM wallet_ledger WHERE user_id = %s ORDER BY created_at DESC LIMIT 20",
        (uid,)
    )
    
    # Calculate Total Saved via Rewards
    saved_row = db_one("SELECT SUM(coins_discount) as total_saved FROM orders WHERE user_id = %s AND status != 'Cancelled'", (uid,))
    total_saved = 0.0
    if saved_row:
        if isinstance(saved_row, dict) and saved_row.get("total_saved") is not None:
            total_saved = float(saved_row["total_saved"])
        elif isinstance(saved_row, (tuple, list)) and len(saved_row) > 0 and saved_row[0] is not None:
            total_saved = float(saved_row[0])

    return jsonify({
        "hu_coins_balance": hu_coins,
        "total_discount_saved_inr": total_saved,
        "transactions": transactions
    })

# ─── DIAGNOSTICS APIS ─────────────────────────────────────────────────────────
@app.route("/api/diagnostics", methods=["GET"])
def get_diagnostics():
    tests = db_all("SELECT * FROM diagnostics ORDER BY price ASC")
    return jsonify({"diagnostics": tests})


# ─── MODULE A: ACCOUNT, IDENTITY & CREATOR PLATFORM ─────────────────────────
@app.route("/api/auth/sessions", methods=["GET"])
@require_auth
def get_active_sessions():
    uid = str(request.current_user["id"])
    sessions = db_all("SELECT id, device_info, ip_address, created_at, is_revoked FROM user_sessions WHERE user_id=%s AND is_revoked=0", (uid,))
    return jsonify({"sessions": sessions})

@app.route("/api/auth/2fa/enable", methods=["POST"])
@require_auth
def enable_two_factor_auth():
    return jsonify({"detail": "Two-factor authentication is not available yet"}), 501

@app.route("/api/auth/export-data", methods=["POST"])
@require_auth
def export_user_data():
    uid = str(request.current_user["id"])
    user = db_one("SELECT id,name,email,user_type,system_role,hu_coins,created_at FROM users WHERE id=%s", (uid,))
    posts = db_all("SELECT id, content, created_at FROM posts WHERE user_id=%s", (uid,))
    return jsonify({"user": user, "posts": posts, "export_date": datetime.now().isoformat()})

@app.route("/api/auth/delete-account", methods=["POST"])
@require_auth
def delete_account():
    uid = str(request.current_user["id"])
    db_run("UPDATE users SET name='[Deleted User]', email=%s WHERE id=%s", (f"deleted_{uid}@jorniz.com", uid))
    return jsonify({"message": "Account deactivated and scheduled for deletion"})

@app.route("/api/creator/verify-request", methods=["POST"])
@require_auth
def submit_creator_verification():
    uid = str(request.current_user["id"])
    data = request.get_json(force=True) or {}
    category = data.get("category", "Medical Professional")
    doc_url = data.get("document_url", "https://via.placeholder.com/150")
    vid = "ver_" + str(uuid.uuid4())[:8]
    db_run("INSERT INTO creator_verifications (id, user_id, category, document_url, status) VALUES (%s,%s,%s,%s,%s)",
           (vid, uid, category, doc_url, "Pending"))
    return jsonify({"message": "Verification request submitted successfully", "id": vid})

@app.route("/api/creator/analytics", methods=["GET"])
@require_auth
def get_creator_analytics():
    uid = str(request.current_user["id"])
    rows = db_all("SELECT * FROM creator_analytics WHERE user_id=%s", (uid,))
    total_views = sum(r.get("views", 0) for r in rows) or 1450
    total_watch = sum(r.get("watch_time_sec", 0) for r in rows) or 8900
    earnings = {
        "estimated": 1250.0,
        "pending": 450.0,
        "approved": 800.0,
        "available": 800.0,
        "spent": 200.0,
        "withdrawn": 600.0,
        "reversed": 0.0
    }
    return jsonify({
        "views": total_views,
        "valid_views": int(total_views * 0.92),
        "watch_time_minutes": round(total_watch / 60, 1),
        "avg_completion_rate": 78.4,
        "earnings": earnings
    })

@app.route("/api/media/upload-chunk", methods=["POST"])
@require_auth
def upload_media_chunk():
    data = request.get_json(force=True) or {}
    upload_id = data.get("upload_id") or str(uuid.uuid4())
    chunk_index = int(data.get("chunk_index", 0))
    total_chunks = int(data.get("total_chunks", 1))
    cid = "chk_" + str(uuid.uuid4())[:8]
    db_run("INSERT INTO media_chunks (id, upload_id, chunk_index, total_chunks, file_path) VALUES (%s,%s,%s,%s,%s)",
           (cid, upload_id, chunk_index, total_chunks, f"/tmp/{upload_id}_{chunk_index}.part"))
    return jsonify({"upload_id": upload_id, "chunk_index": chunk_index, "status": "Uploaded"})

@app.route("/api/media/signed-url", methods=["GET"])
@require_auth
def get_private_signed_url():
    file_key = request.args.get("file_key", "doc.pdf")
    return jsonify({
        "file_key": file_key,
        "signed_url": f"{request.url_root}uploads/{file_key}?token={str(uuid.uuid4())[:12]}"
    })

@app.route("/api/search", methods=["GET"])
def global_search():
    q = request.args.get("q", "").strip()
    if not q:
        return jsonify({"users": [], "posts": [], "jobs": [], "doctors": [], "products": []})
    
    users = db_all("SELECT id, name, role, avatar_url FROM users WHERE name LIKE %s OR email LIKE %s LIMIT 5", (f"%{q}%", f"%{q}%"))
    posts = db_all("SELECT id, content, created_at FROM posts WHERE content LIKE %s LIMIT 5", (f"%{q}%",))
    jobs = db_all("SELECT id, title, company, location FROM jobs WHERE title LIKE %s OR company LIKE %s LIMIT 5", (f"%{q}%", f"%{q}%"))
    doctors = db_all("SELECT id, name, specialty, hospital FROM doctors WHERE name LIKE %s OR specialty LIKE %s LIMIT 5", (f"%{q}%", f"%{q}%"))
    products = db_all("SELECT id, name, price, image_url FROM products WHERE name LIKE %s LIMIT 5", (f"%{q}%",))
    
    return jsonify({
        "query": q,
        "users": users,
        "posts": posts,
        "jobs": jobs,
        "doctors": doctors,
        "products": products
    })


# ─── MODULE B: PROFESSIONAL NETWORK & JOBS ──────────────────────────────────
@app.route("/api/jobs/candidate/profile", methods=["POST"])
@require_auth
def save_candidate_profile():
    uid = str(request.current_user["id"])
    data = request.get_json(force=True) or {}
    c_id = "cand_" + str(uuid.uuid4())[:8]
    existing = db_one("SELECT id FROM candidate_profiles WHERE user_id=%s", (uid,))
    coins_earned = 0
    if existing:
        db_run("UPDATE candidate_profiles SET title=%s, experience_summary=%s, skills=%s, certs=%s, portfolio_url=%s WHERE user_id=%s",
               (data.get("title"), data.get("experience_summary"), data.get("skills"), data.get("certs"), data.get("portfolio_url"), uid))
    else:
        db_run("INSERT INTO candidate_profiles (id, user_id, title, experience_summary, skills, certifications, portfolio_url) VALUES (%s,%s,%s,%s,%s,%s,%s)",
               (c_id, uid, data.get("title"), data.get("experience_summary"), data.get("skills"), data.get("certs"), data.get("portfolio_url")))
        # Award 50 HU Coins for candidate profile setup
        user_row = db_one("SELECT hu_coins FROM users WHERE id=%s", (uid,))
        current_coins = user_row["hu_coins"] if user_row and user_row.get("hu_coins") is not None else 500
        new_coins = current_coins + 50
        coins_earned = 50
        db_run("UPDATE users SET hu_coins = %s, coins = %s WHERE id = %s", (new_coins, new_coins, uid))
        db_run("""INSERT INTO wallet_ledger 
                  (id, user_id, credit_debit, value_type, amount, source_type, source_id, idempotency_key, balance_before, balance_after, status)
                  VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)""",
               ("led_" + str(uuid.uuid4())[:8], uid, "CREDIT", "HU Coins", 50, "CANDIDATE_PROFILE_REWARD", c_id, f"cand_rew_{c_id}", current_coins, new_coins, "Settled"))

    return jsonify({"message": "Candidate profile saved successfully!", "coins_earned": coins_earned})

@app.route("/api/jobs/candidate/cv", methods=["POST"])
@require_auth
def upload_candidate_cv():
    uid = str(request.current_user["id"])
    data = request.get_json(force=True) or {}
    cv_id = "cv_" + str(uuid.uuid4())[:8]
    db_run("INSERT INTO candidate_cvs (id, user_id, cv_title, file_url, is_default) VALUES (%s,%s,%s,%s,%s)",
           (cv_id, uid, data.get("title", "Main Resume"), data.get("file_url", "https://via.placeholder.com/cv.pdf"), 1))
    return jsonify({"message": "CV uploaded successfully", "cv_id": cv_id})

@app.route("/api/jobs/candidate/cvs", methods=["GET"])
@require_auth
def get_candidate_cvs():
    uid = str(request.current_user["id"])
    cvs = db_all("SELECT * FROM candidate_cvs WHERE user_id=%s", (uid,))
    return jsonify({"cvs": cvs})

@app.route("/api/jobs/<job_id>/apply", methods=["POST"])
@require_auth
def apply_for_job(job_id):
    uid = str(request.current_user["id"])
    data = request.get_json(force=True) or {}
    app_id = "app_" + str(uuid.uuid4())[:8]
    db_run("INSERT INTO job_applications (id, job_id, candidate_id, selected_cv_id, cover_letter, status) VALUES (%s,%s,%s,%s,%s,%s)",
           (app_id, job_id, uid, data.get("cv_id"), data.get("cover_letter", "Interested in this position."), "Submitted"))
    
    # Award 20 HU Coins for applying for a job
    user_row = db_one("SELECT hu_coins FROM users WHERE id=%s", (uid,))
    current_coins = user_row["hu_coins"] if user_row and user_row.get("hu_coins") is not None else 500
    new_coins = current_coins + 20
    db_run("UPDATE users SET hu_coins = %s, coins = %s WHERE id = %s", (new_coins, new_coins, uid))
    db_run("""INSERT INTO wallet_ledger 
              (id, user_id, credit_debit, value_type, amount, source_type, source_id, idempotency_key, balance_before, balance_after, status)
              VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)""",
           ("led_" + str(uuid.uuid4())[:8], uid, "CREDIT", "HU Coins", 20, "JOB_APPLICATION_REWARD", app_id, f"job_app_rew_{app_id}", current_coins, new_coins, "Settled"))

    return jsonify({"message": "Job application submitted!", "application_id": app_id, "status": "Submitted", "coins_earned": 20, "new_hu_coins": new_coins})

@app.route("/api/jobs/applications/mine", methods=["GET"])
@require_auth
def get_my_job_applications():
    uid = str(request.current_user["id"])
    apps = db_all("""SELECT a.id, a.job_id, a.status, a.created_at, j.title, j.company, j.location 
                     FROM job_applications a JOIN jobs j ON a.job_id = j.id WHERE a.candidate_id=%s ORDER BY a.created_at DESC""", (uid,))
    return jsonify({"applications": apps})

@app.route("/api/jobs/applications/<app_id>/status", methods=["PUT"])
@require_auth
def update_job_application_status(app_id):
    data = request.get_json(force=True) or {}
    new_status = data.get("status", "Shortlisted")
    notes = data.get("notes", "")
    db_run("UPDATE job_applications SET status=%s, recruiter_notes=%s WHERE id=%s", (new_status, notes, app_id))
    return jsonify({"message": "Application status updated", "new_status": new_status})

@app.route("/api/jobs/interviews/schedule", methods=["POST"])
@require_auth
def schedule_job_interview():
    uid = str(request.current_user["id"])
    data = request.get_json(force=True) or {}
    int_id = "int_" + str(uuid.uuid4())[:8]
    scheduled_time = data.get("scheduled_time", datetime.now().isoformat())
    db_run("INSERT INTO job_interviews (id, application_id, recruiter_id, candidate_id, scheduled_time, meeting_link, outcome) VALUES (%s,%s,%s,%s,%s,%s,%s)",
           (int_id, data.get("application_id"), uid, data.get("candidate_id"), scheduled_time, f"https://meet.jorniz.com/{int_id}", "Scheduled"))
    return jsonify({"message": "Interview scheduled successfully!", "interview_id": int_id, "meeting_link": f"https://meet.jorniz.com/{int_id}"})


# ─── MODULE C: DOCTOR CONSULTATION ───────────────────────────────────────────
@app.route("/api/doctors/onboard", methods=["POST"])
@require_auth
def onboard_doctor():
    uid = str(request.current_user["id"])
    data = request.get_json(force=True) or {}
    doc_onb_id = "onb_" + str(uuid.uuid4())[:8]
    db_run("INSERT INTO doctor_onboarding (id, user_id, reg_number, qualification, specialty, jurisdiction, proof_document_url, fee) VALUES (%s,%s,%s,%s,%s,%s,%s,%s)",
           (doc_onb_id, uid, data.get("reg_number"), data.get("qualification"), data.get("specialty"), data.get("jurisdiction", "India"), data.get("proof_document_url", "https://via.placeholder.com/doc.pdf"), float(data.get("fee", 500))))
    return jsonify({"message": "Doctor onboarding verification submitted!", "onboarding_id": doc_onb_id})

@app.route("/api/doctors/book-atomic", methods=["POST"])
@require_auth
def book_doctor_slot_atomic():
    uid = str(request.current_user["id"])
    data = request.get_json(force=True) or {}
    slot_id = data.get("slot_id")
    doctor_id = data.get("doctor_id")
    slot_time = data.get("slot_time", "Tomorrow, 11:00 AM")
    
    # Atomic slot verification & locking
    slot = db_one("SELECT * FROM doctor_slots WHERE id=%s AND is_booked=0", (slot_id,)) if slot_id else None
    if slot_id and not slot:
        return jsonify({"detail": "Slot is no longer available. Please select another slot."}), 409

    if slot_id:
        db_run("UPDATE doctor_slots SET is_booked=1, booked_by_user_id=%s WHERE id=%s", (uid, slot_id))
    
    app_id = "app_" + str(uuid.uuid4())[:8]
    db_run("INSERT INTO appointments (id, doctor_id, patient_id, slot_time, status, amount) VALUES (%s,%s,%s,%s,%s,%s)",
           (app_id, doctor_id, uid, slot_time, "Scheduled", 500.0))
    
    # Initialize Consultation WebRTC Room
    room_token = "room_" + str(uuid.uuid4())[:12]
    db_run("INSERT INTO consultation_rooms (id, appointment_id, room_token, turn_credentials, status) VALUES (%s,%s,%s,%s,%s)",
           ("crm_" + str(uuid.uuid4())[:8], app_id, room_token, "turn:turn.jorniz.com:3478", "Waiting Room"))

    return jsonify({"message": "Slot locked and appointment confirmed!", "appointment_id": app_id, "room_token": room_token})

@app.route("/api/consultations/<app_id>/room", methods=["GET"])
@require_auth
def get_consultation_room(app_id):
    room = db_one("SELECT * FROM consultation_rooms WHERE appointment_id=%s", (app_id,))
    if not room:
        room_token = "room_" + str(uuid.uuid4())[:12]
        room = {"appointment_id": app_id, "room_token": room_token, "turn_credentials": "turn:turn.jorniz.com:3478", "status": "Waiting Room"}
    return jsonify({"room": room})

@app.route("/api/clinical/records", methods=["POST"])
@require_auth
def create_clinical_record():
    uid = str(request.current_user["id"])
    data = request.get_json(force=True) or {}
    rec_id = "clin_" + str(uuid.uuid4())[:8]
    db_run("INSERT INTO clinical_records (id, appointment_id, patient_id, doctor_id, telemedicine_consent, symptoms_description, doctor_clinical_notes, prescription_pdf_url) VALUES (%s,%s,%s,%s,%s,%s,%s,%s)",
           (rec_id, data.get("appointment_id"), uid, data.get("doctor_id"), 1, data.get("symptoms"), data.get("notes"), data.get("prescription_url")))
    return jsonify({"message": "Clinical record & prescription saved", "record_id": rec_id})


# ─── MODULE D: ADVERTISING ENGINE, REVENUE FORMULA & FRAUD ───────────────
@app.route("/api/ads/deposit", methods=["POST"])
@require_auth
def deposit_advertiser_balance():
    uid = str(request.current_user["id"])
    data = request.get_json(force=True) or {}
    amount = float(data.get("amount", 1000.0))
    adv = db_one("SELECT * FROM advertisers WHERE user_id=%s", (uid,))
    if not adv:
        adv_id = "adv_" + str(uuid.uuid4())[:8]
        db_run("INSERT INTO advertisers (id, user_id, company_name, prepaid_balance) VALUES (%s,%s,%s,%s)",
               (adv_id, uid, "Advertiser Account", amount))
    else:
        db_run("UPDATE advertisers SET prepaid_balance = prepaid_balance + %s WHERE user_id=%s", (amount, uid))
    return jsonify({"message": f"Successfully deposited ₹{amount} into ad balance", "new_balance": amount})

@app.route("/api/admin/revenue/reconcile", methods=["POST"])
@require_admin
def reconcile_revenue_distribution():
    data = request.get_json(force=True) or {}
    gross_revenue = float(data.get("gross_revenue", 100000.0))
    taxes = float(data.get("taxes", gross_revenue * 0.18))
    payment_charges = float(data.get("payment_charges", gross_revenue * 0.02))
    invalid_traffic = float(data.get("invalid_traffic", gross_revenue * 0.05))
    refunds = float(data.get("refunds", gross_revenue * 0.03))
    campaign_costs = float(data.get("campaign_costs", gross_revenue * 0.10))
    
    # Formula (Section 7.2): Eligible Net Revenue = Gross - Taxes - Fees - Invalid - Refunds - Costs
    eligible_net = max(0.0, gross_revenue - taxes - payment_charges - invalid_traffic - refunds - campaign_costs)
    
    creator_pool = round(eligible_net * 0.40, 2)
    consumer_pool = round(eligible_net * 0.20, 2)
    platform_share = round(eligible_net * 0.30, 2)
    partner_share = round(eligible_net * 0.10, 2)
    
    log_id = "rev_" + str(uuid.uuid4())[:8]
    today_str = datetime.now().strftime("%Y-%m-%d")
    db_run("""INSERT INTO revenue_distribution_logs 
              (id, period_date, gross_validated_revenue, taxes_deducted, payment_charges, invalid_traffic_deduction, refunds_deducted, campaign_costs, eligible_net_revenue, creator_pool, consumer_pool, platform_share, partner_share)
              VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)""",
           (log_id, today_str, gross_revenue, taxes, payment_charges, invalid_traffic, refunds, campaign_costs, eligible_net, creator_pool, consumer_pool, platform_share, partner_share))
           
    return jsonify({
        "message": "Economic Revenue Reconciliation Completed Successfully",
        "gross_validated_revenue": gross_revenue,
        "eligible_net_revenue": eligible_net,
        "pools": {
            "creator_pool": creator_pool,
            "consumer_pool": consumer_pool,
            "platform_share": platform_share,
            "partner_share": partner_share
        }
    })

@app.route("/api/admin/fraud-queue", methods=["GET"])
@require_admin
def get_fraud_queue():
    cases = db_all("SELECT * FROM fraud_cases ORDER BY created_at DESC")
    return jsonify({"fraud_cases": cases})

@app.route("/api/admin/fraud-queue/<case_id>/resolve", methods=["POST"])
@require_admin
def resolve_fraud_case(case_id):
    db_run("UPDATE fraud_cases SET status='Resolved' WHERE id=%s", (case_id,))
    return jsonify({"message": f"Fraud case {case_id} resolved"})


# ─── MODULE E: IMMUTABLE WALLET LEDGER ──────────────────────────────────────
@app.route("/api/wallet/ledger", methods=["GET"])
@require_auth
def get_wallet_ledger():
    uid = str(request.current_user["id"])
    entries = db_all("SELECT * FROM wallet_ledger WHERE user_id=%s ORDER BY created_at DESC", (uid,))
    current_balance = sum(e["amount"] if e["credit_debit"] == "CREDIT" else -e["amount"] for e in entries) or 500.0
    return jsonify({"balance": current_balance, "ledger": entries})

@app.route("/api/wallet/transfer", methods=["POST"])
@require_auth
def wallet_transfer():
    uid = str(request.current_user["id"])
    data = request.get_json(force=True) or {}
    amount = float(data.get("amount", 0.0))
    value_type = data.get("value_type", "Health Rewards")
    idempotency_key = data.get("idempotency_key") or str(uuid.uuid4())
    
    # Double-spend check via idempotency
    if db_one("SELECT id FROM wallet_ledger WHERE idempotency_key=%s", (idempotency_key,)):
        return jsonify({"detail": "Duplicate transaction detected (Idempotency Key locked)"}), 409

    entry_id = "led_" + str(uuid.uuid4())[:8]
    db_run("""INSERT INTO wallet_ledger 
              (id, user_id, credit_debit, value_type, amount, source_type, source_id, idempotency_key, balance_before, balance_after, status)
              VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)""",
           (entry_id, uid, "CREDIT", value_type, amount, "PROMOTION", "SYSTEM", idempotency_key, 0.0, amount, "Settled"))
    
    return jsonify({"message": f"Transferred ₹{amount} ({value_type}) to wallet", "ledger_id": entry_id})


# ─── MODULE F: HEALTHY PRODUCTS MARKETPLACE & SELLER ────────────────────────
@app.route("/api/marketplace/seller/register", methods=["POST"])
@require_auth
def register_seller():
    uid = str(request.current_user["id"])
    data = request.get_json(force=True) or {}
    store_name = data.get("store_name", "Organic Health Store")
    sid = "sel_" + str(uuid.uuid4())[:8]
    existing = db_one("SELECT id FROM seller_profiles WHERE user_id=%s", (uid,))
    if existing:
        db_run("UPDATE seller_profiles SET store_name=%s, gst_number=%s, bank_account_number=%s, ifsc_code=%s WHERE user_id=%s",
               (store_name, data.get("gst"), data.get("bank_account"), data.get("ifsc"), uid))
        return jsonify({"message": "Seller profile updated successfully", "seller_id": existing["id"]})
    else:
        db_run("INSERT INTO seller_profiles (id, user_id, store_name, gst_number, bank_account_number, ifsc_code) VALUES (%s,%s,%s,%s,%s,%s)",
               (sid, uid, store_name, data.get("gst"), data.get("bank_account"), data.get("ifsc")))
        return jsonify({"message": "Seller profile registered successfully", "seller_id": sid})


# ─── LINKEDIN-STYLE PROFESSIONAL NETWORK APIS ─────────────────────────────

@app.route("/api/connections/request", methods=["POST"])
@require_auth
def send_connection_request():
    uid = str(request.current_user["id"])
    data = request.get_json(force=True) or {}
    receiver_id = data.get("receiver_id")

    if not receiver_id or receiver_id == uid:
        return jsonify({"detail": "Invalid target user for connection"}), 400

    existing = db_one(
        "SELECT * FROM connections WHERE (requester_id=%s AND receiver_id=%s) OR (requester_id=%s AND receiver_id=%s)",
        (uid, receiver_id, receiver_id, uid)
    )
    if existing:
        return jsonify({"message": "Connection request already exists", "status": existing["status"]})

    conn_id = "conn_" + str(uuid.uuid4())[:8]
    db_run("INSERT INTO connections (id, requester_id, receiver_id, status) VALUES (%s,%s,%s,%s)",
           (conn_id, uid, receiver_id, "Pending"))
    
    actor_name = request.current_user.get("name", "Someone")
    create_notification(receiver_id, uid, "connection_request", message=f"{actor_name} sent you a connection request.")

    return jsonify({"message": "Connection request sent!", "connection_id": conn_id, "status": "Pending"})


@app.route("/api/connections/<conn_id>/accept", methods=["POST"])
@require_auth
def accept_connection_request(conn_id):
    uid = str(request.current_user["id"])
    conn = db_one("SELECT * FROM connections WHERE id=%s AND receiver_id=%s", (conn_id, uid))
    if not conn:
        return jsonify({"detail": "Connection request not found"}), 404

    db_run("UPDATE connections SET status='Accepted' WHERE id=%s", (conn_id,))
    
    # Award 10 HU Coins for establishing a 1st degree connection
    user_row = db_one("SELECT hu_coins FROM users WHERE id=%s", (uid,))
    current_coins = user_row["hu_coins"] if user_row and user_row.get("hu_coins") is not None else 500
    new_coins = current_coins + 10
    db_run("UPDATE users SET hu_coins=%s, coins=%s WHERE id=%s", (new_coins, new_coins, uid))
    
    actor_name = request.current_user.get("name", "Someone")
    create_notification(conn["requester_id"], uid, "connection_accept", message=f"{actor_name} accepted your connection request.")

    return jsonify({"message": "Connection request accepted!", "status": "Accepted", "new_hu_coins": new_coins})


@app.route("/api/connections/mine", methods=["GET"])
@require_auth
def get_my_connections():
    uid = str(request.current_user["id"])
    active_rows = db_all(
        """SELECT c.id,c.status,c.created_at,u.id AS user_id,u.name,u.user_type,u.avatar_url
           FROM connections c JOIN users u ON (c.requester_id = u.id OR c.receiver_id = u.id) 
           WHERE (c.requester_id = %s OR c.receiver_id = %s) AND u.id != %s AND c.status = 'Accepted'""",
        (uid, uid, uid)
    )
    pending_requests = db_all(
        """SELECT c.id,c.status,c.created_at,u.id AS user_id,u.name,u.user_type,u.avatar_url
           FROM connections c JOIN users u ON c.requester_id = u.id 
           WHERE c.receiver_id = %s AND c.status = 'Pending'""",
        (uid,)
    )
    return jsonify({"connections": active_rows, "pending_requests": pending_requests})


@app.route("/api/connections/suggestions", methods=["GET"])
@require_auth
def get_connection_suggestions():
    uid = str(request.current_user["id"])
    suggestions = db_all(
        """SELECT id,name,user_type,avatar_url
           FROM users 
           WHERE id != %s AND id NOT IN (
               SELECT receiver_id FROM connections WHERE requester_id = %s
               UNION
               SELECT requester_id FROM connections WHERE receiver_id = %s
           ) LIMIT 6""",
        (uid, uid, uid)
    )
    return jsonify({"suggestions": suggestions})


@app.route("/api/skills/endorse", methods=["POST"])
@require_auth
def endorse_skill():
    uid = str(request.current_user["id"])
    data = request.get_json(force=True) or {}
    recipient_id = data.get("recipient_id")
    skill_name = (data.get("skill_name") or "").strip()

    if not recipient_id or not skill_name or recipient_id == uid:
        return jsonify({"detail": "Recipient ID and skill name are required"}), 400

    existing = db_one(
        "SELECT id FROM skill_endorsements WHERE endorser_id=%s AND recipient_id=%s AND skill_name=%s",
        (uid, recipient_id, skill_name)
    )
    if existing:
        return jsonify({"detail": "You have already endorsed this skill"}), 400

    eid = "end_" + str(uuid.uuid4())[:8]
    db_run("INSERT INTO skill_endorsements (id, endorser_id, recipient_id, skill_name) VALUES (%s,%s,%s,%s)",
           (eid, uid, recipient_id, skill_name))

    # Award +5 HU Coins to both endorser and recipient
    for user_id, role in [(uid, "ENDORSING_COLLEAGUE"), (recipient_id, "SKILL_RECIPIENT")]:
        row = db_one("SELECT hu_coins FROM users WHERE id=%s", (user_id,))
        cur_coins = row["hu_coins"] if row and row.get("hu_coins") is not None else 500
        new_c = cur_coins + 5
        db_run("UPDATE users SET hu_coins=%s, coins=%s WHERE id=%s", (new_c, new_c, user_id))
        db_run("""INSERT INTO wallet_ledger 
                  (id, user_id, credit_debit, value_type, amount, source_type, source_id, idempotency_key, balance_before, balance_after, status)
                  VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)""",
               ("led_" + str(uuid.uuid4())[:8], user_id, "CREDIT", "HU Coins", 5, "SKILL_ENDORSEMENT_REWARD", eid, f"end_{eid}_{user_id}", cur_coins, new_c, "Settled"))

    actor_name = request.current_user.get("name", "Someone")
    create_notification(recipient_id, uid, "endorsement", message=f"{actor_name} endorsed your skill in '{skill_name}'.")

    return jsonify({"message": f"Endorsed {skill_name}! Earned +5 HU Coins", "endorsement_id": eid})


@app.route("/api/skills/<user_id>", methods=["GET"])
def get_user_skills_endorsements(user_id):
    endorsements = db_all(
        """SELECT skill_name, COUNT(*) as endorsement_count 
           FROM skill_endorsements WHERE recipient_id=%s GROUP BY skill_name ORDER BY endorsement_count DESC""",
        (user_id,)
    )
    return jsonify({"skills": endorsements})


@app.route("/api/posts/<post_id>/react", methods=["POST"])
@require_auth
def react_to_post(post_id):
    uid = str(request.current_user["id"])
    data = request.get_json(force=True) or {}
    reaction_type = data.get("reaction_type", "like").lower()

    valid_reactions = {"like", "celebrate", "support", "insightful", "mindblowing"}
    if reaction_type not in valid_reactions:
        reaction_type = "like"

    post = db_one("SELECT * FROM posts WHERE id=%s", (post_id,))
    if not post:
        return jsonify({"detail": "Post not found"}), 404

    existing = db_one("SELECT * FROM post_reactions WHERE post_id=%s AND user_id=%s", (post_id, uid))
    
    if existing and existing["reaction_type"] == reaction_type:
        # Toggle off
        db_run("DELETE FROM post_reactions WHERE id=%s", (existing["id"],))
        user_reaction = None
    elif existing:
        # Change reaction type
        db_run("UPDATE post_reactions SET reaction_type=%s WHERE id=%s", (reaction_type, existing["id"]))
        user_reaction = reaction_type
    else:
        # Insert new reaction
        rid = "rx_" + str(uuid.uuid4())[:8]
        db_run("INSERT INTO post_reactions (id, post_id, user_id, reaction_type) VALUES (%s,%s,%s,%s)",
               (rid, post_id, uid, reaction_type))
        user_reaction = reaction_type

        # Reward author +5 HU Coins for insightful / celebrate / support reactions
        if reaction_type in {"insightful", "celebrate", "support"} and post["user_id"] != uid:
            author_row = db_one("SELECT hu_coins FROM users WHERE id=%s", (post["user_id"],))
            cur_coins = author_row["hu_coins"] if author_row and author_row.get("hu_coins") is not None else 500
            new_c = cur_coins + 5
            db_run("UPDATE users SET hu_coins=%s, coins=%s WHERE id=%s", (new_c, new_c, post["user_id"]))
            actor_name = request.current_user.get("name", "Someone")
            create_notification(post["user_id"], uid, "reaction", post_id, message=f"{actor_name} reacted '{reaction_type}' to your post!")

    # Calculate reaction breakdown counts
    counts = db_all(
        "SELECT reaction_type, COUNT(*) as cnt FROM post_reactions WHERE post_id=%s GROUP BY reaction_type",
        (post_id,)
    )
    breakdown = {r: 0 for r in valid_reactions}
    total_cnt = 0
    for r in counts:
        breakdown[r["reaction_type"]] = r["cnt"]
        total_cnt += r["cnt"]

    # Also update posts.likes count for backwards compatibility
    db_run("UPDATE posts SET likes=%s WHERE id=%s", (total_cnt, post_id))

    return jsonify({"total_reactions": total_cnt, "reactions_breakdown": breakdown, "my_reaction": user_reaction})


@app.route("/api/profile/experience", methods=["POST"])
@require_auth
def add_user_experience():
    uid = str(request.current_user["id"])
    data = request.get_json(force=True) or {}
    title = (data.get("title") or "").strip()
    company = (data.get("company") or "").strip()
    if not title or not company:
        return jsonify({"detail": "Job title and company name are required"}), 400

    exp_id = "exp_" + str(uuid.uuid4())[:8]
    db_run("""INSERT INTO user_experiences (id, user_id, title, company, location, start_date, end_date, description)
              VALUES (%s,%s,%s,%s,%s,%s,%s,%s)""",
           (exp_id, uid, title, company, data.get("location", ""), data.get("start_date", ""), data.get("end_date", "Present"), data.get("description", "")))

    return jsonify({"message": "Experience added to profile", "experience_id": exp_id})


@app.route("/api/profile/experience/<user_id>", methods=["GET"])
def get_user_experiences(user_id):
    experiences = db_all("SELECT * FROM user_experiences WHERE user_id=%s ORDER BY created_at DESC", (user_id,))
    return jsonify({"experiences": experiences})


# ─── DISCOVERY HUB & MUTUAL CONNECTIONS APIS ─────────────────────────────────

@app.route("/api/connections/mutual/<target_user_id>", methods=["GET"])
@require_auth
def get_mutual_connections(target_user_id):
    uid = str(request.current_user["id"])
    if uid == target_user_id:
        return jsonify({"mutual_connections": [], "count": 0})

    # Fetch 1st degree connections of logged-in user
    user_conns = db_all(
        """SELECT CASE WHEN requester_id=%s THEN receiver_id ELSE requester_id END as cid 
           FROM connections WHERE (requester_id=%s OR receiver_id=%s) AND status='Accepted'""",
        (uid, uid, uid)
    )
    user_cids = {r["cid"] for r in user_conns}

    # Fetch 1st degree connections of target user
    target_conns = db_all(
        """SELECT CASE WHEN requester_id=%s THEN receiver_id ELSE requester_id END as cid 
           FROM connections WHERE (requester_id=%s OR receiver_id=%s) AND status='Accepted'""",
        (target_user_id, target_user_id, target_user_id)
    )
    target_cids = {r["cid"] for r in target_conns}

    mutual_ids = list(user_cids.intersection(target_cids))
    if not mutual_ids:
        return jsonify({"mutual_connections": [], "count": 0})

    placeholders = ",".join(["%s"] * len(mutual_ids))
    mutual_users = db_all(
        f"SELECT id, name, specialty, hospital, avatar_url, role FROM users WHERE id IN ({placeholders})",
        tuple(mutual_ids)
    )

    return jsonify({"mutual_connections": mutual_users, "count": len(mutual_users)})


@app.route("/api/explore/hub", methods=["GET"])
def get_explore_hub():
    # Attempt to extract current user if auth token provided
    current_uid = None
    auth_hdr = request.headers.get("Authorization")
    if auth_hdr and auth_hdr.startswith("Bearer "):
        token = auth_hdr.split(" ")[1]
        payload = decode_token(token)
        if payload and "sub" in payload:
            current_uid = str(payload["sub"])

    # 1. People You May Know (Smart Recommendation Engine)
    if current_uid:
        raw_users = db_all(
            "SELECT id, name, email, role, specialty, hospital, avatar_url, is_verified FROM users WHERE id != %s LIMIT 8",
            (current_uid,)
        )
    else:
        raw_users = db_all(
            "SELECT id, name, email, role, specialty, hospital, avatar_url, is_verified FROM users LIMIT 8"
        )

    people_you_may_know = []
    sample_reasons = [
        "Works at Apollo Hospitals",
        "Same specialization in Cardiology",
        "Studied at AIIMS New Delhi",
        "5 mutual connections",
        "People with similar skills in Surgery",
        "Top contributor in Gut Health"
    ]

    for idx, u in enumerate(raw_users):
        u_id = u["id"]
        reason = sample_reasons[idx % len(sample_reasons)]
        
        # Calculate real mutual connections if user logged in
        mutual_cnt = 0
        conn_status = "Connect"
        if current_uid:
            conn_row = db_one(
                "SELECT * FROM connections WHERE (requester_id=%s AND receiver_id=%s) OR (requester_id=%s AND receiver_id=%s)",
                (current_uid, u_id, u_id, current_uid)
            )
            if conn_row:
                if conn_row["status"] == "Accepted":
                    conn_status = "Connected"
                elif conn_row["requester_id"] == current_uid:
                    conn_status = "Pending"
                else:
                    conn_status = "Respond"

            # Mutual count query
            c1 = db_all("SELECT CASE WHEN requester_id=%s THEN receiver_id ELSE requester_id END as cid FROM connections WHERE (requester_id=%s OR receiver_id=%s) AND status='Accepted'", (current_uid, current_uid, current_uid))
            c2 = db_all("SELECT CASE WHEN requester_id=%s THEN receiver_id ELSE requester_id END as cid FROM connections WHERE (requester_id=%s OR receiver_id=%s) AND status='Accepted'", (u_id, u_id, u_id))
            s1 = {r["cid"] for r in c1}
            s2 = {r["cid"] for r in c2}
            mutual_cnt = len(s1.intersection(s2))

        people_you_may_know.append({
            "id": u["id"],
            "name": u["name"],
            "role": u["role"],
            "specialty": u.get("specialty") or "Healthcare Professional",
            "hospital": u.get("hospital") or "Medical Center",
            "location": "Delhi, India",
            "avatar_url": u.get("avatar_url"),
            "is_verified": bool(u.get("is_verified", 0)),
            "recommendation_reason": reason,
            "mutual_count": mutual_cnt or (idx * 3 + 2),
            "connection_status": conn_status,
            "skills": ["Cardiology", "Clinical Research", "Ayurvedic Therapeutics"]
        })

    # 2. Trending Professionals (Ranked Doctors)
    docs = db_all("SELECT * FROM doctors ORDER BY reviews_count DESC LIMIT 6")
    trending_professionals = []
    for d in docs:
        trending_professionals.append({
            "id": d["id"],
            "user_id": d.get("user_id"),
            "name": d["name"],
            "specialty": d["specialty"],
            "qualification": d.get("qualification"),
            "hospital": d.get("hospital"),
            "rating": d.get("rating", 4.9),
            "reviews_count": d.get("reviews_count", 120),
            "avatar": d.get("avatar")
        })

    # 3. Trending Posts & Case Studies
    posts = db_all("SELECT p.*, u.name as author_name, u.avatar_url as author_avatar FROM posts p JOIN users u ON p.user_id=u.id ORDER BY p.created_at DESC LIMIT 4")

    # 4. Communities
    communities = [
        {"id": "comm_1", "name": "Cardiology Professionals Network", "category": "Cardiology", "member_count": 42500, "mutual_members": 3, "description": "Global hub for cardiologists, cardiac surgeons, and cardiovascular researchers."},
        {"id": "comm_2", "name": "Medical Students & Residents India", "category": "Education", "member_count": 85200, "mutual_members": 8, "description": "Community for MBBS students, PG aspirants, and clinical resident doctors."},
        {"id": "comm_3", "name": "Healthcare AI & Digital Diagnostics", "category": "Technology", "member_count": 27400, "mutual_members": 5, "description": "Exploring machine learning in radiology, ECG analysis, and predictive triage."},
        {"id": "comm_4", "name": "Clinical Nutrition & Metabolic Health", "category": "Nutrition", "member_count": 31900, "mutual_members": 4, "description": "Therapeutic nutrition, gut microbiome science, and metabolic syndrome recovery."}
    ]

    # 5. Organizations & Companies
    companies = [
        {"id": "comp_1", "name": "Apollo Hospitals", "industry": "Healthcare & Hospitals", "location": "New Delhi, India", "followers": 142000, "employees": 12000, "open_jobs": 14},
        {"id": "comp_2", "name": "AIIMS New Delhi", "industry": "Medical Research & Education", "location": "New Delhi, India", "followers": 210000, "employees": 8500, "open_jobs": 8},
        {"id": "comp_3", "name": "Fortis Healthcare", "industry": "Hospital Network", "location": "Gurugram, India", "followers": 98000, "employees": 6400, "open_jobs": 11},
        {"id": "comp_4", "name": "Tata 1mg", "industry": "Digital Health & E-Commerce", "location": "Gurugram, India", "followers": 175000, "employees": 3200, "open_jobs": 19}
    ]

    # 6. Jobs You May Like
    jobs = db_all("SELECT * FROM jobs ORDER BY created_at DESC LIMIT 4")
    jobs_you_may_like = []
    for j in jobs:
        jobs_you_may_like.append({
            "id": j["id"],
            "title": j["title"],
            "hospital": j.get("company") or "Medical Center",
            "location": j.get("location") or "Remote / Hybrid",
            "salary": j.get("salary_range") or "₹8,00,000 - ₹14,00,000 / yr",
            "type": j.get("job_type") or "Full-Time",
            "mutual_connections_working": 3
        })

    # 7. CME Events & Webinars
    events = [
        {"id": "ev_1", "title": "AI Diagnostics Summit 2026", "organizer": "Global Health AI Society", "date_time": "Sept 15, 2026 · 4:00 PM UTC", "cme_credits": 3.5, "reward_coins": 25, "attendees": 420, "mutual_attending": 8},
        {"id": "ev_2", "title": "World Preventive Cardiology Expo", "organizer": "International Cardiac Association", "date_time": "Oct 02, 2026 · Virtual & Hybrid", "cme_credits": 5.0, "reward_coins": 25, "attendees": 850, "mutual_attending": 12}
    ]

    # 8. Trending Skills
    trending_skills = [
        {"id": "sk_1", "name": "Artificial Intelligence in Medicine", "category": "Tech", "followers": 48200},
        {"id": "sk_2", "name": "Interventional Cardiology", "category": "Clinical", "followers": 32100},
        {"id": "sk_3", "name": "Gut Microbiome Modulation", "category": "Research", "followers": 29400},
        {"id": "sk_4", "name": "Telemedicine & Digital Triage", "category": "Practice", "followers": 41500},
        {"id": "sk_5", "name": "Clinical Nutrition", "category": "Wellness", "followers": 38900}
    ]

    return jsonify({
        "people_you_may_know": people_you_may_know,
        "trending_professionals": trending_professionals,
        "trending_posts": posts,
        "communities": communities,
        "companies": companies,
        "jobs_you_may_like": jobs_you_may_like,
        "upcoming_events": events,
        "trending_skills": trending_skills
    })


@app.route("/api/search/advanced", methods=["GET"])
def search_advanced():
    query = (request.args.get("q") or "").strip()
    search_type = (request.args.get("type") or "all").lower()

    if not query or len(query) < 2:
        return jsonify({"results": {}})

    q_pattern = f"%{query}%"

    res_people = db_all("SELECT id, name, role, specialty, hospital, avatar_url, is_verified FROM users WHERE name LIKE %s OR specialty LIKE %s OR hospital LIKE %s LIMIT 10", (q_pattern, q_pattern, q_pattern))
    res_posts = db_all("SELECT p.*, u.name as author_name FROM posts p JOIN users u ON p.user_id=u.id WHERE p.content LIKE %s OR p.category LIKE %s LIMIT 10", (q_pattern, q_pattern))
    res_jobs = db_all("SELECT * FROM jobs WHERE title LIKE %s OR company LIKE %s LIMIT 10", (q_pattern, q_pattern))
    res_prods = db_all("SELECT * FROM products WHERE name LIKE %s OR description LIKE %s LIMIT 10", (q_pattern, q_pattern))

    return jsonify({
        "query": query,
        "results": {
            "people": res_people,
            "posts": res_posts,
            "jobs": res_jobs,
            "products": res_prods
        }
    })


@app.route("/api/events/<event_id>/attend", methods=["POST"])
@require_auth
def attend_event(event_id):
    uid = str(request.current_user["id"])
    
    # Award +25 HU Coins for registering for CME Event
    user_row = db_one("SELECT hu_coins FROM users WHERE id=%s", (uid,))
    cur_coins = user_row["hu_coins"] if user_row and user_row.get("hu_coins") is not None else 500
    new_coins = cur_coins + 25
    db_run("UPDATE users SET hu_coins=%s, coins=%s WHERE id=%s", (new_coins, new_coins, uid))

    # Log double-entry ledger
    db_run("""INSERT INTO wallet_ledger 
              (id, user_id, credit_debit, value_type, amount, source_type, source_id, idempotency_key, balance_before, balance_after, status)
              VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)""",
           ("led_" + str(uuid.uuid4())[:8], uid, "CREDIT", "HU Coins", 25, "CME_EVENT_REGISTRATION", event_id, f"evt_{event_id}_{uid}", cur_coins, new_coins, "Settled"))

    return jsonify({"message": "Successfully registered for event! Earned +25 HU Coins", "new_hu_coins": new_coins})





try:
    from services.hardened_rewards import install_hardened_rewards
except ImportError:
    from backend.services.hardened_rewards import install_hardened_rewards

install_hardened_rewards(globals())


# ─── RUN ───────────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    print("\n" + "="*50)
    print("  [HEALTHY UNIVERSE API]  v2.1  ")
    print("="*50)
    try:
        init_db()
        port  = int(os.getenv("PORT", 8000))
        debug = False
        print(f"[API SERVER] Running on http://localhost:{port}")
        print(f"[DEBUG MODE] OFF")
        print("="*50 + "\n")
        socketio.run(app, host="0.0.0.0", port=port, debug=False, use_reloader=False, allow_unsafe_werkzeug=True)

    except Exception as e:
        print(f"\n[ERROR] Startup failed: {e}\n")
