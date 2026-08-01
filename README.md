<h1 align="center">AbsenKu</h1>

<p align="center">
  <strong>Sistem Absensi Karyawan</strong><br>
  <em>Employee Attendance System with Face Verification</em>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black" alt="React">
  <img src="https://img.shields.io/badge/NestJS-11-E0234E?style=flat-square&logo=nestjs&logoColor=white" alt="NestJS">
  <img src="https://img.shields.io/badge/TypeScript-6-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/PostgreSQL-17-4169E1?style=flat-square&logo=postgresql&logoColor=white" alt="PostgreSQL">
  <img src="https://img.shields.io/badge/Docker-24-2496ED?style=flat-square&logo=docker&logoColor=white" alt="Docker">
  <img src="https://img.shields.io/badge/Bun-1-FBF0DF?style=flat-square&logo=bun&logoColor=black" alt="Bun">
</p>

---

## Features / Fitur

| Fitur | Karyawan | Admin |
|-------|:--------:|:-----:|
| Check-in / Check-out + verifikasi wajah | ✅ | — |
| Dashboard personal (statistik kehadiran) | ✅ | — |
| Riwayat absensi dengan filter & kalender | ✅ | ✅ |
| Pengajuan cuti, izin, sakit | ✅ | ✅ |
| Approve / reject pengajuan | — | ✅ |
| Dashboard admin (tren, rekap, verifikasi) | — | ✅ |
| Kelola & verifikasi karyawan | — | ✅ |
| Ekspor data ke XLSX | ✅ | ✅ |

---

## Quick Start / Mulai Cepat

### Production (Docker Compose)

> Butuh: Docker ≥ 24.x + PostgreSQL eksternal

```bash
# 1. Clone
git clone https://github.com/MAHMETT/absenku.git
cd absenku

# 2. Setup environment
cp .env.example .env
# Isi: DATABASE_URL, BETTER_AUTH_SECRET, MINIO_*, dll

# 3. Start
docker compose up -d

# 4. Buka
open http://localhost
```

| Service | URL |
|---------|-----|
| Frontend | `http://localhost` |
| Backend API | `http://localhost:9090` |
| MinIO Console | `http://localhost:9001` (internal only) |

### Development (Manual)

> Butuh: Bun ≥ 1.x, Docker (untuk PostgreSQL + MinIO)

```bash
# 1. Start dependencies
cd backend && docker compose -f docker-compose.dev.yml up -d && cd ..

# 2. Install + migrate + seed
cd backend && bun install && bun run db:migrate:seed && cd ..
cd frontend && bun install && cd ..

# 3. Start backend (terminal 1)
cd backend && bun run start:dev    # http://localhost:9090

# 4. Start frontend (terminal 2)
cd frontend && bun dev             # http://localhost:5173
```

---

## Architecture / Arsitektur

```
┌─────────────────────────────────────────────────────────────┐
│                        Client Browser                        │
└────────────────────────────┬────────────────────────────────┘
                             │
                    ┌────────▼────────┐
                    │     Frontend    │
                    │  React + Vite   │
                    │  Port: 80/5173  │
                    └────────┬────────┘
                             │  REST API
                    ┌────────▼────────┐
                    │     Backend     │
                    │ NestJS + Bun    │
                    │  Port: 9090     │
                    └───┬─────────┬───┘
                        │         │
              ┌─────────▼──┐  ┌──▼─────────┐
              │ PostgreSQL  │  │   MinIO    │
              │    (17)     │  │  (S3)     │
              └─────────────┘  └────────────┘
```

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 19, TypeScript 6, Vite 8, Tailwind CSS 4, shadcn/ui |
| **Routing** | TanStack Router (auto code-splitting, role guards) |
| **State** | TanStack Query 5 (server state), Axios |
| **Auth** | Better Auth (cookie session) |
| **Face Recognition** | face-api.js (tinyFaceDetector) |
| **Charts** | Recharts 3 |
| **Export** | ExcelJS 4.4 (XLSX) |
| **Backend** | NestJS 11, Drizzle ORM, Zod 4 |
| **Database** | PostgreSQL 17 |
| **Object Storage** | MinIO (S3-compatible) |
| **Runtime** | Bun |
| **Infra** | Docker Compose, Dokploy |

---

## Project Structure

```
absenku/
├── backend/                # NestJS API
│   ├── src/
│   │   ├── auth/           # Better Auth + rate limiter
│   │   ├── users/          # User management
│   │   ├── absensi/        # Attendance logic + rules
│   │   ├── pengajuan/      # Leave/permit submissions
│   │   ├── dashboard/      # Analytics & stats
│   │   ├── storage/        # MinIO file upload
│   │   ├── database/       # Drizzle schema + providers
│   │   └── seed/           # Demo data seeder
│   └── drizzle/            # Migration files
├── frontend/               # React SPA
│   └── src/
│       ├── api/            # Axios service per domain
│       ├── components/     # UI components (shadcn, shared, layout)
│       ├── hooks/          # TanStack Query hooks
│       ├── lib/            # Utilities, constants, validation
│       ├── pages/          # Page components
│       ├── routes/         # TanStack Router (nested layouts)
│       └── types/          # TypeScript interfaces
└── docs/                   # Documentation
    ├── SETUP.md
    ├── ARCHITECTURE.md
    ├── API.md
    ├── DOCKER.md
    └── DOKPLOY.md
```

---

## Demo Accounts / Akun Demo

Password diatur via env `DEMO_PASSWORD`.

| Email | Password | Role | Status |
|-------|----------|------|--------|
| andika@stekom.ac.id | `DEMO_PASSWORD` | **admin** | approved |
| rudi@stekom.ac.id | `DEMO_PASSWORD` | karyawan | approved |
| siti@stekom.ac.id | `DEMO_PASSWORD` | karyawan | approved |
| dewi@stekom.ac.id | `DEMO_PASSWORD` | karyawan | approved |
| ani@stekom.ac.id | `DEMO_PASSWORD` | karyawan | approved |
| tono@stekom.ac.id | `DEMO_PASSWORD` | karyawan | approved |
| budi@stekom.ac.id | `DEMO_PASSWORD` | karyawan | pending |
| ferry@stekom.ac.id | `DEMO_PASSWORD` | karyawan | pending |

---

## Deployment

| Method | Docs |
|--------|------|
| Docker Compose (manual) | [DOCKER.md](docs/DOCKER.md) |
| Dokploy | [DOKPLOY.md](docs/DOKPLOY.md) |

---

## Documentation / Dokumentasi

| Dokumen | Description | Description (EN) |
|---------|-------------|-------------------|
| [SETUP.md](docs/SETUP.md) | Instalasi detail, env, troubleshooting | Detailed installation, env config |
| [ARCHITECTURE.md](docs/ARCHITECTURE.md) | Tech stack, struktur, alur data | Tech stack, structure, data flow |
| [API.md](docs/API.md) | Semua endpoint + format response | All endpoints + response format |
| [DOCKER.md](docs/DOCKER.md) | Panduan Docker lengkap | Docker deployment guide |
| [DOKPLOY.md](docs/DOKPLOY.md) | Deploy ke Dokploy | Deploy to Dokploy |

---

## License

MIT
