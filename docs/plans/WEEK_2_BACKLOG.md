# 📋 JORNIZ — Approved Week 2 Sprint Backlog

**Project:** Jorniz Platform  
**Target Milestone:** Week 2 — Rebrand, Modular Auth, Role Permissions & Session Management  

---

## 1. Engineering Sprint Tickets

### Ticket JRNZ-W2-01: Jorniz Brand Asset Integration
- **Description**: Replace remaining legacy logos/text with official Jorniz brand system across all templates.
- **Modules**: Frontend (`index.html`, `auth.html`, `store.html`, `css/components.css`).
- **Acceptance Criteria**: All headers, footers, favicons, and system notifications feature unified Jorniz branding.

### Ticket JRNZ-W2-02: Modular Auth & Refresh Token Rotation
- **Description**: Upgrade authentication middleware to implement short-lived JWT access tokens (15m) + refresh token rotation in `user_sessions`.
- **Backend Work**: Add `POST /api/auth/refresh` route in `backend/main.py`.
- **Acceptance Criteria**: Seamless token refresh without forcing active user re-login.

### Ticket JRNZ-W2-03: Professional & Creator Verification Review Queue
- **Description**: Build admin review dashboard for pending creator and doctor verification requests.
- **Backend Work**: `GET /api/admin/verifications` and `POST /api/admin/verifications/<id>/approve`.
- **Acceptance Criteria**: Admin can view submitted verification documents and grant verified badges.

### Ticket JRNZ-W2-04: User Data Export & GDPR Compliance Endpoint
- **Description**: Finalize user data export script generating downloadable JSON format of user activity.
- **Backend Work**: Enforce rate-limiting on `POST /api/auth/export-data`.
- **Acceptance Criteria**: User receives complete JSON package containing account details, posts, and transactions.
