# 🗺️ JORNIZ — Working vs. Fake Flows Audit Map (Week 1 Exit Evidence)

**Project:** Jorniz (AI-Native Social & Participation Platform + Creator Economy + Wallet + Doctor Consultation + Marketplace)  
**Project Owner:** Kshitiz Srivastava  
**Principle Enforced:** *"Backend before claims — No visible button, balance, earnings figure, booking confirmation, job application or payment success screen may exist unless the backend transaction genuinely succeeds."* (SOW Section 2)  

---

## 1. Executive Summary & Audit Methodology

This document maps every feature across the 8 Jorniz platform modules (Modules A through H) into three distinct classification categories:

1. 🟢 **WORKING (Backend Persisted)**: Full end-to-end integration between frontend UI, backend REST API, database persistence, and session verification.
2. 🟡 **PARTIAL (Hybrid / Local Fallback)**: Functional UI and API flow existing with fallback mock storage or partial table schemas during Week 1 staging.
3. 🔴 **FAKE / MOCK (Frontend-Only Claim)**: UI buttons or static screens that lack persistent backend database transactions or server-side role validation.

---

## 2. Feature & Flow Mapping Matrix

| Module | Feature / User Flow | Current Status | Audit Details & Backend Requirement | Target Week |
|---|---|---|---|---|
| **Module A: Social Network** | Email/Mobile Auth & JWT Login | 🟢 WORKING | Connected to `/api/auth/login` with token storage and fallback safety. | Week 2 |
| **Module A: Social Network** | Google / LinkedIn OAuth | 🟢 WORKING | Authenticates user session, sets local token, populates profile. | Week 2 |
| **Module A: Social Network** | Feed Posts & Like / Share Counts | 🟢 WORKING | Fetches posts, updates like counter, persists in `post_likes`. | Week 3 |
| **Module A: Social Network** | Creator Verification Workflow | 🟡 PARTIAL | Document upload UI active; needs administrative review queue. | Week 2 |
| **Module A: Social Network** | Resumable Video Upload & Transcoding | 🔴 FAKE | Files upload directly; needs Redis queue & thumbnail generation. | Week 3 |
| **Module B: Professional & Jobs** | Candidate Profile & CV Upload | 🟡 PARTIAL | Candidate form exists; requires private CV storage bucket. | Week 4 |
| **Module B: Professional & Jobs** | Job Search & Filter | 🟡 PARTIAL | Job UI components present; requires recruiter job post DB table. | Week 4 |
| **Module B: Professional & Jobs** | Recruiter Seat & Candidate Pipeline | 🔴 FAKE | Employer screens are static; requires `jobs` and `applications` DB APIs. | Week 4 |
| **Module C: Doctor Consultation** | Doctor Onboarding & Licensing | 🟡 PARTIAL | Doctor registration form captures specialty; requires admin approval gate. | Week 7 |
| **Module C: Doctor Consultation** | Atomic Slot Booking & Calendar Lock | 🔴 FAKE | Calendar UI selects slot; requires atomic DB locking (`SELECT FOR UPDATE`). | Week 7 |
| **Module C: Doctor Consultation** | WebRTC Video / Telemedicine Call | 🔴 FAKE | Consultation room UI exists; requires TURN server & room token API. | Week 7 |
| **Module D: Advertising & Monetization** | Ad Campaign Creator & Budgeting | 🟡 PARTIAL | Campaign creation UI active; requires advertiser deposit verification. | Week 5 |
| **Module D: Advertising & Monetization** | Impression/Click Coin Rewards | 🟢 WORKING | Rewards user coins on view/click via `/api/ads` endpoints. | Week 5 |
| **Module D: Advertising & Monetization** | Economic Formula Monetization Calculation | 🔴 FAKE | Formula specified in SOW Section 7.2; requires automated nightly calculation. | Week 5 |
| **Module E: Wallet & Closed-Loop** | Immutable Wallet Ledger | 🟡 PARTIAL | Display balance works; requires immutable double-entry transaction ledger. | Week 6 |
| **Module E: Wallet & Closed-Loop** | Anti-Fraud & Double-Spend Guards | 🔴 FAKE | Requires idempotency key checks and concurrency locks. | Week 6 |
| **Module F: Healthy Marketplace** | Product Catalogue & Cart | 🟢 WORKING | Buyer browse, product view, and cart management functional. | Week 8 |
| **Module F: Healthy Marketplace** | Seller Onboarding & Payouts | 🔴 FAKE | Seller panel static; requires marketplace vendor settlement tables. | Week 8 |
| **Module G: Medicines** | Prescription Upload & Pharmacy Review | 🔴 FAKE | UI permits upload; requires licensed pharmacy partner audit queue. | Week 9 |
| **Module H: Diagnostic Services** | Test Booking & Report Delivery | 🔴 FAKE | Diagnostic UI present; requires lab partner PIN code and report upload. | Week 9 |

---

## 3. Remediation Strategy for "Fake Claims"

To comply strictly with **SOW Section 2 (Non-Negotiable Project Principles)**:
1. Every frontend action must trigger an API call to a persistent database record.
2. Unfinished flows (such as live video consultation or pharmacy fulfillment) will display clear **"Coming in Sprint X"** badges rather than mock success screens.
3. Financial values (wallet balances, payout figures, earnings) will only be rendered if verified by the database ledger API (`SELECT SUM(amount) FROM wallet_ledger`).

---
*Verified for Kshitiz Srivastava — Jorniz Platform Delivery.*
