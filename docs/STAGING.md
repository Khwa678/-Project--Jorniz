# 🚀 JORNIZ — Staging Deployment Guide

**Project:** Jorniz Platform  
**Environment:** Staging (Render / Neon PostgreSQL / Vercel)  

---

## 1. Staging Environment Architecture

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
                                │ TLS SQL Connection
                                ▼
                    ┌────────────────────────┐
                    │  PostgreSQL Database   │
                    │    (Neon / Supabase)   │
                    └────────────────────────┘
```

---

## 2. Staging Deployment Checklist

- [x] Environment secret rotation (`SECRET_KEY`, `DATABASE_URL`, `SUPABASE_SERVICE_KEY`)
- [x] Database migration runner execution against PostgreSQL staging cluster
- [x] CORS domain configuration (`ALLOWED_ORIGINS=https://staging.jorniz.com`)
- [x] Automated healthcheck verification (`GET /api/health` returns `200 OK`)

---

## 3. Smoke Test Verification Evidence

1. **API Health**: `GET http://localhost:8000/api/health` $\rightarrow$ `200 OK`
2. **Database Connectivity**: Verified PostgreSQL schema auto-migration
3. **Double-Spend Protection**: Verified `wallet_ledger` idempotency key enforcement
