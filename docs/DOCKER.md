# Docker Setup

## Prerequisites

- Docker Engine ≥ 24.x
- Docker Compose ≥ 2.x
- PostgreSQL eksternal (production) — atau via `backend/docker-compose.dev.yml` (dev)
- Git

## Production: Full Stack

```bash
# 1. Clone repository
git clone <repo-url>
cd absenku

# 2. Setup .env
cp .env.example .env
# Isi: DATABASE_URL (PostgreSQL eksternal), BETTER_AUTH_SECRET, dll

# 3. Start
docker compose up -d

# 4. Cek status
docker compose ps

# 5. Buka browser
open http://localhost:5173
```

## Port

| Service | Container Port | Host Port | URL |
|---------|---------------|-----------|-----|
| Frontend | 80 | 5173 | http://localhost:5173 |
| Backend | 9090 | 9090 | http://localhost:9090 |
| MinIO API | 9000 | 9000 | http://localhost:9000 |
| MinIO Console | 9001 | 9001 | http://localhost:9001 |

> PostgreSQL **tidak** disertakan di docker-compose production — pakai database eksternal via `DATABASE_URL`.

## Struktur Service

```
docker compose up -d
         │
         ├── backend (absenku-backend)
         │   ├── Port: 9090
         │   ├── Stack: NestJS 11 (node:20-alpine)
         │   ├── Startup: migrate → seed (skip/repair) → start
         │   └── Depends on: minio (healthy)
         │
         ├── minio (absenku-minio)
         │   ├── Ports: 9000 (API), 9001 (Console)
         │   ├── Healthcheck: /minio/health/live
         │   └── Volume: minio-data
         │
         └── frontend (absenku-web)
             ├── Port: 5173 → 80 (internal nginx)
             ├── Stack: Vite build → nginx alpine
             └── Depends on: backend
```

## Environment Variables

| Variable | Default | Wajib | Deskripsi |
|----------|---------|-------|-----------|
| `DATABASE_URL` | — | ✅ | PostgreSQL connection string (eksternal) |
| `BETTER_AUTH_SECRET` | — | ✅ | Secret key (min 32 chars) |
| `VITE_API_URL` | `http://localhost:9090` | — | Backend URL untuk frontend (build arg) |
| `CORS_ORIGIN` | `http://localhost:5173` | — | Origin yang diizinkan |
| `DEMO_PASSWORD` | `password` | — | Password akun demo (seed) |
| `APP_RELEASE_DATE` | `2026-07-13` | — | Tanggal rilis aplikasi |
| `MINIO_ROOT_USER` | `minioadmin` | — | Credential container MinIO |
| `MINIO_ROOT_PASSWORD` | `minioadmin` | — | Credential container MinIO |
| `MINIO_PUBLIC_URL` | `http://localhost:9000` | — | URL publik MinIO (browser) |
| `MINIO_ACCESS_KEY` | `minioadmin` | — | S3 access key (backend) |
| `MINIO_SECRET_KEY` | `minioadmin` | — | S3 secret key (backend) |
| `FRONTEND_PORT` | `5173` | — | Host port frontend |

## Commands

| Perintah | Deskripsi |
|----------|-----------|
| `docker compose up -d` | Start semua service |
| `docker compose down` | Stop semua service |
| `docker compose logs -f` | Lihat logs real-time |
| `docker compose build --no-cache` | Build ulang dari awal |
| `docker compose config` | Validasi compose file |

## Development: Dependencies Saja

```bash
cd backend
docker compose -f docker-compose.dev.yml up -d
# → PostgreSQL :5432
# → MinIO     :9000 (API), :9001 (Console)
```

## Reset Database (dev)

```bash
cd backend
bun run db:fresh   # Drop ALL + migrate + seed
```

## Troubleshooting

### Backend gagal start — DATABASE_URL

Pastikan `.env` terisi `DATABASE_URL` yang benar dan PostgreSQL eksternal bisa diakses dari container:
```bash
docker compose logs backend
```

### MinIO crash-looping — credential missing

MinIO versi terbaru butuh `MINIO_ROOT_PASSWORD` (bukan `MINIO_SECRET_KEY`):
```bash
docker compose logs minio
```

### Port already in use

Ubah port di `.env`:
```env
FRONTEND_PORT=5174
```

### Foto tidak muncul — MinIO PUBLIC URL salah

`MINIO_PUBLIC_URL` harus URL yang bisa diakses browser (bukan hostname internal docker):
```env
MINIO_PUBLIC_URL=http://localhost:9000
```
