# 👥 JORNIZ — Role Permission Matrix

| Role | Access Level | Public Social Graph | Job Applications | Doctor Telemedicine | Advertiser Panel | Wallet Ledger | Admin Control |
|---|---|:---:|:---:|:---:|:---:|:---:|:---:|
| `GENERAL_USER` | Standard | `VIEW, CREATE` | `APPLY` | `BOOK, VIEW` | `DENY` | `VIEW, SPEND` | `DENY` |
| `CREATOR` | Monetized | `VIEW, CREATE` | `APPLY` | `BOOK, VIEW` | `DENY` | `VIEW, SPEND, WITHDRAW` | `DENY` |
| `PROFESSIONAL` | Candidate | `VIEW, CREATE` | `CREATE CV, APPLY` | `BOOK, VIEW` | `DENY` | `VIEW, SPEND` | `DENY` |
| `RECRUITER` | Employer | `VIEW, CREATE` | `POST JOB, REVIEW` | `BOOK, VIEW` | `DENY` | `VIEW, PAY` | `DENY` |
| `DOCTOR` | Healthcare | `VIEW, CREATE` | `DENY` | `MANAGE SLOTS, WRITE CLINICAL` | `DENY` | `VIEW, SETTLE` | `DENY` |
| `SELLER` | Merchant | `VIEW, CREATE` | `DENY` | `DENY` | `DENY` | `VIEW, PAYOUT` | `DENY` |
| `PHARMACY_PARTNER` | Partner | `DENY` | `DENY` | `VIEW PRESCRIPTION` | `DENY` | `VIEW` | `DENY` |
| `DIAGNOSTIC_PARTNER` | Partner | `DENY` | `DENY` | `UPLOAD REPORT` | `DENY` | `VIEW` | `DENY` |
| `ADVERTISER` | Commercial | `VIEW` | `DENY` | `DENY` | `CREATE CAMPAIGN, DEPOSIT` | `VIEW, PAY` | `DENY` |
| `MODERATOR` | Compliance | `VIEW, DELETE` | `DENY` | `DENY` | `REVIEW AD` | `DENY` | `RESOLVE REPORTS` |
| `FINANCE_ADMIN` | Finance | `VIEW` | `DENY` | `VIEW AUDIT` | `VIEW RECONCILIATION` | `RECONCILE POOLS` | `APPROVE PAYOUTS` |
| `SUPER_ADMIN` | Full Admin | `ALLOW ALL` | `ALLOW ALL` | `ALLOW ALL` | `ALLOW ALL` | `ALLOW ALL` | `ALLOW ALL` |
