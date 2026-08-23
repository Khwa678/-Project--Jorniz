# 💻 JORNIZ — Local Setup Guide

## 1. Prerequisites
- Python 3.10+
- Node.js 18+

## 2. Setup Commands

### Step 1: Install Dependencies
```powershell
cd backend
pip install -r requirements.txt
```

### Step 2: Initialize Database Schema
```powershell
python database_schema.py
```

### Step 3: Start Flask API Server (Port 8000)
```powershell
python main.py
```

### Step 4: Start Web Gateway Server (Port 3000)
```powershell
python server.py 3000
```

## 3. Application Access
👉 **Unified Web App Entry Point**: [http://localhost:3000](http://localhost:3000)
