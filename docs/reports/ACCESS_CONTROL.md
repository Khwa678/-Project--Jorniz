# 🔐 JORNIZ — Access Control & Secret Rotation Audit (Week 1 Exit Evidence)

**Project:** Jorniz (AI-Native Social & Participation Platform + Creator Economy + Wallet + Consultations + Marketplace)  
**Project Owner:** Kshitiz Srivastava  
**Target Milestone:** Week 1 — Takeover, Audit & Access Revocation  

---

## 1. Executive Summary

As part of the Week 1 Repository and Platform Takeover protocol, an audit of developer seats, cloud access keys, database credentials, and service accounts was conducted. Former agency/developer permissions have been cataloged for revocation, and all core secrets are mapped for environment variable rotation.

---

## 2. Access Revocation Register

| Entity / System | Account / Identifier | Access Level | Status | Required Action |
|---|---|---|---|---|
| **GitHub Repository** | Former Developer Seats | Admin / Push | 🔴 Revoke Pending | Remove write access for legacy agency contributors. |
| **Supabase Storage** | Service Role Secret Key | Admin API | 🟡 Rotation Required | Regenerate service key in Supabase Dashboard. |
| **PostgreSQL Database** | Direct Connection String | DB Owner | 🟡 Password Rotation | Alter user password in PostgreSQL / Neon / Supabase. |
| **JWT Authorization** | `SECRET_KEY` | HMAC Key | 🟢 Rotated | Set to high-entropy 256-bit environment secret. |
| **EmailJS Gateway** | Public / Private API Keys | API Gateway | 🟢 Active | Verified scoped key permissions. |

---

## 3. Secret Rotation Strategy

1. **Environment Variables Isolation**: No hardcoded credentials exist in source code files. `.env` files are strictly excluded via `.gitignore`.
2. **Key Rotation Protocol**:
   - `SECRET_KEY`: Rotated in backend `.env` configuration.
   - `DATABASE_URL`: Password updated with SSL connection mode (`sslmode=require`).
   - `SUPABASE_SERVICE_KEY`: Managed via environment variables.

---

*Verified for Kshitiz Srivastava — Jorniz Engineering Team.*
