# 🗄️ JORNIZ — Database Audit & Schema Inventory

**Project:** Jorniz (Healthcare Social Network + Creator Economy + Wallet + Doctor Consultations + Marketplace)  
**Target Engine:** SQLite (Local Development) / PostgreSQL 15+ (Staging & Production)  

---

## 1. Table Inventory

| Table Name | Module | Primary Key | Foreign Keys | Audit Fields | Purpose |
|---|---|---|---|---|---|
| `users` | Module A | `id` | None | `created_at` | Stores patient, doctor, seller, and admin user profiles. |
| `user_sessions` | Module A | `id` | `user_id` | `created_at` | Active multi-device session management and token revocation. |
| `creator_verifications` | Module A | `id` | `user_id` | `created_at` | Verification submissions for medical & creator badges. |
| `follows` | Module A | `(follower_id, followed_id)` | None | `created_at` | Social graph follow/unfollow relationships. |
| `posts` | Module A | `id` | `user_id` | `created_at` | Content feed posts (text, image, carousel, video). |
| `jobs` | Module B | `id` | None | `created_at` | Recruiter job listings and employment opportunities. |
| `candidate_profiles` | Module B | `id` | `user_id` | `created_at` | Professional candidate skills, certs, and portfolio. |
| `candidate_cvs` | Module B | `id` | `user_id` | `created_at` | Multi-version candidate CV uploads. |
| `job_applications` | Module B | `id` | `job_id`, `candidate_id` | `created_at` | Job applicant pipeline status tracking. |
| `doctors` | Module C | `id` | `user_id` | `created_at` | Doctor profiles, qualifications, and consultation fees. |
| `doctor_slots` | Module C | `id` | `doctor_id` | None | Real-time consultation calendar slots with atomic locking. |
| `appointments` | Module C | `id` | `doctor_id`, `patient_id` | `created_at` | Booked doctor appointments and telemedicine status. |
| `clinical_records` | Module C | `id` | `appointment_id` | `created_at` | Isolated patient medical consent, symptoms, notes, and prescriptions. |
| `ad_campaigns` | Module D | `id` | `advertiser_id` | `created_at` | Advertiser ad campaigns, budget, pacing, and placements. |
| `revenue_distribution_logs` | Module D | `id` | None | `created_at` | SOW Section 7.2 revenue formula reconciliation audit logs. |
| `wallet_ledger` | Module E | `id` | `user_id` | `created_at` | Double-entry immutable financial ledger with idempotency keys. |
| `products` | Module F | `id` | `category_id` | None | Marketplace catalog products. |
| `orders` | Module F | `id` | `user_id` | `created_at` | Customer marketplace purchase orders. |

---

## 2. Integrity & Constraint Verification

- **Foreign Keys**: Enforced on all child records (`appointments`, `job_applications`, `order_items`).
- **Idempotency Locking**: Unique constraint on `wallet_ledger.idempotency_key` prevents double-spending.
- **Clinical Data Separation**: Medical notes and prescriptions stored in `clinical_records`, isolated from public social graph data.
