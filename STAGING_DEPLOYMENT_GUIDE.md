# 🚀 JORNIZ — Staging & Local Deployment Guide (Week 1 Exit Evidence)

**Project:** Jorniz (Healthcare Social Network + Creator Economy + Wallet + Consultations + Marketplace)  
**Project Owner:** Kshitiz Srivastava  
**Target Milestone:** Week 1 — Takeover, Audit & Security Deployment  

---

## 1. Prerequisites & Environment Setup

Ensure the following runtimes are installed on your host system:
- **Python:** `v3.10+` or `v3.12+` (`python --version` or `py --version`)
- **Node.js:** `v18+` or `v24+` (`node -v`, `npx -v`)
- **Git:** `v2.30+` (`git --version`)
- **PostgreSQL / SQLite:** Database runtime (configured via `DATABASE_URL`)

---

## 2. Running Locally (Step-by-Step)

### Step 1: Clone & Navigate to Repository
```powershell
cd "c:\Users\khawa\Downloads\my today\healthy-universe-social-media"
```

### Step 2: Configure Environment Variables (`.env`)
Create a `.env` file in `backend/` or the root workspace based on `.env.example`:
```env
PORT=8000
ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
SECRET_KEY=hu-super-secret-production-key-2026-kshitiz-jorniz-rotate-me
DATABASE_URL=postgresql://jorniz_owner:password@localhost:5432/jorniz_db
```

### Step 3: Launch Local Web Server (Port 3000)
Run Python HTTP Server from the root folder:
```powershell
python -m http.server 3000
```
- **Web App URL:** [http://localhost:3000](http://localhost:3000)
- **Sign In Page:** [http://localhost:3000/auth.html](http://localhost:3000/auth.html)

### Step 4: Launch Backend API Server (Port 8000 / 5000)
Install Python dependencies and run the Flask application:
```powershell
cd backend
pip install -r requirements.txt
python main.py
```

---

## 3. Staging Deployment Protocol (Render / Supabase / Vercel)

### Staging Architecture Diagram
```
                     ┌────────────────────────┐
                     │    Jorniz Frontend     │
                     │  (Vercel / Port 3000)  │
                     └───────────┬────────────┘
                                 │ HTTPS REST
                                 ▼
                     ┌────────────────────────┐
                     │     Flask API Host     │
                     │ (Render / Python 3.12) │
                     └───────────┬────────────┘
                                 │ SQL / TLS
                                 ▼
                     ┌────────────────────────┐
                     │  PostgreSQL Database   │
                     │   (Neon / Supabase)    │
                     └────────────────────────┘
```

### Deployment Commands & Health Verification
1. **API Healthcheck**: `GET https://staging.jorniz.com/health` (Expect `200 OK`)
2. **CORS Verification**: Confirm `Access-Control-Allow-Origin` returns exact staging origin.
3. **Database Connectivity**: Verify PostgreSQL connection string using SSL mode (`sslmode=require`).

---

## 4. Verification & Testing Evidence

- **Frontend Login Verification**: Tested with default doctor credentials (`khwa@gmail.com` / `123456`) and Google OAuth.
- **Server Health**: Verified running on `http://localhost:3000` via active background task `task-25`.

---
*Prepared for Kshitiz Srivastava — Jorniz Engineering Team.*
