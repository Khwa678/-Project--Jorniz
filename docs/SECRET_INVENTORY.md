# 🔑 JORNIZ — Secret Inventory Register

| Variable | Location | Environment | Purpose | Exposed in Git? | Rotation Required? | Status |
|---|---|---|---|:---:|:---:|:---:|
| `SECRET_KEY` | `backend/.env` | All | JWT Signature HMAC Secret | ❌ No | 🟢 Completed | Rotated |
| `DATABASE_URL` | `backend/.env` | Staging / Prod | PostgreSQL Connection String | ❌ No | 🟢 Completed | Managed via Env |
| `SUPABASE_SERVICE_KEY` | `backend/.env` | Staging / Prod | Supabase Object Storage Access | ❌ No | 🟢 Completed | Managed via Env |
| `EMAILJS_PRIVATE_KEY` | `backend/.env` | All | Email OTP Transmission Secret | ❌ No | 🟢 Completed | Managed via Env |
