# Setup

## Prerequisites

| Software | Min Versi | Cek |
|----------|-----------|-----|
| Node.js | 18.x | `node -v` |
| pnpm | 9.x | `pnpm -v` |
| PostgreSQL | 17.x | — |
| Docker | 24.x | `docker -v` |
| Git | — | `git --version` |

## 1. Clone & Setup

```bash
git clone <repo> absenku
cd absenku
```

## 2. Dependencies (PostgreSQL + MinIO)

```bash
cd backend
docker compose -f docker-compose.dev.yml up -d
# → PostgreSQL :5432
# → MinIO     :9000 (API), :9001 (Console)
```

## 3. Backend

```bash
cd backend
pnpm install
cp .env.example .env      # sesuaikan DATABASE_URL
pnpm db:migrate:seed      # migrate + seed demo data
pnpm start:dev            # http://localhost:9090
```

## 4. Frontend

```bash
cd frontend
pnpm install
cp .env.example .env      # VITE_API_URL=http://localhost:9090
pnpm dev                  # http://localhost:5173
```

## Akun Demo

| Email | Password | Role | Status |
|-------|----------|------|--------|
| andika@stekom.ac.id | password | admin | approved |
| rudi@stekom.ac.id | password | karyawan | approved |
| siti@stekom.ac.id | password | karyawan | approved |
| budi@stekom.ac.id | password | karyawan | pending |
| dewi@stekom.ac.id | password | karyawan | approved |
| ani@stekom.ac.id | password | karyawan | approved |
| tono@stekom.ac.id | password | karyawan | approved |
| ferry@stekom.ac.id | password | karyawan | pending |

## Environment Variables

| File | Variable | Default |
|------|----------|---------|
| `frontend/.env` | `VITE_API_URL` | `http://localhost:9090` |
| `frontend/.env` | `VITE_APP_RELEASE_DATE` | `2026-07-13` |
| `backend/.env` | `DATABASE_URL` | `postgresql://absenku:absenku@localhost:5432/absenku` |
| `backend/.env` | `BETTER_AUTH_SECRET` | (min 32 chars) |
| `backend/.env` | `BETTER_AUTH_URL` | `http://localhost:9090` |
| `backend/.env` | `CORS_ORIGIN` | `http://localhost:5173` |
| `backend/.env` | `MINIO_ENDPOINT` | `http://localhost:9000` |
| `backend/.env` | `MINIO_PUBLIC_URL` | `http://localhost:9000` |
| `backend/.env` | `MINIO_ACCESS_KEY` | `minioadmin` |
| `backend/.env` | `MINIO_SECRET_KEY` | `minioadmin` |

## Scripts Backend

| Perintah | Fungsi |
|----------|--------|
| `pnpm start:dev` | Watch mode |
| `pnpm test` | Unit tests (Jest) |
| `pnpm lint` | ESLint |
| `pnpm db:generate` | Generate migration dari schema |
| `pnpm db:migrate` | Apply pending migrations |
| `pnpm db:seed` | Seed demo data (idempotent, auto-repair) |
| `pnpm db:migrate:seed` | Migrate + seed |
| `pnpm db:fresh` | Reset ALL + migrate + seed |

## Troubleshooting

| Masalah | Solusi |
|---------|--------|
| **Port 9090 dipakai** | Ubah `PORT` di `backend/.env` |
| **Route tree tidak muncul** | Hapus `frontend/src/routeTree.gen.ts` → restart Vite |
| **Seed gagal** | Cek `DATABASE_URL` + PostgreSQL running |
| **MinIO upload gagal** | Cek `docker compose -f backend/docker-compose.dev.yml up -d` |
| **Module not found** | `pnpm install` di folder yang benar |
