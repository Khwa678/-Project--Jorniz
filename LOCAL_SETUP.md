# 💻 JORNIZ — Local Development Setup Guide

**Project:** Jorniz Platform  
**Target Milestone:** Week 1 — Local Execution & Developer Onboarding  

---

## 1. System Requirements

- **Python**: `v3.10+` or `v3.12+`
- **Node.js**: `v18+` or `v20+`
- **PowerShell / Bash**: Command line shell

---

## 2. Step-by-Step Local Setup

### Step 1: Clone Repository & Navigate
```powershell
cd "c:\Users\khawa\Downloads\my today\healthy-universe-social-media"
```

### Step 2: Install Python Dependencies
```powershell
cd backend
pip install -r requirements.txt
```

### Step 3: Initialize Database Schema
```powershell
python database_schema.py
```
*Output expectation:* `[SUCCESS] Unified Healthy Universe Database initialized successfully!`

### Step 4: Launch Flask REST Backend API (Port 8000)
```powershell
python main.py
```
*Output expectation:* `[API SERVER] Running on http://localhost:8000`

### Step 5: Launch Unified Web Gateway Server (Port 3000)
In a separate terminal window from root workspace directory:
```powershell
python server.py 3000
```
*Output expectation:* `[HEALTHY UNIVERSE GATEWAY] Running on http://localhost:3000`

---

## 3. Local Access URLs

- **Unified Web Application Entry Point**: 👉 **[http://localhost:3000](http://localhost:3000)**
- **Authentication Page**: [http://localhost:3000/auth.html](http://localhost:3000/auth.html)
- **Marketplace Store**: [http://localhost:3000/store.html](http://localhost:3000/store.html)
- **Backend API Base**: [http://localhost:8000/api/](http://localhost:8000/api/)
