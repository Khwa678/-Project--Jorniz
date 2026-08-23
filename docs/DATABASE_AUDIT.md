# 🗄️ JORNIZ — Database Audit & Schema Inventory

## 1. Table Summary (37 Relational Tables)

| Module | Table Name | Purpose | Foreign Keys | Audit Fields |
|---|---|---|---|---|
| **Module A** | `users` | User accounts & roles | None | `created_at` |
| **Module A** | `user_sessions` | Multi-device active sessions | `user_id` | `created_at` |
| **Module A** | `creator_verifications` | Medical & creator verification applications | `user_id` | `created_at` |
| **Module A** | `posts` | Social graph content posts | `user_id` | `created_at` |
| **Module B** | `jobs` | Recruiter job listings | `added_by` | `created_at` |
| **Module B** | `candidate_cvs` | Multi-version candidate CVs | `user_id` | `created_at` |
| **Module B** | `job_applications` | Recruiter application tracking pipeline | `job_id`, `candidate_id` | `created_at` |
| **Module C** | `doctors` | Doctor specialty & fee profiles | `user_id` | None |
| **Module C** | `doctor_slots` | Real-time consultation calendar slots | `doctor_id` | None |
| **Module C** | `appointments` | Booked patient consultations | `doctor_id`, `patient_id` | `created_at` |
| **Module C** | `clinical_records` | Patient symptoms, doctor notes, prescriptions | `appointment_id` | `created_at` |
| **Module D** | `ad_campaigns` | Advertiser campaign parameters | `advertiser_id` | `created_at` |
| **Module D** | `revenue_distribution_logs` | SOW 7.2 revenue distribution calculation logs | None | `created_at` |
| **Module E** | `wallet_ledger` | Immutable double-entry financial ledger | `user_id` | `created_at` |
| **Module F** | `seller_profiles` | Marketplace vendor profiles | `user_id` | `created_at` |
| **Module F** | `products` | Marketplace catalog products | `category_id` | None |
| **Module F** | `orders` | Customer order transactions | `user_id` | `created_at` |
