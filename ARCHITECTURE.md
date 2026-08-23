# 🏗️ JORNIZ — Platform Architecture & System Specification

**Project:** Jorniz (Healthcare Social Network + Creator Economy + Wallet + Doctor Consultations + Marketplace)  
**Author:** Jorniz Senior Engineering Team  
**Milestone:** Week 1 — Architecture & System Specification  

---

## 1. High-Level System Architecture

```mermaid
graph TD
    Client["User Clients (Web Browser / iOS / Android)"]
    Gateway["Unified Web Gateway (Port 3000 / NGINX / server.py)"]
    API["Flask REST & SocketIO API Host (Port 8000)"]
    DB[("PostgreSQL / SQLite Storage Engine")]
    S3["Supabase / S3 Media Bucket"]
    WebRTC["WebRTC TURN Server (Doctor Consultations)"]

    Client -->|HTTP / REST / WS| Gateway
    Gateway -->|Static Assets| Client
    Gateway -->|Reverse Proxy /api/| API
    API -->|SQL Queries| DB
    API -->|Media Uploads| S3
    API -->|Room Tokens| WebRTC
```

---

## 2. Authentication & Authorization Flow

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

## 3. API & Proxy Request Lifecycle

```mermaid
flowchart LR
    A["Client Request: GET /api/search?q=cardiology"] --> B["Unified Gateway Handler (Port 3000)"]
    B -->|Check Path /api/| C["Proxy Request to http://localhost:8000/api/search"]
    C --> D["Flask Route Decorator @app.route('/api/search')"]
    D --> E["Execute Parametrized SQL Query"]
    E --> F["Return JSON Response (200 OK)"]
```

---

## 4. Database Schema & Entity Relationship Overview

```mermaid
erDiagram
    USERS ||--o{ POSTS : creates
    USERS ||--o{ APPOINTMENTS : books
    DOCTORS ||--o{ APPOINTMENTS : conducts
    USERS ||--o{ ORDERS : places
    ORDERS ||--|{ ORDER_ITEMS : contains
    USERS ||--o{ WALLET_LEDGER : owns
    ADVERTISERS ||--o{ AD_CAMPAIGNS : funds
```

---

## 5. Deployment Pipeline & Staging Architecture

```mermaid
graph LR
    Git["Git Repository (Main Branch)"] -->|CI/CD Trigger| Build["Build & Test Validation"]
    Build -->|Deploy Frontend| Vercel["Frontend Web Gateway (Port 3000)"]
    Build -->|Deploy API| Render["Render Python Flask Host (Port 8000)"]
    Render -->|TLS SQL| Neon["Neon PostgreSQL Staging DB"]
```
