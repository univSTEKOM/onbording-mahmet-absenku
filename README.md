# AbsenKu — Sistem Absensi Karyawan

Aplikasi absensi dengan dua peran (**Karyawan** & **Admin**), fitur check-in/out dengan verifikasi wajah, riwayat kehadiran, pengajuan cuti/izin, dashboard analitik, dan ekspor data.

---

## 🚀 Cara 1: Production (Docker Compose)

> Butuh: [Docker](https://docker.com) ≥ 24.x + [Docker Compose](https://docs.docker.com/compose/) ≥ 2.x + PostgreSQL eksternal

```bash
# 1. Setup .env (copy dari template di bawah)
cp .env.example .env   # lalu isi DATABASE_URL, BETTER_AUTH_SECRET, dll

# 2. Start semua service
docker compose up -d
```

| Akses | URL |
|-------|-----|
| Aplikasi | http://localhost:5173 |
| API | http://localhost:9090 |
| MinIO Console | http://localhost:9001 |

Service: **backend** (NestJS) + **minio** (file storage) + **frontend** (nginx). PostgreSQL dijalankan eksternal — `DATABASE_URL` diisi di `.env`.

Backend otomatis: migrate → seed (skip/repair data) → start.

---

## 🖥 Cara 2: Development Manual

> Butuh: [Bun](https://bun.sh) ≥ 1.x, PostgreSQL 17, MinIO

```bash
# 1. Start PostgreSQL + MinIO (via backend docker-compose dev)
cd backend
docker compose -f docker-compose.dev.yml up -d

# 2. Migrate + seed
pnpm install
pnpm db:migrate:seed

# 3. Terminal 1 — Backend
pnpm start:dev        # http://localhost:9090

# 4. Terminal 2 — Frontend
cd frontend
pnpm install
pnpm dev              # http://localhost:5173
```

---

## 🔐 Akun Demo (seed)

| Email | Password | Role | Status |
|-------|----------|------|--------|
| andika@stekom.ac.id | password | **admin** | approved |
| rudi@stekom.ac.id | password | karyawan | approved |
| siti@stekom.ac.id | password | karyawan | approved |
| budi@stekom.ac.id | password | karyawan | pending |
| dewi@stekom.ac.id | password | karyawan | approved |
| ani@stekom.ac.id | password | karyawan | approved |
| tono@stekom.ac.id | password | karyawan | approved |
| ferry@stekom.ac.id | password | karyawan | pending |

Password bisa diubah via env `DEMO_PASSWORD`.

---

## 🧰 Tech Stack

**Frontend:** React 19 · TypeScript 6 · Vite 8 · Tailwind 4 · shadcn/ui · TanStack Router · TanStack Query · Recharts 3 · face-api.js

**Backend:** NestJS 11 · PostgreSQL · Drizzle ORM · Better Auth · MinIO · Zod

**Tools:** pnpm · Docker Compose · Jest · ESLint

---

## 📖 Dokumentasi

| Dokumen | Untuk |
|---------|-------|
| [SETUP.md](docs/SETUP.md) | Instalasi detail, env, troubleshooting |
| [ARCHITECTURE.md](docs/ARCHITECTURE.md) | Tech stack, struktur, alur data |
| [API.md](docs/API.md) | Semua endpoint + format response |
| [PRD.md](backend/docs/PRD.md) | Visi produk, fitur, keputusan |
| [DOCKER.md](docs/DOCKER.md) | Panduan Docker lengkap |
| [DOKPLOY.md](docs/DOKPLOY.md) | Deploy ke Dokploy |
