# 🏛️ JORNIZ — Production Architecture Specification

## 1. System Architecture Diagram

```mermaid
graph TD
    Client["User Clients (Web Browser / Native)"]
    Gateway["Unified Web Gateway (Port 3000 / NGINX / server.py)"]
    API["Flask REST & SocketIO API Host (Port 8000)"]
    DB[("PostgreSQL / SQLite Storage Engine")]
    S3["Supabase / S3 Media Bucket"]
    WebRTC["WebRTC TURN Server"]

    Client -->|HTTP / REST / WS| Gateway
    Gateway -->|Static Assets| Client
    Gateway -->|Reverse Proxy /api/| API
    API -->|SQL Queries| DB
    API -->|Media Uploads| S3
    API -->|Room Tokens| WebRTC
```

---

## 2. Backend Modules Overview

```mermaid
graph LR
    Auth["Auth & Identity"] --- Social["Social Network"]
    Auth --- Jobs["Jobs & Recruitment"]
    Auth --- Doctors["Doctor Consultation"]
    Auth --- Ads["Ad Engine"]
    Auth --- Wallet["Wallet Ledger"]
    Auth --- Marketplace["Healthy Marketplace"]
```

---

## 3. Authentication Flow Diagram

```mermaid
sequenceDiagram
    autonumber
    actor User
    participant Gateway as Web Gateway (Port 3000)
    participant API as Flask API (Port 8000)
    participant DB as Database Engine

    User->>Gateway: POST /api/auth/login {email, password}
    Gateway->>API: Proxy POST /api/auth/login
    API->>DB: SELECT * FROM users WHERE email=?
    DB-->>API: User Record
    API->>API: Verify bcrypt password hash
    API->>API: Generate JWT bearer token
    API-->>Gateway: Return 200 OK {token, user_profile}
    Gateway-->>User: Store token in localStorage
```

---

## 4. Database Flow Diagram

```mermaid
erDiagram
    USERS ||--o{ POSTS : creates
    USERS ||--o{ APPOINTMENTS : books
    DOCTORS ||--o{ APPOINTMENTS : conducts
    USERS ||--o{ ORDERS : places
    USERS ||--o{ WALLET_LEDGER : owns
```

---

## 5. Deployment Pipeline Diagram

```mermaid
graph LR
    Git["Git Repository (Main Branch)"] -->|CI/CD Trigger| Build["Build & Test Validation"]
    Build -->|Deploy Frontend| Vercel["Frontend Web Gateway (Port 3000)"]
    Build -->|Deploy API| Render["Render Python Flask Host (Port 8000)"]
    Render -->|TLS SQL| Neon["Neon PostgreSQL Staging DB"]
```
