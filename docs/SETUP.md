# Setup

## Prerequisites

| Software | Min Versi | Cek |
|----------|-----------|-----|
| Node.js | 18.x | `node -v` |
| npm | 9.x | `npm -v` |
| Git | — | `git --version` |

## 1. Clone & Setup

```bash
git clone <repo> on-boarding-trials
cd on-boarding-trials
```

## 2. Mock API (http://localhost:3001)

```bash
cd mock-api
npm install
cp .env.example .env      # Windows: copy .env.example .env
node seed.js               # Reset & seed database (opsional)
node server.js
```

## 3. Frontend (http://localhost:5173)

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

## Akun Demo

| Email | Password | Role | Status |
|-------|----------|------|--------|
| andika@stekom.ac.id | password | admin | approved |
| rudi@stekom.ac.id | password | karyawan | approved |
| siti@stekom.ac.id | password | karyawan | approved |
| budi@stekom.ac.id | password | karyawan | pending |

## Environment Variables

| File | Variable | Default |
|------|----------|---------|
| `frontend/.env` | `VITE_API_URL` | `http://localhost:3001` |
| `frontend/.env` | `VITE_APP_RELEASE_DATE` | `2026-07-13` |
| `mock-api/.env` | `BETTER_AUTH_SECRET` | (min 32 chars) |
| `mock-api/.env` | `BETTER_AUTH_URL` | `http://localhost:3001` |

## Scripts

### Frontend

| Perintah | Fungsi |
|----------|--------|
| `npm run dev` | Start Vite dev server (port 5173) |
| `npm run build` | TypeScript check + build production |
| `npm run lint` | Jalankan oxlint (target: zero warnings) |
| `npm run preview` | Preview production build |

### Mock API

| Perintah | Fungsi |
|----------|--------|
| `node server.js` | Start server (port 3001) |
| `node seed.js` | Reset & seed database |

## Troubleshooting

| Masalah | Solusi |
|---------|--------|
| **Port 3001/5173 dipakai** | `netstat -ano \| Select-String ":3001"` → `Stop-Process -Id <PID> -Force` |
| **Route tree tidak muncul** | Hapus `frontend/src/routeTree.gen.ts` → restart Vite |
| **Table "user" already exists** | Hapus `mock-api/auth.db` → `node server.js` |
| **Module not found** | `cd frontend && npm install` (atau `cd mock-api && npm install`) |
