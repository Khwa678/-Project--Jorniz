# Jorniz — Project Description & Improvement Brief

## 1) What is this project?

**Jorniz (Healthy Universe)** is a healthcare-focused digital platform that mixes:
- A social network for health content
- Professional roles for doctors, nutritionists, and creators
- Wallet/reward mechanics
- Doctor consultation scheduling
- Job and recruitment flow
- Marketplace + ads modules

The project is currently positioned as a **"Production-ready healthcare social network + creator economy + wallet + consultation + marketplace"** platform.

## 2) Core idea (one paragraph)

The platform’s core value proposition is to create a trusted healthcare creator ecosystem where verified medical professionals and health creators publish content, users discover experts, book services, and transact inside one product (social + consultation + marketplace).

The security model is intended to treat medical credibility as a first-class feature via role-based identity, verification workflows, and protected API actions.

## 3) Likely users / clients

Based on routes, roles, and UI pages, target users are:
- Patients / health-conscious users (accounts, feeds, bookmarks, wallet usage)
- Doctors and healthcare professionals (consultation slots, clinical records, role verification)
- Health creators and influencers (creator verification, posts, monetization)
- Recruiters / employers and job candidates
- Sellers / brands (marketplace onboarding and product selling)
- Advertisers (campaign creation, budget deposits, revenue reconciliation)
- Admin users and platform finance moderators (review, moderation, fraud, reconciliation)

## 4) Technology stack used

- Frontend: Vanilla HTML/CSS/JavaScript (no framework build pipeline)
- Gateway: `server.py` (Python `http.server` reverse-proxy on port `3000`)
- API: Flask 3.0.x + Flask-CORS + Flask-SocketIO + JWT (PyJWT)
- Data storage: SQLite locally, PostgreSQL support via `DATABASE_URL`
- Password/auth: bcrypt + JWT
- Storage: Supabase SDK path for media documents, with local `backend/uploads` fallback currently advertised
- Messaging/consultation hooks: SocketIO routes and consultation room token APIs
- Docs/process artifacts: extensive markdown governance docs under root and `docs/`

## 5) Current runtime architecture (flow)

- User opens `index.html` / pages via `http://localhost:3000`
- `/api/*` requests are proxied from `server.py` to `http://localhost:8000`
- `backend/main.py` handles REST routes for:
  - Authentication (`/api/auth/*`)
  - Posts, likes, comments, notifications (`/api/posts/*`, `/api/notifications*`)
  - Jobs, doctors, consultations, ads, wallet, products, marketplace endpoints
- `backend/main.py` initializes DB on startup and serves `/api/health`
- Media endpoints store content using `upload_to_supabase` and have `/uploads/...` static access path for local serving

## 6) Folder / module layout (important)

- `/index.html`, `/auth.html`, `/store.html`: main UI entry points
- `/server.py`: unified gateway/proxy
- `/backend/`
  - `main.py`: Flask API server
  - `database_schema.py`: DB bootstrap/migrations
  - `requirements.txt`: runtime dependencies
  - `healthy_universe.db`: local SQLite file
  - `uploads/`: local fallback media directory
- `/css/`: `components.css`, `styles.css`
- `/js/`: `api.js`, `auth.js`, `app.js`, `admin.js`, `call.js`, `chat.js`, etc.
- `/docs/`: architecture, security, deployment, and audit artifacts
- `/Health_universe_store/`: historical/legacy store reference (ASP.NET/WebForms style) that is not part of the main Python/JS architecture

## 7) Will it work today?

Short answer: **yes for local development, with caveats**.

- The backend server and gateway both run in development as seen in existing terminal logs.
- Core identity + social + posts + jobs + wallet + marketplace + consultation room APIs exist in `backend/main.py`.
- Health check is implemented at `/api/health`, and DB init runs on startup.

Caveats affecting confidence:
- Frontend API base (`js/api.js`) is hardcoded to the remote URL in code; local users must switch to `http://localhost:3000` or `http://localhost:8000`.
- Some claims in docs are marked as `FAKE`/`PARTIAL`; real user-visible behavior may vary by module depending on endpoint readiness.
- Security hardening and role enforcement are not fully uniform across all routes despite the defined role matrix.

## 8) Current-state assessment (what is already working vs remaining)

- Working (documented evidence):
  - Login/auth token flow, sign-up, account checks
  - Social posts feed and like/comment interactions
  - Jobs, candidate CV upload/application, job status routes
  - Doctor atomic booking endpoint + consultation room read endpoint
  - Wallet ledger read/transfer endpoint
  - Marketplace products/cart/checkout flows and seller registration
  - Admin APIs for moderation and reporting

- Partially working / risk:
  - Upload and verification pipelines depend heavily on storage configuration and may fail without environment setup for Supabase media
  - Several financial and operational safeguards are documented as planned but not fully enforced at code-level consistency

## 9) How she can improve it fast

### P0 (do this first)
1. Point frontend API base to local gateway for local QA consistency.
2. Make Supabase optional in all media endpoints by adding local fallback storage.
3. Normalize role gating by adding explicit role middleware (`require_role`) and applying it consistently.

### P1 (core production readiness)
4. Remove hardcoded/placeholder secrets and force strict environment validation at startup.
5. Restrict CORS to known domains only.
6. Add DB-level constraints/transfers for double-spend-safe wallet operations.
7. Add end-to-end tests for 1) auth, 2) posts, 3) consultation booking, 4) wallet transfer.

### P2 (product readiness)
8. Resolve remaining claims vs reality in workflow docs and UI (remove mock success screens where backend calls are missing).
9. Add explicit “coming soon / in progress” states for unimplemented modules.
10. Strengthen medical data privacy boundaries for prescription and verification documents.

## 10) Suggested one-line summary

Jorniz is a **multi-module healthcare creator platform** with working backend foundations and active roadmap, but it needs focused hardening in API contract consistency, role enforcement, storage fallback, and production auth/security posture before claiming full production readiness.

