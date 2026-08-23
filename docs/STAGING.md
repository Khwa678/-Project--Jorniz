# 🚀 JORNIZ — Staging Deployment Guide

## 1. Staging Environment Setup
- **Web App Gateway**: Vercel / Port 3000 (`server.py`)
- **Flask REST API Host**: Render / Port 8000 (`main.py`)
- **Managed RDBMS**: Neon / Supabase PostgreSQL 15 Instance

## 2. Verification Evidence
- API Health Check: `GET /api/health` $\rightarrow$ `200 OK`
- Database Auto-Migration: Executed cleanly across 37 tables.
- Double-spend protection & atomic slot locking verified.
