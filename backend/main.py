# import eventlet
# eventlet.monkey_patch()
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from datetime import datetime, timedelta, timezone
from functools import wraps
from dotenv import load_dotenv
import json as _json
import os, uuid, bcrypt, jwt, psycopg2, psycopg2.extras, random, requests
from flask_socketio import SocketIO, emit, join_room

load_dotenv()

# ─── CONFIG ────────────────────────────────────────────────────────────────────
SECRET_KEY        = os.getenv("SECRET_KEY", "hu-super-secret-key-change-in-prod-2024")

# ─── ADMIN CONFIG — put the 2 admin emails here ────────────────────────────────
ADMIN_EMAILS = {
    "vanshikarai4040@gmail.com",
    "kshitizsrivastava90@gmail.com",
}

TOKEN_EXPIRE_DAYS = int(os.getenv("TOKEN_EXPIRE_DAYS", 1))
UPLOAD_DIR        = os.path.join(os.path.dirname(__file__), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    ""
)

# ─── EMAIL (EmailJS REST API) CONFIG — for OTP / forgot password ──────────────
EMAILJS_SERVICE_ID  = os.getenv("EMAILJS_SERVICE_ID", "")
EMAILJS_TEMPLATE_ID = os.getenv("EMAILJS_TEMPLATE_ID", "")
EMAILJS_PUBLIC_KEY  = os.getenv("EMAILJS_PUBLIC_KEY", "")
EMAILJS_PRIVATE_KEY = os.getenv("EMAILJS_PRIVATE_KEY", "")
OTP_EXPIRE_MINUTES  = int(os.getenv("OTP_EXPIRE_MINUTES", 10))
MAX_OTP_ATTEMPTS    = 5

# ─── AD REWARDS CONFIG — HU Coins for viewing/clicking ads ────────────────────
COIN_REWARD_PER_IMPRESSION = int(os.getenv("COIN_REWARD_PER_IMPRESSION", 1))
COIN_REWARD_PER_CLICK      = int(os.getenv("COIN_REWARD_PER_CLICK", 5))
COST_PER_IMPRESSION        = float(os.getenv("COST_PER_IMPRESSION", 0.01))

ALLOWED_IMAGES = {"image/jpeg","image/png","image/gif","image/webp"}
ALLOWED_VIDEOS = {"video/mp4","video/webm","video/quicktime"}
ALLOWED_AUDIO = {"audio/webm","audio/mp4","audio/mpeg","audio/ogg","audio/wav"}
MAX_FILE_BYTES = 50 * 1024 * 1024

# ─── APP ───────────────────────────────────────────────────────────────────────
app = Flask(__name__)
CORS(app, origins=os.getenv("ALLOWED_ORIGINS","*").split(","))

socketio = SocketIO(app, cors_allowed_origins=os.getenv("ALLOWED_ORIGINS","*").split(","), async_mode="threading")

online_users = {}
sid_to_user  = {}

# ─── DB HELPERS ────────────────────────────────────────────────────────────────
def get_db():
    return psycopg2.connect(DATABASE_URL, cursor_factory=psycopg2.extras.RealDictCursor)

def db_one(sql, params=()):
    conn = get_db()
    try:
        with conn.cursor() as cur:
            cur.execute(sql, params)
            return cur.fetchone()
    finally:
        conn.close()

def db_all(sql, params=()):
    conn = get_db()
    try:
        with conn.cursor() as cur:
            cur.execute(sql, params)
            return cur.fetchall()
    finally:
        conn.close()

def db_run(sql, params=()):
    conn = get_db()
    try:
        with conn.cursor() as cur:
            cur.execute(sql, params)
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()

def safe_user(u) -> dict:
    if not u: return {}
    u = dict(u)
    u.pop("password", None)
    for k, v in u.items():
        if isinstance(v, datetime):
            u[k] = v.isoformat()
    return u

def post_with_author(post) -> dict:
    if not post: return {}
    post = dict(post)
    for k, v in post.items():
        if isinstance(v, datetime): post[k] = v.isoformat()
    a = db_one("SELECT id,name,specialty,avatar_url,is_verified FROM users WHERE id=%s",
               (post.get("user_id"),)) or {}
    post["author"] = {
        "id":        str(a.get("id","")),
        "name":      a.get("name","Unknown"),
        "specialty": a.get("specialty",""),
        "avatar":    a.get("avatar_url",""),
        "verified":  bool(a.get("is_verified", False)),
    }
    return post

# ─── JWT ───────────────────────────────────────────────────────────────────────
def make_token(user_id: str) -> str:
    payload = {
        "sub": str(user_id),
        "exp": datetime.now(timezone.utc) + timedelta(days=TOKEN_EXPIRE_DAYS),
        "iat": datetime.now(timezone.utc),
    }
    return jwt.encode(payload, SECRET_KEY, algorithm="HS256")

def decode_token(token: str):
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=["HS256"]).get("sub")
    except Exception:
        return None

def require_auth(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        auth  = request.headers.get("Authorization", "")
        token = auth[7:] if auth.startswith("Bearer ") else None
        if not token:
            return jsonify({"error": "Authentication required"}), 401
        uid = decode_token(token)
        if not uid:
            return jsonify({"error": "Invalid or expired token. Please log in again."}), 401
        user = db_one("SELECT * FROM users WHERE id=%s", (uid,))
        if not user:
            return jsonify({"error": "User not found"}), 401
        request.current_user = user
        return f(*args, **kwargs)
    return decorated


def require_admin(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        auth  = request.headers.get("Authorization", "")
        token = auth[7:] if auth.startswith("Bearer ") else None
        if not token:
            return jsonify({"error": "Authentication required"}), 401
        uid = decode_token(token)
        if not uid:
            return jsonify({"error": "Invalid or expired token"}), 401
        user = db_one("SELECT * FROM users WHERE id=%s", (uid,))
        if not user:
            return jsonify({"error": "User not found"}), 401
        if user["email"].lower() not in {e.lower() for e in ADMIN_EMAILS if e}:
            return jsonify({"detail": "Admin access required"}), 403
        request.current_user = user
        return f(*args, **kwargs)
    return decorated


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
    conn = get_db()
    try:
        with conn.cursor() as cur:
            cur.execute("""
                CREATE TABLE IF NOT EXISTS users (
                    id          VARCHAR(36)   NOT NULL PRIMARY KEY,
                    name        VARCHAR(120)  NOT NULL,
                    email       VARCHAR(180)  NOT NULL UNIQUE,
                    password    VARCHAR(255)  NOT NULL,
                    specialty   VARCHAR(100)  DEFAULT 'General User',
                    hospital    VARCHAR(150)  DEFAULT '',
                    bio         TEXT,
                    avatar_url  VARCHAR(500)  DEFAULT '',
                    is_verified BOOLEAN       DEFAULT FALSE,
                    balance     NUMERIC(10,2) DEFAULT 0.00,
                    hu_coins    INT           DEFAULT 500,
                    created_at  TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
                    updated_at  TIMESTAMP     DEFAULT CURRENT_TIMESTAMP
                );
            """)
            cur.execute("""
                CREATE TABLE IF NOT EXISTS posts (
                    id          VARCHAR(36)   NOT NULL PRIMARY KEY,
                    user_id     VARCHAR(36)   NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                    content     TEXT          NOT NULL,
                    media_url   VARCHAR(500)  DEFAULT '',
                    media_type  VARCHAR(20)   DEFAULT '',
                    category    VARCHAR(80)   DEFAULT 'General Wellness',
                    likes       INT           DEFAULT 0,
                    views       INT           DEFAULT 0,
                    revenue     NUMERIC(10,2) DEFAULT 0.00,
                    created_at  TIMESTAMP     DEFAULT CURRENT_TIMESTAMP
                );
            """)

            # ── ADS ENGINE TABLES ──────────────────────────────────────────
            cur.execute("""
                CREATE TABLE IF NOT EXISTS ad_campaigns (
                    id               VARCHAR(36)   NOT NULL PRIMARY KEY,
                    user_id          VARCHAR(36)   NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                    name             VARCHAR(150)  NOT NULL,
                    objective        VARCHAR(40)   DEFAULT 'awareness',
                    status           VARCHAR(20)   DEFAULT 'active',
                    budget           NUMERIC(10,2) NOT NULL DEFAULT 0,
                    spent            NUMERIC(10,2) NOT NULL DEFAULT 0,
                    bid_amount       NUMERIC(10,2) NOT NULL DEFAULT 2.00,
                    target_specialty VARCHAR(100)  DEFAULT 'All',
                    target_location  VARCHAR(100)  DEFAULT 'All',
                    start_date       DATE          DEFAULT CURRENT_DATE,
                    end_date         DATE,
                    created_at       TIMESTAMP     DEFAULT CURRENT_TIMESTAMP
                );
            """)
            cur.execute("""
                CREATE TABLE IF NOT EXISTS ad_creatives (
                    id          VARCHAR(36)  NOT NULL PRIMARY KEY,
                    campaign_id VARCHAR(36)  NOT NULL REFERENCES ad_campaigns(id) ON DELETE CASCADE,
                    headline    VARCHAR(150) NOT NULL,
                    body_text   TEXT         DEFAULT '',
                    image_url   VARCHAR(500) DEFAULT '',
                    cta_text    VARCHAR(40)  DEFAULT 'Learn More',
                    cta_link    VARCHAR(500) DEFAULT '',
                    created_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
                );
            """)
            cur.execute("""
                CREATE TABLE IF NOT EXISTS ad_impressions (
                    id          VARCHAR(36) NOT NULL PRIMARY KEY,
                    campaign_id VARCHAR(36) NOT NULL REFERENCES ad_campaigns(id) ON DELETE CASCADE,
                    creative_id VARCHAR(36) NOT NULL,
                    user_id     VARCHAR(36),
                    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
            """)
            cur.execute("""
                CREATE TABLE IF NOT EXISTS ad_clicks (
                    id          VARCHAR(36) NOT NULL PRIMARY KEY,
                    campaign_id VARCHAR(36) NOT NULL REFERENCES ad_campaigns(id) ON DELETE CASCADE,
                    creative_id VARCHAR(36) NOT NULL,
                    user_id     VARCHAR(36),
                    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
            """)
            # ── MESSAGING TABLES ────────────────────────────────────────────
            cur.execute("""
                CREATE TABLE IF NOT EXISTS conversations (
                    id          VARCHAR(36) NOT NULL PRIMARY KEY,
                    user_a_id   VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                    user_b_id   VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    UNIQUE (user_a_id, user_b_id)
                );
            """)
            cur.execute("""
                CREATE TABLE IF NOT EXISTS messages (
                    id              VARCHAR(36) NOT NULL PRIMARY KEY,
                    conversation_id VARCHAR(36) NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
                    sender_id       VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                    content         TEXT NOT NULL,
                    read_at         TIMESTAMP,
                    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
            """)

            cur.execute("ALTER TABLE messages ADD COLUMN IF NOT EXISTS media_url VARCHAR(500) DEFAULT '';")
            cur.execute("ALTER TABLE messages ADD COLUMN IF NOT EXISTS media_type VARCHAR(20) DEFAULT '';")
            cur.execute("ALTER TABLE messages ADD COLUMN IF NOT EXISTS reply_to_id VARCHAR(36) DEFAULT NULL;")
            cur.execute("ALTER TABLE messages ADD COLUMN IF NOT EXISTS edited_at TIMESTAMP DEFAULT NULL;")
            cur.execute("ALTER TABLE messages ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE;")
            cur.execute("""
                CREATE TABLE IF NOT EXISTS pinned_conversations (
                    id              VARCHAR(36) NOT NULL PRIMARY KEY,
                    user_id         VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                    conversation_id VARCHAR(36) NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
                    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    UNIQUE (user_id, conversation_id)
                );
            """)
            cur.execute("""
                CREATE TABLE IF NOT EXISTS blocked_users (
                    id          VARCHAR(36) NOT NULL PRIMARY KEY,
                    blocker_id  VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                    blocked_id  VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    UNIQUE (blocker_id, blocked_id)
                );
            """)
            cur.execute("CREATE INDEX IF NOT EXISTS idx_messages_conv_created ON messages(conversation_id, created_at);")

            cur.execute("ALTER TABLE users ADD COLUMN IF NOT EXISTS is_banned BOOLEAN DEFAULT FALSE;")
            cur.execute("""
                CREATE TABLE IF NOT EXISTS reports (
                    id          VARCHAR(36) NOT NULL PRIMARY KEY,
                    reporter_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                    target_type VARCHAR(20) NOT NULL,
                    target_id   VARCHAR(36) NOT NULL,
                    reason      TEXT DEFAULT '',
                    status      VARCHAR(20) DEFAULT 'pending',
                    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
            """)
            cur.execute("""
                CREATE TABLE IF NOT EXISTS trending_topics (
                    id          VARCHAR(36) NOT NULL PRIMARY KEY,
                    hashtag     VARCHAR(100) NOT NULL,
                    post_count  VARCHAR(20) DEFAULT '0',
                    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
            """)

            # ── NEW: PASSWORD RESET / OTP TABLE ─────────────────────────────
            cur.execute("""
                CREATE TABLE IF NOT EXISTS password_resets (
                    id          VARCHAR(36) NOT NULL PRIMARY KEY,
                    user_id     VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                    otp_code    VARCHAR(10) NOT NULL,
                    attempts    INT NOT NULL DEFAULT 0,
                    is_used     BOOLEAN NOT NULL DEFAULT FALSE,
                    expires_at  TIMESTAMP NOT NULL,
                    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
            """)
            cur.execute("CREATE INDEX IF NOT EXISTS idx_password_resets_user ON password_resets(user_id, is_used);")

            cur.execute("""
                CREATE TABLE IF NOT EXISTS jobs (
                    id            VARCHAR(36)  NOT NULL PRIMARY KEY,
                    title         VARCHAR(150) NOT NULL,
                    company       VARCHAR(150) NOT NULL,
                    company_logo  VARCHAR(500) DEFAULT '',
                    location      VARCHAR(100) DEFAULT 'Remote',
                    job_type      VARCHAR(30)  DEFAULT 'Full-Time',
                    specialty     VARCHAR(100) DEFAULT 'General Physician',
                    salary        VARCHAR(60)  DEFAULT '',
                    experience    VARCHAR(60)  DEFAULT '',
                    deadline      VARCHAR(60)  DEFAULT '',
                    applicants    INT          DEFAULT 0,
                    tags          JSONB        DEFAULT '[]',
                    description   TEXT         DEFAULT '',
                    featured      BOOLEAN      DEFAULT FALSE,
                    is_active     BOOLEAN      DEFAULT TRUE,
                    created_at    TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
                );
            """)
            cur.execute("ALTER TABLE jobs ADD COLUMN IF NOT EXISTS added_by VARCHAR(36) REFERENCES users(id) ON DELETE SET NULL;")
            cur.execute("""
                CREATE TABLE IF NOT EXISTS doctors (
                    id            VARCHAR(36)  NOT NULL PRIMARY KEY,
                    name          VARCHAR(150) NOT NULL,
                    specialty     VARCHAR(100) NOT NULL,
                    hospital      VARCHAR(150) DEFAULT '',
                    avatar_url    VARCHAR(500) DEFAULT '',
                    verified      BOOLEAN      DEFAULT TRUE,
                    rating        NUMERIC(2,1) DEFAULT 4.8,
                    reviews       INT          DEFAULT 0,
                    experience    INT          DEFAULT 0,
                    consultations INT          DEFAULT 0,
                    status        VARCHAR(20)  DEFAULT 'online',
                    price         NUMERIC(10,2) DEFAULT 0,
                    coins         INT          DEFAULT 0,
                    tags          JSONB        DEFAULT '[]',
                    next_slot     VARCHAR(60)  DEFAULT 'Available Now',
                    is_active     BOOLEAN      DEFAULT TRUE,
                    created_at    TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
                );
            """)
            # ── END NEW TABLES ───────────────────────────────────────────────

        conn.commit()
        print("✅ PostgreSQL tables ready")
    finally:
        conn.close()

# ─── STARTUP ───────────────────────────────────────────────────────────────────
with app.app_context():
    try:
        init_db()
        print("✅ DB initialized on startup")
    except Exception as e:
        print(f"⚠️ DB init error: {e}")

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
        "version":   "2.0.0"
    })

# ══════════════════════════════════════════════════════════════════════════════
#  AUTH ROUTES
# ══════════════════════════════════════════════════════════════════════════════

@app.route("/api/auth/signup", methods=["POST"])
def signup():
    data      = request.get_json(force=True) or {}
    name      = (data.get("name")      or "").strip()
    email     = (data.get("email")     or "").strip().lower()
    password  =  data.get("password")  or ""
    specialty =  data.get("specialty") or "General User"
    hospital  =  data.get("hospital")  or ""

    if not name:
        return jsonify({"detail": "Full name is required"}), 400
    if not email or "@" not in email:
        return jsonify({"detail": "Valid email address is required"}), 400
    if len(password) < 6:
        return jsonify({"detail": "Password must be at least 6 characters"}), 400

    if db_one("SELECT id FROM users WHERE email=%s", (email,)):
        return jsonify({"detail": "This email is already registered. Please log in."}), 400

    uid    = str(uuid.uuid4())
    hashed = bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()

    db_run(
        """INSERT INTO users (id, name, email, password, specialty, hospital)
           VALUES (%s, %s, %s, %s, %s, %s)""",
        (uid, name, email, hashed, specialty, hospital)
    )

    user  = safe_user(db_one("SELECT * FROM users WHERE id=%s", (uid,)))
    token = make_token(uid)
    return jsonify({
        "access_token": token,
        "token_type":   "bearer",
        "user":         user,
        "message":      f"Welcome to Healthy Universe, {name}! 🎉"
    }), 201


@app.route("/api/auth/login", methods=["POST"])
def login():
    data     = request.get_json(force=True, silent=True) or {}
    email    = (data.get("email") or data.get("username") or "").strip().lower()
    password =  data.get("password") or ""

    if not email or not password:
        return jsonify({"detail": "Email and password are required"}), 400

    user = db_one("SELECT * FROM users WHERE email=%s", (email,))
    if not user:
        return jsonify({"detail": "No account found with this email. Please sign up."}), 401
    if not bcrypt.checkpw(password.encode(), user["password"].encode()):
        return jsonify({"detail": "Incorrect password. Please try again."}), 401

    if user.get("is_banned"):
        return jsonify({"detail": "Your account has been suspended. Contact support."}), 403

    u     = safe_user(user)
    token = make_token(u["id"])
    return jsonify({
        "access_token": token,
        "token_type":   "bearer",
        "user":         u,
        "message":      f"Welcome back, {u['name']}! 👋"
    })


@app.route("/api/auth/me")
@require_auth
def get_me():
    return jsonify(safe_user(request.current_user))


@app.route("/api/auth/update", methods=["PUT"])
@require_auth
def update_profile():
    data      = request.get_json(force=True) or {}
    uid       = str(request.current_user["id"])
    name      = (data.get("name") or "").strip()
    specialty =  data.get("specialty") or request.current_user.get("specialty","")
    hospital  =  data.get("hospital")  or ""
    bio       =  data.get("bio")       or ""

    if not name:
        return jsonify({"detail": "Name cannot be empty"}), 400

    db_run(
        "UPDATE users SET name=%s, specialty=%s, hospital=%s, bio=%s WHERE id=%s",
        (name, specialty, hospital, bio, uid)
    )
    user = safe_user(db_one("SELECT * FROM users WHERE id=%s", (uid,)))
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
    return jsonify({"message": "Password changed successfully 🔐"})


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
    # Always return a generic success message even if the email isn't registered —
    # this avoids leaking which emails have accounts.
    generic_response = {"message": "If that email is registered, a verification code has been sent."}

    if not user:
        return jsonify(generic_response)

    # invalidate any previous unused OTPs for this user
    db_run("UPDATE password_resets SET is_used=TRUE WHERE user_id=%s AND is_used=FALSE", (user["id"],))

    otp_code   = generate_otp_code()
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=OTP_EXPIRE_MINUTES)

    db_run(
        "INSERT INTO password_resets (id, user_id, otp_code, expires_at) VALUES (%s,%s,%s,%s)",
        (str(uuid.uuid4()), user["id"], otp_code, expires_at)
    )

    sent = send_otp_email(user["email"], user["name"], otp_code)
    if not sent:
        # Don't reveal server email config issues to the client; log server-side only.
        print(f"⚠️ Could not send OTP email to {user['email']}")

    return jsonify(generic_response)


@app.route("/api/auth/verify-otp", methods=["POST"])
def verify_otp():
    """Step 2: user submits the OTP they received → we confirm it's valid."""
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
    """Step 3: user submits the OTP again + new password → password is updated."""
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

    if not content and not media:
        return jsonify({"detail": "Please add text or media to your post"}), 400

    media_url = ""; media_type = ""
    if media and media.filename:
        ct = media.content_type or ""
        if ct not in (ALLOWED_IMAGES | ALLOWED_VIDEOS):
            return jsonify({"detail": "Only images and videos are allowed"}), 400
        file_bytes = media.read()
        if len(file_bytes) > MAX_FILE_BYTES:
            return jsonify({"detail": "File too large (max 50MB)"}), 400
        ext   = os.path.splitext(media.filename)[1] or ".bin"
        fname = str(uuid.uuid4()) + ext
        with open(os.path.join(UPLOAD_DIR, fname), "wb") as f:
            f.write(file_bytes)
        media_url  = f"/uploads/{fname}"
        media_type = "image" if ct in ALLOWED_IMAGES else "video"

    post_id = str(uuid.uuid4())
    db_run(
        """INSERT INTO posts (id, user_id, content, media_url, media_type, category)
           VALUES (%s, %s, %s, %s, %s, %s)""",
        (post_id, uid, content, media_url, media_type, category)
    )
    post = db_one("SELECT * FROM posts WHERE id=%s", (post_id,))
    return jsonify(post_with_author(post)), 201


@app.route("/api/posts")
def get_posts():
    limit  = min(int(request.args.get("limit",  20)), 100)
    offset = int(request.args.get("offset", 0))
    posts  = db_all(
        "SELECT * FROM posts ORDER BY created_at DESC LIMIT %s OFFSET %s",
        (limit, offset)
    )
    return jsonify([post_with_author(p) for p in posts])


@app.route("/api/posts/mine")
@require_auth
def get_my_posts():
    uid   = str(request.current_user["id"])
    posts = db_all(
        "SELECT * FROM posts WHERE user_id=%s ORDER BY created_at DESC", (uid,)
    )
    return jsonify([post_with_author(p) for p in posts])


@app.route("/api/posts/<post_id>/like", methods=["POST"])
@require_auth
def like_post(post_id):
    if not db_one("SELECT id FROM posts WHERE id=%s", (post_id,)):
        return jsonify({"detail": "Post not found"}), 404
    db_run("UPDATE posts SET likes=likes+1 WHERE id=%s", (post_id,))
    updated = db_one("SELECT likes FROM posts WHERE id=%s", (post_id,))
    return jsonify({"likes": updated["likes"]})


@app.route("/api/posts/<post_id>", methods=["DELETE"])
@require_auth
def delete_post(post_id):
    uid  = str(request.current_user["id"])
    post = db_one("SELECT id,user_id FROM posts WHERE id=%s", (post_id,))
    if not post:
        return jsonify({"detail": "Post not found"}), 404
    if str(post["user_id"]) != uid:
        return jsonify({"detail": "You can only delete your own posts"}), 403
    db_run("DELETE FROM posts WHERE id=%s", (post_id,))
    return jsonify({"message": "Post deleted"})


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
        if ct not in ALLOWED_IMAGES:
            return jsonify({"detail": "Ad creative must be an image (jpg/png/gif/webp)"}), 400
        file_bytes = image.read()
        if len(file_bytes) > MAX_FILE_BYTES:
            return jsonify({"detail": "Image too large (max 50MB)"}), 400
        ext   = os.path.splitext(image.filename)[1] or ".jpg"
        fname = str(uuid.uuid4()) + ext
        with open(os.path.join(UPLOAD_DIR, fname), "wb") as f:
            f.write(file_bytes)
        image_url = f"/uploads/{fname}"

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
    """Pick one eligible active ad to show in the feed."""
    row = db_one(
        """SELECT c.*, cr.id AS creative_id, cr.headline, cr.body_text,
                  cr.image_url, cr.cta_text, cr.cta_link
           FROM ad_campaigns c
           JOIN ad_creatives cr ON cr.campaign_id = c.id
           WHERE c.status = 'active'
             AND c.spent < c.budget
             AND (c.end_date IS NULL OR c.end_date >= CURRENT_DATE)
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
    # Let the frontend know how many coins viewing/clicking this ad will earn,
    # so it can show "+1 HU Coin" style UI before the user even acts.
    row["impression_reward"] = COIN_REWARD_PER_IMPRESSION
    row["click_reward"]      = COIN_REWARD_PER_CLICK
    return jsonify(row)


@app.route("/api/ads/impression", methods=["POST"])
def log_impression():
    """
    Logs an ad view. The FIRST time a given logged-in user sees a given campaign,
    they earn HU Coins and a tiny amount is deducted from the campaign's budget.
    Repeat views by the same user on the same campaign are still logged (for
    accurate impression counts) but do not pay out again, to prevent coin-farming
    by refreshing the feed.
    """
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
    """
    Logs an ad click. The FIRST time a given logged-in user clicks a given
    campaign, they earn HU Coins (on top of impression coins) and the
    campaign's configured bid_amount is deducted from its budget, same as before.
    """
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
        # count clicks by this user on this campaign (including the one we just inserted) —
        # reward only fires the first time.
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
    with open(os.path.join(UPLOAD_DIR, fname), "wb") as f:
        f.write(file_bytes)

    media_type = "image" if ct in ALLOWED_IMAGES else ("video" if ct in ALLOWED_VIDEOS else "audio")
    return jsonify({"media_url": f"/uploads/{fname}", "media_type": media_type})


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
    rows = db_all("SELECT id,name,email,specialty,is_verified,is_banned,balance,hu_coins,created_at FROM users ORDER BY created_at DESC")
    return jsonify([safe_user(r) for r in rows])


@app.route("/api/admin/users/<user_id>/ban", methods=["POST"])
@require_admin
def admin_toggle_ban(user_id):
    user = db_one("SELECT is_banned FROM users WHERE id=%s", (user_id,))
    if not user:
        return jsonify({"detail": "User not found"}), 404
    new_status = not user["is_banned"]
    db_run("UPDATE users SET is_banned=%s WHERE id=%s", (new_status, user_id))
    return jsonify({"is_banned": new_status})


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
    tags = d.get("tags") or []
    if isinstance(tags, str):
        try: tags = _json.loads(tags)
        except Exception: tags = []
    return {
        "id": d["id"], "name": d["name"], "specialty": d["specialty"],
        "hospital": d["hospital"], "avatar": d["avatar_url"], "verified": d["verified"],
        "rating": float(d["rating"]), "reviews": d["reviews"], "experience": d["experience"],
        "consultations": d["consultations"], "status": d["status"], "price": float(d["price"]),
        "coins": d["coins"], "tags": tags, "nextSlot": d["next_slot"],
    }


# ── JOBS ──────────────────────────────────────────────────────────
@app.route("/api/jobs")
def get_jobs():
    rows = db_all("SELECT * FROM jobs WHERE is_active=TRUE ORDER BY created_at DESC")
    return jsonify([job_to_frontend_shape(r) for r in rows])

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


# ── USER-POSTED JOBS (non-admin) ──────────────────────────────────
@app.route("/api/jobs/add", methods=["POST"])
@require_auth
def user_add_job():
    data = request.get_json(force=True) or {}
    title = (data.get("title") or "").strip()
    company = (data.get("company") or "").strip()
    description = (data.get("description") or "").strip()
    if not title or not company:
        return jsonify({"detail": "Job title and hospital/company are required"}), 400

    tags = data.get("tags") or []
    if isinstance(tags, str):
        tags = [t.strip() for t in tags.split(",") if t.strip()]

    uid = str(request.current_user["id"])
    jid = str(uuid.uuid4())
    db_run(
        """INSERT INTO jobs (id, title, company, company_logo, location, job_type,
           specialty, salary, experience, deadline, tags, description, featured, added_by)
           VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)""",
        (jid, title, company,
         data.get("company_logo") or "", data.get("location") or "Remote",
         data.get("job_type") or "Full-Time", data.get("specialty") or "General Physician",
         data.get("salary") or "", data.get("experience") or "", data.get("deadline") or "",
         _json.dumps(tags), description, False, uid)
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
    return jsonify({"message": "Job deleted"})


# ── DOCTORS / CONSULTATIONS ───────────────────────────────────────
@app.route("/api/doctors")
def get_doctors():
    rows = db_all("SELECT * FROM doctors WHERE is_active=TRUE ORDER BY created_at DESC")
    return jsonify([doctor_to_frontend_shape(r) for r in rows])

@app.route("/api/admin/doctors", methods=["POST"])
@require_admin
def admin_create_doctor():
    data = request.get_json(force=True) or {}
    name = (data.get("name") or "").strip()
    specialty = (data.get("specialty") or "").strip()
    if not name or not specialty:
        return jsonify({"detail": "Name and specialty are required"}), 400

    tags = data.get("tags") or []
    if isinstance(tags, str):
        tags = [t.strip() for t in tags.split(",") if t.strip()]

    did = str(uuid.uuid4())
    db_run(
        """INSERT INTO doctors (id, name, specialty, hospital, avatar_url, verified,
           rating, reviews, experience, consultations, status, price, coins, tags, next_slot)
           VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)""",
        (did, name, specialty, data.get("hospital") or "", data.get("avatar_url") or "",
         bool(data.get("verified", True)), data.get("rating") or 4.8, data.get("reviews") or 0,
         data.get("experience") or 0, data.get("consultations") or 0, data.get("status") or "online",
         data.get("price") or 0, data.get("coins") or (float(data.get("price") or 0) * 2),
         _json.dumps(tags), data.get("next_slot") or "Available Now")
    )
    return jsonify({"message": "Doctor added ✅", "id": did}), 201

@app.route("/api/admin/doctors")
@require_admin
def admin_list_doctors():
    rows = db_all("SELECT * FROM doctors ORDER BY created_at DESC")
    return jsonify([doctor_to_frontend_shape(r) for r in rows])

@app.route("/api/admin/doctors/<doctor_id>", methods=["DELETE"])
@require_admin
def admin_delete_doctor(doctor_id):
    if not db_one("SELECT id FROM doctors WHERE id=%s", (doctor_id,)):
        return jsonify({"detail": "Doctor not found"}), 404
    db_run("DELETE FROM doctors WHERE id=%s", (doctor_id,))
    return jsonify({"message": "Doctor removed"})
# ─── RUN ───────────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    print("\n" + "="*50)
    print("  🏥  Healthy Universe API  v2.0  ")
    print("="*50)
    print("🐘 Connecting to PostgreSQL (Supabase)...")
    try:
        init_db()
        port  = int(os.getenv("PORT", 8000))
        debug = os.getenv("FLASK_ENV", "development") == "development"
        print(f"📡 Running on http://localhost:{port}")
        print(f"🔧 Debug mode: {'ON' if debug else 'OFF'}")
        print("="*50 + "\n")
        socketio.run(app, host="0.0.0.0", port=port, debug=debug, allow_unsafe_werkzeug=True)

    except Exception as e:
        print(f"\n❌ Startup failed: {e}")
        print("👉 Check DATABASE_URL is correct in .env\n")


    