# 🛠️ JORNIZ — Technology Stack Matrix

| Layer | Component | CURRENT Stack | TARGET Stack | GAP Analysis | Action Plan |
|---|---|---|---|---|---|
| **Frontend** | Framework | Vanilla JS (ES6+) | HTML5 / ES6 Vanilla JS | None — High performance, no build steps required | Maintain zero-dependency UI |
| **Frontend** | CSS Styling | Vanilla CSS Custom Properties | Modern Design System (`components.css`) | Complete | Enforce design tokens |
| **Frontend** | HTTP Client | Browser Native `fetch()` | Native `fetch()` | None | Centralized in `js/api.js` |
| **Backend** | Runtime | Python 3.10 / 3.12 | Python 3.12 LTS | None | Verified running |
| **Backend** | Web Framework | Flask 3.0.0 | Flask 3.0.0 + Gunicorn | Production WSGI needed | Configure Gunicorn for production |
| **Backend** | Real-time WS | Flask-SocketIO 5.3 | Flask-SocketIO | None | Eventlet/gevent optional |
| **Database** | RDBMS Engine | SQLite 3 / PostgreSQL 15 | PostgreSQL 15 (Neon / Supabase) | Dual-driver support active | SQLite local, PostgreSQL staging |
| **Storage** | Object Storage | Local `/uploads` + Supabase SDK | Supabase Storage Bucket | Graceful fallback implemented | Local upload fallback verified |
