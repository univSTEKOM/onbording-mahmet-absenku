# Setup & Instalasi

## Prerequisites

| Software | Minimal Versi | Cek |
|----------|--------------|-----|
| [Node.js](https://nodejs.org/) | ≥ 18.x | `node -v` |
| npm | ≥ 9.x | `npm -v` |
| [Git](https://git-scm.com/) | — | `git --version` |

## Quick Start (5 Menit)

### 1. Clone & Masuk Direktori

```bash
git clone <repo-url> on-boarding-trials
cd on-boarding-trials
```

### 2. Setup Mock API

```bash
cd mock-api

# Install dependencies
npm install

# Copy environment variables
copy .env.example .env

# (Opsional) Seed database demo
node seed.js

# Start server
node server.js
```

Mock API berjalan di **http://localhost:3001**.

### 3. Setup Frontend

```bash
cd frontend

# Install dependencies
npm install

# Copy environment variables
copy .env.example .env

# Start development server
npm run dev
```

Frontend berjalan di **http://localhost:5173**.

### 4. Buka Browser

Buka **http://localhost:5173** dan login dengan akun demo.

## Akun Demo

| Email | Password | Role | Status |
|-------|----------|------|--------|
| andika@stekom.ac.id | password | admin | approved |
| rudi@stekom.ac.id | password | karyawan | approved |
| siti@stekom.ac.id | password | karyawan | approved |
| budi@stekom.ac.id | password | karyawan | pending (perlu diverifikasi) |

## Environment Variables

### `frontend/.env`

```env
VITE_API_URL=http://localhost:3001
VITE_APP_RELEASE_DATE=2026-07-13
```

### `mock-api/.env`

```env
BETTER_AUTH_SECRET=your-secret-key-min-32-chars-long-here
BETTER_AUTH_URL=http://localhost:3001
APP_RELEASE_DATE=2026-07-13
```

## Available Scripts

### Frontend

| Script | Perintah | Deskripsi |
|--------|----------|-----------|
| Dev | `npm run dev` | Start Vite dev server (port 5173) |
| Build | `npm run build` | TypeScript check + build production |
| Lint | `npm run lint` | Jalankan oxlint |
| Preview | `npm run preview` | Preview production build |

### Mock API

| Script | Perintah | Deskripsi |
|--------|----------|-----------|
| Start | `node server.js` | Start server (port 3001) |
| Seed | `node seed.js` | Reset & seed database |
| Seed+Start | `node seed.js && node server.js` | Seed lalu start |

## Troubleshooting

### Port 3001 / 5173 already in use

```powershell
# Cari PID
netstat -ano | Select-String ":3001"

# Matikan proses
Stop-Process -Id <PID> -Force
```

### Route tree tidak ter-generate

Hapus file route tree lalu restart Vite:

```bash
cd frontend
Remove-Item src/routeTree.gen.ts -Force
npm run dev
```

### Error `table "user" already exists`

Hapus file database lama:

```bash
cd mock-api
Remove-Item auth.db -Force
node server.js
```

### Face-api models tidak loading

Pastikan folder `frontend/public/models/` berisi file model face-api.js. Jika kosong, download dari [face-api.js weights](https://github.com/justadudewhohacks/face-api.js/tree/master/weights).

### Module not found

```bash
cd frontend  # atau cd mock-api
npm install
```
