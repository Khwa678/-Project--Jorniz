# Jorniz

Jorniz is an AI-native social and participation platform that combines social content, professional networking, healthcare services, jobs, creator rewards, a wallet, and commerce.

The project currently has:

- A Python Flask API backed by SQLite locally or PostgreSQL/Neon when configured.
- A new React, Vite, and TypeScript frontend under `frontend/`.
- The existing HTML, CSS, and JavaScript frontend at the repository root during migration.

## Installation

### Prerequisites

Install these tools:

- Python 3
- Node.js and npm

### Backend installation

Open a terminal and install the backend dependencies:

```bash
cd "/Users/prateekpanwar/PP Work/-Project--Jorniz/backend"
python3 -m venv .venv
source .venv/bin/activate
python3 -m pip install -r requirements.txt
cp -n .env.example .env
```

Keep backend secrets in `backend/.env`. Never commit this file.

Leave `DATABASE_URL` empty to use local SQLite. Set it to a PostgreSQL or Neon connection string to use PostgreSQL.

### Frontend installation

Open another terminal and install the frontend dependencies:

```bash
cd "/Users/prateekpanwar/PP Work/-Project--Jorniz/frontend"
npm install
cp -n .env.example .env.local
```

Set the local API URL in `frontend/.env.local`:

```env
VITE_API_URL=http://127.0.0.1:8000
```

Values that start with `VITE_` are visible in the browser. Do not put secrets in the frontend environment.

## Running locally

### 1. Run the backend

Open the first terminal:

```bash
cd "/Users/prateekpanwar/PP Work/-Project--Jorniz/backend"
source .venv/bin/activate
python3 main.py
```

The API runs at `http://127.0.0.1:8000`.

Check the API from another terminal:

```bash
curl http://127.0.0.1:8000/api/health
```

A successful response shows that Flask and the configured database are reachable. Port `8000` is the API, not the website.

### 2. Run the React frontend

Keep the backend active. Open a second terminal:

```bash
cd "/Users/prateekpanwar/PP Work/-Project--Jorniz/frontend"
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

Restart Vite after you change `frontend/.env.local`.

## Project structure

```text
.
|-- backend/                 Flask API, database code, migrations and dependencies
|-- frontend/                New React + Vite + TypeScript application
|   |-- src/app/             Application shell and route composition
|   |-- src/components/      Global navigation, health panel, assistant and post editor
|   |-- src/lib/             Shared API, identity and session code
|   |-- src/pages/           Route pages and their private components
|   |-- src/styles/          Global visual language and responsive styles
|-- css/                     Styles for the legacy frontend
|-- js/                      JavaScript for the legacy frontend
|-- docs/                    Architecture, setup and project documentation
|   |-- plans/               Planned and incomplete work
|   |-- reports/             Audits and test reports
|-- index.html               Legacy social-platform entry point
|-- auth.html                Legacy authentication page
|-- store.html               Legacy store page
|-- server.py                Legacy frontend gateway
`-- README.md
```

## 3. Test signup and login

1. Confirm that `/api/health` returns `status: ok`.
2. Open `http://localhost:5173`.
3. Create a General User account with a new email address.
4. Confirm signup completes without a network or JSON parsing error.
5. Open a private browser window and log in with the same credentials.
6. Use the browser Network tab to inspect any failed `/api/auth/*` request.

Professional account types can require additional profile information, verification documents, or approval. Use General User for the fastest authentication smoke test.

## Legacy frontend

The original frontend remains available while pages are migrated to React. To run it, keep Flask running and open another terminal:

```bash
cd "/Users/prateekpanwar/PP Work/-Project--Jorniz"
python3 server.py 3000
```

Open [http://localhost:3000](http://localhost:3000).

Do not run the React frontend and legacy gateway on the same port. React uses `5173`; the legacy gateway uses `3000`.

## Deployment boundary

- Render hosts the Flask backend.
- Vercel can continue hosting the legacy root frontend until React reaches feature parity.
- When React is ready, set the Vercel Root Directory to `frontend` and configure `VITE_API_URL` with the Render API URL.

See `docs/FRONTEND_REACT_MIGRATION.md` for the migration and deployment cutover plan.
