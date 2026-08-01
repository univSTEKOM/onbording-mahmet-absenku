<h1 align="center">AbsenKu Backend</h1>

<p align="center">
  <strong>REST API for Attendance System</strong><br>
  <em>NestJS + PostgreSQL + Drizzle ORM + Better Auth</em>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/NestJS-11-E0234E?style=flat-square&logo=nestjs&logoColor=white" alt="NestJS">
  <img src="https://img.shields.io/badge/TypeScript-6-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/PostgreSQL-17-4169E1?style=flat-square&logo=postgresql&logoColor=white" alt="PostgreSQL">
  <img src="https://img.shields.io/badge/Drizzle_ORM-0.45-C5F641?style=flat-square&logo=drizzle&logoColor=black" alt="Drizzle ORM">
  <img src="https://img.shields.io/badge/Better_Auth-1.6-FF6B35?style=flat-square" alt="Better Auth">
  <img src="https://img.shields.io/badge/Bun-1-FBF0DF?style=flat-square&logo=bun&logoColor=black" alt="Bun">
</p>

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | NestJS 11 |
| Language | TypeScript 6 (strict) |
| Runtime | Bun |
| Database | PostgreSQL 17 |
| ORM | Drizzle ORM |
| Auth | Better Auth (cookie session, Drizzle adapter) |
| Validation | Zod 4 |
| File Storage | MinIO (S3-compatible) |
| Rate Limiting | In-memory Map |
| Testing | Jest (unit) + Supertest (E2E) |
| Linter | ESLint + typescript-eslint |

---

## Quick Start

```bash
# 1. Start dependencies (PostgreSQL + MinIO)
docker compose -f docker-compose.dev.yml up -d

# 2. Install dependencies
bun install

# 3. Migrate + seed
bun run db:migrate:seed

# 4. Start dev server
bun run start:dev
```

API running at `http://localhost:9090`.

---

## Scripts

| Command | Description |
|---------|-------------|
| `bun run start:dev` | Watch mode (development) |
| `bun run start:prod` | Production mode |
| `bun run build` | Compile TypeScript → `dist/` |
| `bun run test` | Unit tests (Jest) |
| `bun run test:e2e` | E2E tests (Supertest) |
| `bun run test:cov` | Unit tests + coverage |
| `bun run lint` | ESLint |
| `bun run db:generate` | Generate Drizzle migration from schema |
| `bun run db:migrate` | Apply pending migrations |
| `bun run db:push` | Push schema to DB (dev only) |
| `bun run db:seed` | Seed demo data |
| `bun run db:migrate:seed` | Migrate + seed (production) |
| `bun run db:fresh` | Drop ALL + migrate + seed (dev) |

---

## Environment Variables

| Variable | Default | Required | Description |
|----------|---------|:--------:|-------------|
| `PORT` | `9090` | — | Server port |
| `NODE_ENV` | `development` | — | Environment |
| `DATABASE_URL` | — | ✅ | PostgreSQL connection string |
| `BETTER_AUTH_SECRET` | — | ✅ | Secret key (min 32 chars) |
| `BETTER_AUTH_URL` | `http://localhost:9090` | — | Backend URL for Better Auth |
| `CORS_ORIGIN` | `http://localhost:5173` | — | Allowed origin |
| `DEMO_PASSWORD` | `password` | — | Password for demo accounts |
| `APP_RELEASE_DATE` | `2026-07-13` | — | Application release date |
| `MINIO_ENDPOINT` | `http://localhost:9000` | — | MinIO S3 API endpoint |
| `MINIO_PUBLIC_URL` | `http://localhost:9000` | — | Public URL for file access |
| `MINIO_ACCESS_KEY` | `minioadmin` | — | MinIO access key |
| `MINIO_SECRET_KEY` | `minioadmin` | — | MinIO secret key |
| `MINIO_BUCKET_FOTO` | `absenku-foto` | — | Bucket for profile photos |
| `MINIO_BUCKET_ABSENSI` | `absenku-absensi` | — | Bucket for attendance photos |

---

## Project Structure

```
src/
├── main.ts                     # Entry point
├── app.module.ts               # Root module
├── migrate.ts                  # Drizzle migrator
├── reset.ts                    # Database reset
├── attendance-categories.ts    # Shared category helpers
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
├── database/                   # Database layer
│   ├── database.module.ts      # Global module
│   ├── database.providers.ts   # PG pool + Drizzle factory
│   └── schema/                 # Drizzle table definitions
│       ├── auth.schema.ts      # user, session, account, verification
│       ├── absensi.schema.ts
│       └── pengajuan.schema.ts
├── common/                     # Shared infrastructure
│   ├── decorators/             # @CurrentUser(), @Roles()
│   ├── filters/                # HttpExceptionFilter
│   ├── guards/                 # AuthGuard, RolesGuard
│   ├── pipes/                  # ZodValidationPipe
│   └── utils.ts                # fmtDate(), dll
├── config/
│   └── env.config.ts           # Zod schema validasi env
└── seed/                       # Seed system
    ├── seed.service.ts
    ├── seed.data.ts
    └── seed.ts                 # CLI entry
```

---

## Request Flow

```
Client Request
      │
      ▼
┌─────────────────┐
│   Rate Limiter  │  ← /api/auth/sign-in/email, /api/register
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Auth Guard    │  ← Session cookie → Better Auth
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Controller    │  ← Request validation (Zod)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│    Service      │  ← Business logic + rules engine
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Drizzle ORM    │  ← Query builder
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   PostgreSQL    │
└─────────────────┘

File Upload Path:
Client → Controller → StorageService → MinIO (S3)
```

---

## API Endpoints

| Method | Endpoint | Auth | Role | Description |
|--------|----------|:----:|------|-------------|
| `POST` | `/api/auth/sign-in/email` | — | — | Login |
| `POST` | `/api/auth/sign-out` | ✅ | — | Logout |
| `GET` | `/api/auth/get-session` | — | — | Get session |
| `POST` | `/api/register` | — | — | Register new account |
| `GET` | `/api/me` | ✅ | — | Current user profile |
| `PATCH` | `/users/:id` | ✅ | Self | Update profile |
| `GET` | `/api/users/pending` | ✅ | Admin | Pending users |
| `GET` | `/api/users/all` | ✅ | Admin | All users |
| `PATCH` | `/api/users/:id` | ✅ | Admin | Update user |
| `PATCH` | `/api/users/:id/status` | ✅ | Admin | Approve/reject |
| `POST` | `/api/users/:id/notes` | ✅ | Admin | Add notes |
| `DELETE` | `/api/users/:id` | ✅ | Admin | Delete user |
| `POST` | `/absensi` | ✅ | — | Check-in |
| `PATCH` | `/absensi/:id` | ✅ | — | Check-out |
| `GET` | `/absensi` | ✅ | — | Attendance history |
| `GET` | `/api/absensi/search` | ✅ | — | Search attendance |
| `POST` | `/pengajuan` | ✅ | — | Create submission |
| `GET` | `/pengajuan` | ✅ | — | List submissions |
| `PATCH` | `/pengajuan/:id` | ✅ | Admin | Update status |
| `DELETE` | `/pengajuan/:id` | ✅ | Self | Delete submission |
| `GET` | `/api/dashboard/recent` | ✅ | — | Last 7 days |
| `GET` | `/api/dashboard/admin/week` | ✅ | Admin | 7-day trend |
| `GET` | `/api/dashboard/month` | ✅ | — | Monthly data |
| `POST` | `/api/upload/foto` | ✅ | — | Upload photo |

---

## Testing

```bash
# All unit tests
bun run test

# Specific file
bun run test -- src/absensi/absensi.service.spec.ts

# E2E tests (requires PostgreSQL)
bun run test:e2e

# Coverage
bun run test:cov
```

**Stats:** 41 unit tests, 6 test suites.

---

## Docker

### Development (dependencies only)

```bash
docker compose -f docker-compose.dev.yml up -d
# → PostgreSQL :5432
# → MinIO     :9000 (API), :9001 (Console)
```

### Full Stack

See [root README](../README.md) for complete Docker Compose setup.

---

## Documentation

| Document | Description |
|----------|-------------|
| [PRD.md](docs/PRD.md) | Product requirements |
| [API.md](docs/API.md) | API reference |
| [ARCHITECTURE.md](../docs/ARCHITECTURE.md) | Architecture overview |
| [DOCKER.md](../docs/DOCKER.md) | Docker deployment |
| [DOKPLOY.md](../docs/DOKPLOY.md) | Dokploy deployment |
