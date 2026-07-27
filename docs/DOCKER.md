# Docker Setup

## Prerequisites

- Docker Engine ≥ 24.x
- Docker Compose ≥ 2.x
- Git

## Quick Start

```bash
# 1. Clone repository
git clone <repo-url>
cd on-boarding-trials

# 2. Start — otomatis buat .env dari .env.example jika belum ada
./start-docker.sh up -d

# 3. Cek status
docker compose ps

# 4. Buka browser
open http://localhost:5173
```

Proses build pertama akan memakan waktu 2-5 menit.

---

## Port

| Service | Container Port | Host Port | URL |
|---------|---------------|-----------|-----|
| Frontend | 80 | 5173 | [http://localhost:5173](http://localhost:5173) |
| Mock API | 3001 | 3001 | [http://localhost:3001](http://localhost:3001) |

---

## Environment Variables

| Variable | Default | Wajib | Deskripsi |
|----------|---------|-------|-----------|
| `VITE_API_URL` | `http://localhost:3001` | — | Backend URL untuk frontend (build arg) |
| `VITE_APP_NAME` | `AbsenKu` | — | Nama aplikasi di title dan export |
| `BETTER_AUTH_SECRET` | — | ✅ | Secret key untuk session encryption (min 32 chars) |
| `DEMO_PASSWORD` | `password` | — | Password untuk semua akun demo |
| `MOCK_API_PORT` | `3001` | — | Host port untuk mock API |
| `FRONTEND_PORT` | `5173` | — | Host port untuk frontend |

---

## Commands

| Perintah | Deskripsi |
|----------|-----------|
| `docker compose up -d` | Start semua service di background |
| `docker compose down` | Stop semua service |
| `docker compose down -v` | Stop + hapus volume (reset database) |
| `docker compose logs -f` | Lihat logs real-time |
| `docker compose logs -f mock-api` | Log mock API saja |
| `docker compose logs -f frontend` | Log frontend saja |
| `docker compose build --no-cache` | Build ulang dari awal |
| `docker compose ps` | Status semua service |

---

## Akun Demo

Setiap container start, seeder otomatis menjalankan dan membuat data demo.

| Email | Password | Role | Status |
|-------|----------|------|--------|
| andika@stekom.ac.id | password | **admin** | approved |
| rudi@stekom.ac.id | password | karyawan | approved |
| siti@stekom.ac.id | password | karyawan | approved |
| budi@stekom.ac.id | password | karyawan | **pending** |
| dewi@stekom.ac.id | password | karyawan | approved |
| ani@stekom.ac.id | password | karyawan | approved |
| tono@stekom.ac.id | password | karyawan | approved |
| ferry@stekom.ac.id | password | karyawan | **pending** |

> **Password default:** `password` (bisa diubah via `DEMO_PASSWORD` di `.env`)

---

## Struktur Service

```
docker compose up -d
         │
         ├── mock-api (absenku-api)
         │   ├── Port: 3001
         │   ├── Seed: auto (setiap start)
         │   ├── Stack: Express 5 + json-server + better-auth + SQLite
         │   └── Healthcheck: GET /api/me → 401 (valid session required)
         │
         └── frontend (absenku-web)
             ├── Port: 5173 → 80 (internal nginx)
             ├── Stack: Vite build → nginx alpine
             └── Depends on: mock-api (healthcheck)
```

---

## Reset Database

```bash
# Hapus volume + restart (data hilang, seed ulang)
docker compose down -v
docker compose up -d
```

---

## Troubleshooting

### Frontend API call gagal (CORS / connection refused)

Pastikan service `mock-api` sudah siap:
```bash
docker compose logs mock-api
```
Tunggu sampai log menampilkan tabel akun demo.

### Port already in use

Ubah port di `.env`:
```env
MOCK_API_PORT=3002
FRONTEND_PORT=5174
```

### Build error: `better-sqlite3` native addon gagal

Pastikan Docker memiliki build tools yang cukup:
```bash
docker compose build --no-cache mock-api
```
