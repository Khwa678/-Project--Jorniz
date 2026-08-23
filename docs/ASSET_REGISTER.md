# 📋 JORNIZ — Infrastructure & Asset Register

| Asset | Owner | Environment | Purpose | Current Status | Required Action |
|---|---|---|---|---|---|
| **GitHub Repository** | Kshitiz Srivastava | Production | Source code control & CI/CD | Active | Maintain branch protection |
| **Vercel / Port 3000** | Kshitiz Srivastava | Staging / Prod | Web Application Gateway Host | Active | Serve `index.html` static bundle |
| **Render Python Host** | Kshitiz Srivastava | Staging / Prod | Flask REST API Host (Port 8000) | Active | Deploy Gunicorn WSGI container |
| **Neon / Supabase DB** | Kshitiz Srivastava | Staging / Prod | Managed PostgreSQL 15 Instance | Active | Execute auto-migrations |
| **Supabase Storage** | Kshitiz Srivastava | Staging / Prod | Media Asset Object Storage | Active | Configure public CDN read policies |
