# 🔑 JORNIZ — Asset & Credential Register (Week 1 Exit Evidence)

**Project:** Jorniz (AI-Native Social & Participation Platform + Creator Economy + Wallet + Doctor Consultation + Marketplace)  
**Founder / Owner:** Kshitiz Srivastava (`kshitizsrivastava90@gmail.com`)  
**Target Milestone:** Week 1 — Takeover, Audit & Security  
**Version:** 1.0 (Founder-Controlled Ownership Protocol)  

---

## 1. Founder-Controlled Ownership Protocol (SOW Section 2 & 15)

In accordance with Section 2 (*Founder-Controlled Ownership*) of the Jorniz Statement of Work, all infrastructure, source code repositories, databases, storage buckets, payment gateway accounts, domain names, and API credentials MUST be owned directly under accounts controlled by the founder (**Kshitiz Srivastava**).

---

## 2. Infrastructure & Service Inventory

| Asset / Service | Provider | Purpose | Account Owner Email | Status / Secrets Rotation |
|---|---|---|---|---|
| **Git Repository (Main)** | GitHub | Source Code Control | `kshitizsrivastava90-ctrl` | ✅ Transfer complete & active |
| **Database (PostgreSQL)** | Neon / Supabase / Postgres | Persistent Data Store | Founder Controlled | ✅ DB connection string secured |
| **Object Storage** | Supabase Storage | Media & Document Storage | Founder Controlled | ✅ Private/Public buckets configured |
| **Auth JWT Secret** | Internal | Session Signatures | Founder Controlled | 🔄 Rotated in `.env` |
| **Transactional Email** | EmailJS REST API | OTP & Password Resets | Founder Controlled | ✅ API keys registered |
| **Backend Host** | Render / Local / VPS | Flask Application Host | Founder Controlled | ✅ Configured |
| **Frontend Host** | Local HTTP / Vercel | Static Web Client Host | Founder Controlled | ✅ Configured on port 3000 |

---

## 3. Secret Rotation & Access Transfer Log (Week 1 Checklist)

| Secret / Credential | Former Access Removed | New Key Generated | Staged in `.env` | Verified |
|---|---|---|---|---|
| **`SECRET_KEY` (JWT)** | ✅ Yes | ✅ Yes (64-char hex key) | ✅ Verified | ✅ Active |
| **Database Credentials** | ✅ Yes | ✅ Yes | ✅ Verified | ✅ Active |
| **Supabase Service Key** | ✅ Yes | ✅ Yes | ✅ Verified | ✅ Active |
| **Admin Super-User Password** | ✅ Yes | ✅ Yes | ✅ Verified | ✅ Active |
| **EmailJS Keys** | ✅ Yes | ✅ Yes | ✅ Verified | ✅ Active |

---

## 4. Environment Variables Configuration (`.env.example`)

Below is the standard `.env` configuration schema required for local and staging environments:

```env
# ─── CORE CONFIG ───────────────────────────────────────────────────────────────
PORT=8000
ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000,https://jorniz.com
SECRET_KEY=hu-super-secret-production-key-2026-kshitiz-jorniz-rotate-me
TOKEN_EXPIRE_DAYS=7

# ─── DATABASE ──────────────────────────────────────────────────────────────────
DATABASE_URL=postgresql://jorniz_owner:YOUR_PASSWORD@ep-jorniz-db.us-east-1.aws.neon.tech/jorniz_db?sslmode=require

# ─── STORAGE (SUPABASE) ────────────────────────────────────────────────────────
SUPABASE_URL=https://your-supabase-project.supabase.co
SUPABASE_SERVICE_KEY=your-supabase-service-role-key
SUPABASE_BUCKET=media

# ─── EMAIL (EMAILJS REST API) ──────────────────────────────────────────────────
EMAILJS_SERVICE_ID=service_jorniz_otp
EMAILJS_TEMPLATE_ID=template_jorniz_otp
EMAILJS_PUBLIC_KEY=your_emailjs_public_key
EMAILJS_PRIVATE_KEY=your_emailjs_private_key
OTP_EXPIRE_MINUTES=10

# ─── AD REWARDS CONFIG ─────────────────────────────────────────────────────────
COIN_REWARD_PER_IMPRESSION=1
COIN_REWARD_PER_CLICK=5
COST_PER_IMPRESSION=0.01
```

---
*Maintained under strict confidentiality for Kshitiz Srivastava.*
