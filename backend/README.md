# AbsenKu Backend

Backend API absensi karyawan — NestJS 11 + PostgreSQL + Drizzle ORM + Better Auth.

---

## Tech Stack

| Layer | Teknologi |
|-------|-----------|
| Framework | NestJS 11 |
| Language | TypeScript 5.7 (strict) |
| Database | PostgreSQL 17 |
| ORM | Drizzle ORM |
| Auth | Better Auth (cookie session) |
| Validation | Zod 4 |
| File Storage | MinIO (S3-compatible) |
| Rate Limiting | In-memory Map |
| Testing | Jest (unit) + Supertest (E2E) |
| Linter | ESLint + typescript-eslint |
| Container | Docker Compose |

---

## Prerequisites

| Tool | Version | Untuk |
|------|---------|-------|
| Node.js | ≥ 18.x | Runtime |
| pnpm | ≥ 9.x | Package manager |
| Docker | ≥ 24.x | PostgreSQL + MinIO |
| PostgreSQL 17 | — | Database (via Docker) |
| MinIO | latest | File storage (via Docker) |

---

## Setup

### 1. Start Dependencies

```bash
# PostgreSQL + MinIO dalam 1 command
docker compose -f docker-compose.dev.yml up -d
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Environment

Copy `.env` (already provided dengan default untuk development):
```env
PORT=9090
DATABASE_URL=postgresql://absenku:absenku@localhost:5432/absenku
BETTER_AUTH_SECRET=change-this-in-production-min-32-chars
BETTER_AUTH_URL=http://localhost:9090
CORS_ORIGIN=http://localhost:5173
MINIO_ENDPOINT=http://localhost:9000
MINIO_PUBLIC_URL=http://localhost:9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
```

### 4. Migrate & Seed

```bash
# Apply database migrations
pnpm db:migrate

# (Opsional) Seed demo data
pnpm db:seed
```

### 5. Start Development Server

```bash
pnpm start:dev
```

API berjalan di `http://localhost:9090`.

---

## Scripts

| Perintah | Fungsi |
|----------|--------|
| `pnpm start:dev` | Watch mode (development) |
| `pnpm start:prod` | Production mode |
| `pnpm build` | Compile TypeScript |
| `pnpm test` | Unit tests (Jest) |
| `pnpm test:e2e` | E2E tests (Supertest) |
| `pnpm test:cov` | Unit tests + coverage |
| `pnpm lint` | ESLint |
| `pnpm db:generate` | Generate Drizzle migration from schema |
| `pnpm db:migrate` | Apply pending migrations |
| `pnpm db:push` | Push schema to DB (dev only) |
| `pnpm db:seed` | Seed demo data |

---

## Environment Variables

| Variable | Default | Wajib | Deskripsi |
|----------|---------|-------|-----------|
| `PORT` | `9090` | — | Port server |
| `NODE_ENV` | `development` | — | Environment |
| `DATABASE_URL` | — | ✅ | PostgreSQL connection string |
| `BETTER_AUTH_SECRET` | — | ✅ | Secret key (min 32 chars) |
| `BETTER_AUTH_URL` | `http://localhost:9090` | — | Backend URL untuk Better Auth |
| `CORS_ORIGIN` | `http://localhost:5173` | — | Origin yang diizinkan |
| `DEMO_PASSWORD` | `password` | — | Password untuk akun demo |
| `APP_RELEASE_DATE` | `2026-07-13` | — | Tanggal rilis aplikasi |
| `MINIO_ENDPOINT` | `http://localhost:9000` | — | Endpoint MinIO S3 API |
| `MINIO_PUBLIC_URL` | `http://localhost:9000` | — | URL publik untuk akses file |
| `MINIO_ACCESS_KEY` | `minioadmin` | — | Access key MinIO |
| `MINIO_SECRET_KEY` | `minioadmin` | — | Secret key MinIO |

---

## Project Structure

```
src/
├── attendance-categories.ts    # Shared category helpers
├── common/                     # Shared infrastructure
│   ├── decorators/             # @CurrentUser(), @Roles()
│   ├── filters/                # HttpExceptionFilter
│   ├── guards/                 # AuthGuard, RolesGuard
│   ├── pipes/                  # ZodValidationPipe
│   └── utils.ts                # fmtDate(), dll
├── config/
│   └── env.config.ts           # Zod schema validasi env
├── database/
│   ├── database.module.ts      # Global module
│   ├── database.providers.ts   # PG pool + Drizzle factory
│   └── schema/                 # Drizzle table definitions
│       ├── auth.schema.ts      # user, session, account, verification
│       ├── absensi.schema.ts
│       └── pengajuan.schema.ts
├── auth/                       # Auth module
│   ├── auth.controller.ts      # POST /api/register
│   ├── auth.instance.ts        # Better Auth singleton
│   ├── auth.module.ts
│   ├── auth.rate-limiter.ts    # Login + Register rate limiter
│   ├── auth.register.schema.ts # Zod schema
│   └── auth.service.ts
├── users/                      # Users module
│   ├── users.controller.ts     # /users, /api/users/*
│   ├── users.service.ts
│   └── users.schema.ts
├── absensi/                    # Absensi module
│   ├── absensi.controller.ts   # /absensi, /api/absensi/search
│   ├── absensi.service.ts
│   ├── absensi.schema.ts
│   └── absensi.rules.ts        # Check-in/out time rules
├── pengajuan/                  # Pengajuan module
│   ├── pengajuan.controller.ts # /pengajuan
│   ├── pengajuan.service.ts
│   └── pengajuan.schema.ts
├── dashboard/                  # Dashboard module
│   ├── dashboard.controller.ts # /api/dashboard/*
│   └── dashboard.service.ts
├── storage/                    # File storage module
│   ├── storage.controller.ts   # POST /api/upload/foto
│   ├── storage.service.ts      # MinIO S3 client
│   └── storage.module.ts
├── seed/                       # Seed system
│   ├── seed.service.ts
│   ├── seed.data.ts
│   └── seed.ts                 # CLI entry: ts-node src/seed/seed.ts
├── main.ts                     # Entry point
└── migrate.ts                  # Drizzle migrator
```

---

## API Endpoints

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| `POST` | `/api/auth/sign-in/email` | — | — | Login |
| `POST` | `/api/auth/sign-out` | Required | — | Logout |
| `GET` | `/api/auth/get-session` | — | — | Cek session |
| `POST` | `/api/register` | Optional | — | Register akun baru |
| `GET` | `/api/me` | Required | — | Profile sendiri |
| `PATCH` | `/users/:id` | Required | Self | Update profile |
| `GET` | `/api/users/pending` | Required | Admin | User pending |
| `GET` | `/api/users/all` | Required | Admin | Semua user |
| `PATCH` | `/api/users/:id` | Required | Admin | Update user |
| `PATCH` | `/api/users/:id/status` | Required | Admin | Approve/reject |
| `POST` | `/api/users/:id/notes` | Required | Admin | Tambah catatan |
| `DELETE` | `/api/users/:id` | Required | Admin | Hapus user |
| `POST` | `/absensi` | Required | — | Check-in |
| `PATCH` | `/absensi/:id` | Required | — | Check-out |
| `GET` | `/absensi` | Required | — | Riwayat absensi |
| `GET` | `/api/absensi/search` | Required | — | Cari absensi by nama |
| `POST` | `/pengajuan` | Required | — | Buat pengajuan |
| `GET` | `/pengajuan` | Required | — | List pengajuan |
| `PATCH` | `/pengajuan/:id` | Required | Admin | Update status |
| `DELETE` | `/pengajuan/:id` | Required | Self | Hapus pengajuan |
| `GET` | `/api/dashboard/recent` | Required | — | 7 hari terakhir |
| `GET` | `/api/dashboard/admin/week` | Required | Admin | Tren 7 hari |
| `GET` | `/api/dashboard/month` | Required | — | Data bulanan |
| `POST` | `/api/upload/foto` | Required | — | Upload foto |

---

## Testing

```bash
# Semua unit tests
pnpm test

# File spesifik
pnpm test -- src/absensi/absensi.service.spec.ts

# E2E tests (butuh PostgreSQL running)
pnpm test:e2e
```

**Coverage:** 41 unit tests, 6 test suites.

---

## Demo Akun

| Email | Password | Role | Status |
|-------|----------|------|--------|
| andika@stekom.ac.id | password | admin | approved |
| rudi@stekom.ac.id | password | karyawan | approved |
| siti@stekom.ac.id | password | karyawan | approved |
| dewi@stekom.ac.id | password | karyawan | approved |
| ani@stekom.ac.id | password | karyawan | approved |
| tono@stekom.ac.id | password | karyawan | approved |
| budi@stekom.ac.id | password | karyawan | pending |
| ferry@stekom.ac.id | password | karyawan | pending |

---

## Docker

### Development (PostgreSQL + MinIO saja)

```bash
docker compose -f docker-compose.dev.yml up -d
```

### Full Stack (PostgreSQL + Backend + Frontend)

```bash
# Dari root project
cd ..
docker compose up -d
```

---

## Dokumentasi

| Dokumen | Lokasi |
|---------|--------|
| PRD | `docs/PRD.md` |
| API Reference | `docs/API.md` (project root) |
| Architecture | `docs/ARCHITECTURE.md` (project root) |
