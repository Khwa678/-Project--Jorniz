# 🛡️ JORNIZ — Security Audit Report

| ID | Severity | File | Line | Problem | Impact | Recommended Fix | Implemented Fix | Test |
|---|---|---|---|---|---|---|---|---|
| **SEC-01** | CRITICAL | `.env` | N/A | Hardcoded credentials in Git | Exposure of API keys | Exclude `.env` from Git tracking | Added to `.gitignore` & created `.env.example` | PASS |
| **SEC-02** | HIGH | `main.py` | 225 | Missing auth check on protected endpoints | Unauthorized access | Enforce `@require_auth` decorator | Applied `@require_auth` across all private routes | PASS |
| **SEC-03** | HIGH | `main.py` | 95 | Unrestricted CORS origins | Cross-origin exploitation | Enforce `ALLOWED_ORIGINS` config | Environment scoped CORS active | PASS |
| **SEC-04** | MEDIUM | `main.py` | 240 | Missing JWT expiration | Infinite session vulnerability | Implement `TOKEN_EXPIRE_DAYS` | Configured JWT exp claims | PASS |
| **SEC-05** | MEDIUM | `main.py` | 140 | SQL Injection risk | Database tampering | Use parametrized query bindings (`%s` / `?`) | Enforced parameterized queries in `db_all`/`db_one`/`db_run` | PASS |
