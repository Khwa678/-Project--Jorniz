# 👥 JORNIZ — Role & Permission Matrix (Week 1 Audit)

**Project:** Jorniz Platform  
**Target Roles:** 12 Platform Roles Across Modules A through F  

---

## 1. Permission Matrix

| Role | Access Level | Public Social Graph | Job Applications | Doctor Telemedicine | Advertiser Panel | Wallet Ledger | Admin Control |
|---|---|:---:|:---:|:---:|:---:|:---:|:---:|
| **General User / Patient** | Standard | `VIEW, CREATE` | `APPLY` | `BOOK, VIEW` | `DENY` | `VIEW, SPEND` | `DENY` |
| **Creator** | Monetized | `VIEW, CREATE` | `APPLY` | `BOOK, VIEW` | `DENY` | `VIEW, SPEND, WITHDRAW` | `DENY` |
| **Professional Candidate** | Professional | `VIEW, CREATE` | `CREATE CV, APPLY` | `BOOK, VIEW` | `DENY` | `VIEW, SPEND` | `DENY` |
| **Recruiter / Employer** | Employer | `VIEW, CREATE` | `POST JOB, REVIEW` | `BOOK, VIEW` | `DENY` | `VIEW, PAY` | `DENY` |
| **Doctor** | Healthcare | `VIEW, CREATE` | `DENY` | `MANAGE SLOTS, WRITE CLINICAL` | `DENY` | `VIEW, SETTLE` | `DENY` |
| **Seller / Brand** | Merchant | `VIEW, CREATE` | `DENY` | `DENY` | `DENY` | `VIEW, PAYOUT` | `DENY` |
| **Pharmacy Partner** | Healthcare | `DENY` | `DENY` | `VIEW PRESCRIPTION` | `DENY` | `VIEW` | `DENY` |
| **Diagnostic Partner** | Healthcare | `DENY` | `DENY` | `UPLOAD REPORT` | `DENY` | `VIEW` | `DENY` |
| **Advertiser** | Commercial | `VIEW` | `DENY` | `DENY` | `CREATE CAMPAIGN, DEPOSIT` | `VIEW, PAY` | `DENY` |
| **Moderator** | Compliance | `VIEW, DELETE` | `DENY` | `DENY` | `REVIEW AD` | `DENY` | `RESOLVE REPORTS` |
| **Finance Admin** | Finance | `VIEW` | `DENY` | `VIEW AUDIT` | `VIEW RECONCILIATION` | `RECONCILE POOLS` | `APPROVE PAYOUTS` |
| **Super Admin** | Full Admin | `ALLOW ALL` | `ALLOW ALL` | `ALLOW ALL` | `ALLOW ALL` | `ALLOW ALL` | `ALLOW ALL` |

---

## 2. API Authorization Middleware

All protected REST routes enforce role claims via `@require_auth` or `@require_admin` decorators in `backend/main.py`.
