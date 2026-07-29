# Backend PRD — AbsenKu (NestJS)

**Versi:** 1.0 | **Status:** Draft | **Target:** Replace mock-api

---

## 1. Project Overview

### 1.1 Visi

Backend API absensi karyawan yang **type-safe**, **testable**, dan **maintainable** menggunakan NestJS + PostgreSQL. Menggantikan `mock-api` (Express 5 + json-server + SQLite) yang sudah tidak sustainable untuk development lanjutan.

### 1.2 Tujuan

- API konsisten (format response, error, pagination)
- Type safety end-to-end (Zod validation, Drizzle ORM, TypeScript strict)
- Test coverage tinggi (unit + E2E)
- Architecture modular dan maintainable
- Siap untuk production deployment

### 1.3 Target Pengguna

| Persona | Deskripsi |
|---------|-----------|
| **Karyawan** | Check-in/out, riwayat, pengajuan cuti/izin/sakit |
| **Admin HR** | Verifikasi user, kelola karyawan, approve/reject pengajuan, lihat dashboard |

### 1.4 Scope

- Implementasi ulang **semua endpoint** dari `mock-api` (Auth, Users, Absensi, Pengajuan, Dashboard)
- **Database migration**: SQLite + db.json → PostgreSQL
- **Auth migration**: Better Auth (SQLite) → Better Auth (PostgreSQL)
- **New**: Swagger docs, test coverage (unit + E2E), seed system, rate limiting via `@nestjs/throttler`, file storage via MinIO

---

## 2. Tech Stack

### 2.1 Technology Choices

| Layer | Teknologi | Alasan |
|-------|-----------|--------|
| Framework | NestJS 11 | Modular, decorator-based, enterprise patterns |
| Language | TypeScript 5.7 | Strict mode, type safety |
| Database | PostgreSQL | Production-ready, relasional, migrate from SQLite |
| ORM | Drizzle ORM | TypeScript-first, ringan, familiar dari mock-api |
| Auth | Better Auth | Cookie session, sama dengan frontend, support PostgreSQL via Drizzle adapter |
| Validation | Zod 4 | Reusable schemas, bisa dishare dengan frontend |
| Config | `@nestjs/config` | Environment validation, `.env` loading |
| Rate Limiting | `@nestjs/throttler` | Decorator-based, support Redis store |
| File Storage | MinIO (via Docker) | S3-compatible object storage untuk development |
| API Docs | `@nestjs/swagger` | Auto-generate OpenAPI spec |
| Testing | Jest + Supertest | Unit: Jest, E2E: Supertest + Testcontainers |
| Logging | NestJS Logger (built-in) | Ringan, cukup untuk kebutuhan saat ini |
| Migrations | Drizzle Kit | `drizzle-kit generate` + `drizzle-kit migrate` |
| Container | Docker Compose | `backend/docker-compose.dev.yml` untuk dev |

### 2.2 Dependencies

```json
{
  "dependencies": {
    "@nestjs/common": "^11.0.1",
    "@nestjs/core": "^11.0.1",
    "@nestjs/platform-express": "^11.0.1",
    "@nestjs/config": "^4.0.0",
    "@nestjs/swagger": "^11.0.0",
    "@nestjs/throttler": "^6.0.0",
    "reflect-metadata": "^0.2.2",
    "rxjs": "^7.8.1",
    "better-auth": "^1.6.23",
    "drizzle-orm": "^0.45.2",
    "pg": "^8.13.0",
    "zod": "^4.4.3",
    "@aws-sdk/client-s3": "^3.0.0"
  },
  "devDependencies": {
    "@nestjs/testing": "^11.0.1",
    "@types/express": "^5.0.0",
    "@types/jest": "^30.0.0",
    "@types/node": "^24.0.0",
    "@types/supertest": "^7.0.0",
    "drizzle-kit": "^0.30.0",
    "jest": "^30.0.0",
    "supertest": "^7.0.0",
    "testcontainers": "^10.0.0",
    "ts-jest": "^29.2.5",
    "ts-node": "^10.9.2",
    "typescript": "^5.7.3"
  }
}
```

### 2.3 Folder Structure

```
backend/
├── src/
│   ├── common/                          # Shared infrastructure
│   │   ├── guards/
│   │   │   ├── auth.guard.ts            #   Cek session valid via Better Auth
│   │   │   └── roles.guard.ts           #   Cek role: admin/karyawan
│   │   ├── decorators/
│   │   │   ├── current-user.decorator.ts #   @CurrentUser() — inject user from session
│   │   │   └── roles.decorator.ts        #   @Roles('admin') — set required roles
│   │   ├── pipes/
│   │   │   └── zod-validation.pipe.ts    #   Global Zod validation pipe
│   │   ├── filters/
│   │   │   └── http-exception.filter.ts  #   Standardized error → { success: false, error: {...} }
│   │   └── interceptors/
│   │       └── response.interceptor.ts   #   Standardized success → { success: true, data: {...} }
│   │
│   ├── config/
│   │   └── env.config.ts                # Zod schema for env validation
│   │
│   ├── database/
│   │   ├── database.module.ts           # Global module — exports Drizzle instance
│   │   ├── database.provider.ts         # PG pool + Drizzle factory
│   │   └── schema/
│   │       ├── index.ts                 # Export all tables
│   │       ├── auth.schema.ts           # Better Auth tables (user, session, account, verification)
│   │       ├── absensi.schema.ts
│   │       └── pengajuan.schema.ts
│   │
│   ├── auth/
│   │   ├── auth.module.ts
│   │   ├── auth.instance.ts             # Singleton better-auth() instance
│   │   ├── auth.controller.ts           # POST /api/register
│   │   ├── auth.service.ts              # Validasi, rate limit integration
│   │   └── dto/
│   │       └── register.schema.ts       # Zod schema for register
│   │
│   ├── users/
│   │   ├── users.module.ts
│   │   ├── users.controller.ts          # /users, /api/users/*, /api/me
│   │   ├── users.service.ts
│   │   └── dto/
│   │       ├── update-user.schema.ts
│   │       └── update-user-status.schema.ts
│   │
│   ├── absensi/
│   │   ├── absensi.module.ts
│   │   ├── absensi.controller.ts        # /absensi, /api/absensi/search
│   │   ├── absensi.service.ts
│   │   ├── absensi.rules.ts             # Check-in/out time rules + category logic
│   │   └── dto/
│   │       ├── check-in.schema.ts
│   │       └── check-out.schema.ts
│   │
│   ├── pengajuan/
│   │   ├── pengajuan.module.ts
│   │   ├── pengajuan.controller.ts      # /pengajuan
│   │   ├── pengajuan.service.ts
│   │   └── dto/
│   │       ├── create-pengajuan.schema.ts
│   │       └── update-pengajuan.schema.ts
│   │
│   ├── dashboard/
│   │   ├── dashboard.module.ts
│   │   ├── dashboard.controller.ts      # /api/dashboard/*
│   │   └── dashboard.service.ts
│   │
│   ├── attendance-categories/
│   │   ├── attendance-categories.module.ts
│   │   ├── attendance-categories.service.ts
│   │   └── categories.data.ts           # 17 category definitions
│   │
│   ├── storage/
│   │   ├── storage.module.ts
│   │   └── storage.service.ts           # MinIO/S3 file operations
│   │
│   ├── seed/
│   │   ├── seed.module.ts
│   │   ├── seed.service.ts              # 8 users + 1 month attendance + pengajuan
│   │   └── data/
│   │       ├── users.data.ts
│   │       ├── absensi.data.ts
│   │       └── pengajuan.data.ts
│   │
│   ├── app.module.ts
│   └── main.ts                          # Bootstrap + CORS + Global pipes/filters/interceptors
│
├── test/
│   ├── jest-e2e.json
│   └── app.e2e-spec.ts
│
├── drizzle/                             # Auto-generated migration files
│
├── docker-compose.dev.yml               # Local dev: PostgreSQL + MinIO
├── Dockerfile
├── nest-cli.json
├── package.json
├── tsconfig.json
├── tsconfig.build.json
└── .env
```

---

## 3. Architecture

### 3.1 Data Flow

```
Browser/Client
    │
    ▼
NestJS App (localhost:9090)
    │
    ├── /api/auth/*              →   toNodeHandler(betterAuth) [Express middleware]
    │   └── sign-in, sign-up, sign-out, get-session
    │
    ├── /api/register            →   AuthController + rate limit check
    │
    ├── /api/me                  →   UsersController
    ├── /users/*                 →   UsersController
    ├── /api/users/*             →   UsersController (Admin-only)
    │
    ├── /absensi/*               →   AbsensiController
    ├── /api/absensi/search      →   AbsensiController
    │
    ├── /pengajuan/*             →   PengajuanController
    │
    ├── /api/dashboard/*         →   DashboardController
    │
    └── /api/docs                →   Swagger UI
            │
            ▼
        Drizzle ORM (PostgreSQL via pg driver)
            │
            ▼
        PostgreSQL (eksternal via ~/Projects/docker/postgresql)
            │
            ▼
        MinIO (via Docker — file storage)
```

### 3.2 Better Auth Integration

Better Auth di-mount sebagai Express middleware di `main.ts` untuk semua route `/api/auth/*`. Endpoint khusus seperti `/api/register` (custom registration dengan profile fields) tetap menggunakan NestJS Controller dengan rate limit terpisah.

```
main.ts:
  app.use('/api/auth/sign-in/email', rateLimiterMiddleware)  // Rate limit wrapper
  app.use('/api/auth/*', toNodeHandler(auth))                 // Better Auth standard routes

  // /api/register → AuthController (rate limit + validasi + profile fields)
```

Auth Instance (singleton):

```typescript
// src/auth/auth.instance.ts
export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: 'pg', schema }),
  emailAndPassword: { enabled: true },
  user: {
    additionalFields: {
      role: { type: 'string', required: true, defaultValue: 'karyawan' },
      status: { type: 'string', required: true, defaultValue: 'pending' },
      jabatan: { type: 'string' },
      phone: { type: 'string' },
      alamat: { type: 'string' },
      faceDescriptor: { type: 'string' },
      rejectionNotes: { type: 'string' },  // JSON string
    },
  },
  trustedOrigins: [process.env.CORS_ORIGIN || 'http://localhost:5173'],
});
```

### 3.3 API Response Format

Semua response API menggunakan format terstruktur (via Global Interceptor + Exception Filter):

**Success (200/201):**
```json
{
  "success": true,
  "data": { ... }
}
```

**With Pagination:**
```json
{
  "success": true,
  "data": [ ... ],
  "meta": {
    "page": 1,
    "total": 100,
    "totalPages": 10
  }
}
```

**Error (4xx/5xx):**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Email sudah terdaftar",
    "details": [
      { "field": "email", "message": "Format email tidak valid" }
    ]
  }
}
```

**Error Codes:**

| Kode | HTTP Status | Deskripsi |
|------|-------------|-----------|
| `VALIDATION_ERROR` | 400 | Zod validation fail |
| `UNAUTHORIZED` | 401 | Tidak ada session / session expired |
| `FORBIDDEN` | 403 | Role tidak sesuai |
| `NOT_FOUND` | 404 | Resource tidak ditemukan |
| `CONFLICT` | 409 | Duplicate / sudah absen |
| `RATE_LIMIT` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Server error |

---

## 4. Database Schema

### 4.1 Auth Tables (Better Auth managed)

| Table | Source | Notes |
|-------|--------|-------|
| `user` | Better Auth | + custom fields: role, status, jabatan, phone, alamat, faceDescriptor, rejectionNotes |
| `session` | Better Auth | Cookie session management |
| `account` | Better Auth | Password + provider accounts |
| `verification` | Better Auth | Email verification (opsional) |

### 4.2 Absensi Table

```typescript
// src/database/schema/absensi.schema.ts

export const absensi = pgTable('absensi', {
  id: serial('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  tanggal: date('tanggal').notNull(),
  checkIn: timestamp('check_in', { withTimezone: true }),
  checkOut: timestamp('check_out', { withTimezone: true }),
  status: text('status').notNull(),
  // 'hadir' | 'terlambat' | 'pulang_cepat' | 'izin' | 'sakit' | 'cuti' | 'tidakHadir' | 'checkInOnly'
  mainCategory: text('main_category'),
  // 'physical_present' | 'absent_permit' | 'absent_unpermit'
  subCategory: text('sub_category'),
  faceVerified: boolean('face_verified').default(false),
  photos: jsonb('photos').default('[]'),
  // [{ type: 'check_in'|'check_out', url: string, capturedAt: string }]
  keterangan: text('keterangan').default(''),
  createdAt: timestamp('created_at').defaultNow(),
});

// Indexes for query performance
export const absensiUserIdIdx = index('absensi_user_id_idx').on(absensi.userId);
export const absensiTanggalIdx = index('absensi_tanggal_idx').on(absensi.tanggal);
export const absensiStatusIdx = index('absensi_status_idx').on(absensi.status);
```

### 4.3 Pengajuan Table

```typescript
// src/database/schema/pengajuan.schema.ts

export const pengajuan = pgTable('pengajuan', {
  id: serial('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  jenis: text('jenis').notNull(),
  // 'cuti' | 'izin' | 'sakit'
  tanggalMulai: date('tanggal_mulai').notNull(),
  tanggalSelesai: date('tanggal_selesai').notNull(),
  alasan: text('alasan').notNull(),
  status: text('status').default('pending'),
  // 'pending' | 'approved' | 'rejected'
  catatan: text('catatan').default(''),
  createdAt: timestamp('created_at').defaultNow(),
});

export const pengajuanUserIdIdx = index('pengajuan_user_id_idx').on(pengajuan.userId);
```

---

## 5. API Specifications

### 5.1 Authentication

#### `POST /api/auth/sign-in/email` — Login (Better Auth bawaan)

| Aspek | Detail |
|-------|--------|
| Auth | None |
| Rate Limit | @nestjs/throttler — 3 gagal → block (escalating 30s → 60s → 90s → max 120s) |
| Request | `{ email: string, password: string }` |
| Response | `{ user, session, token }` |

#### `POST /api/auth/sign-up/email` — Register (Better Auth bawaan)

> Endpoint ini tidak digunakan frontend. Frontend menggunakan `POST /api/register` yang custom.

#### `POST /api/auth/sign-out` — Logout (Better Auth bawaan)

| Auth | Required (cookie session) |
| Response | `{ success: true }` |

#### `GET /api/auth/get-session` — Cek Session (Better Auth bawaan)

| Auth | None |
| Response (login) | `{ user, session }` |
| Response (not login) | `{ user: null, session: null }` |

---

#### `POST /api/register` — Register Custom (AuthController)

| Aspek | Detail |
|-------|--------|
| Auth | Optional. Jika admin login, bisa set role manual. Publik → role dipaksa `karyawan`. |
| Rate Limit | @nestjs/throttler — max 5 percobaan per IP per 60 detik |
| Response 201 | `{ user: { id, email, name, role, status, jabatan, phone, alamat, createdAt } }` |

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "Password1",
  "nama": "User Baru",
  "jabatan": "Staff",
  "phone": "+6281234567890",
  "alamat": "Jl. Contoh No. 1"
}
```

**Validasi:**

| Field | Rule |
|-------|------|
| email | Required, max 100, format email valid |
| password | **Publik:** Required, min 8, max 50, harus uppercase + lowercase + digit. **Admin action:** skip validasi kompleksitas |
| nama | Required, max 100 |
| jabatan | Optional, max 100 |
| phone | Optional, 10-15 digit (numeric only), harus diawali `+` |
| alamat | Optional, max 500 |
| role | Optional. Jika caller admin → bisa di-set `admin`/`karyawan`. Publik → selalu `karyawan` |

**Logic:**
- Jika caller adalah admin (session valid + role admin) → role bisa di-set manual, status langsung `approved`
- Jika publik → role dipaksa `karyawan`, status `pending`
- Panggil `auth.api.signUpEmail()` → insert profile ke tabel user

---

### 5.2 Users

#### `GET /api/me` — Profile Lengkap

| Aspek | Detail |
|-------|--------|
| Auth | Required |
| Response | Full user object (merged: Better Auth user + custom fields, password dihapus) |

#### `PATCH /users/:id` — Update Profile (Self-service)

| Aspek | Detail |
|-------|--------|
| Auth | Required. Non-admin hanya bisa update diri sendiri. |
| Request | `{ nama?, jabatan?, phone?, alamat?, foto?, faceDescriptor?, email? }` |
| Response | Full user object |

**Logic:**
- Jika status user `rejected` → update otomatis reset ke `pending`, `rejectionNotes` dikosongkan
- Field `status`, `rejectionNotes`, `role`, `id`, `createdAt` dihapus dari body (tidak bisa diubah)

#### `GET /api/users/pending` — Daftar User Pending (Admin)

| Auth | Admin only |
| Response | `[User, ...]` — semua user dengan status `pending` |

#### `GET /api/users/all` — Semua User (Admin)

| Auth | Admin only |
| Response | `[User, ...]` |

#### `PATCH /api/users/:id` — Update User (Admin)

| Auth | Admin only |
| Request | `{ nama?, jabatan?, phone?, alamat?, role?, foto?, faceDescriptor?, email? }` |

**Catatan:** Perubahan di-sync ke Better Auth user table via Drizzle.

#### `PATCH /api/users/:id/status` — Approve / Reject User (Admin)

| Auth | Admin only |
| Request | `{ status: 'approved'|'rejected', note?: string }` |

**Logic:**
- Jika `approved` → kosongkan `rejectionNotes`
- Jika `rejected` → tambah note ke `rejectionNotes[]`
- Update status di profile table + Better Auth user table

#### `POST /api/users/:id/notes` — Tambah Catatan (Admin)

| Auth | Admin only |
| Request | `{ note: string (max 500 chars) }` |

#### `DELETE /api/users/:id` — Hapus User (Admin)

| Auth | Admin only |
| Note | Hapus dari Better Auth (accounts, sessions, user) + profile + absensi + pengajuan. **Permanent.** |

---

### 5.3 Absensi

#### `POST /absensi` — Check-in

| Aspek | Detail |
|-------|--------|
| Auth | Required. Non-admin hanya bisa check-in untuk diri sendiri. |
| Request | `{ userId, tanggal, checkIn?, photos?, faceVerified?, keterangan? }` |
| Response | Full Absensi object (server override `status`, `mainCategory`, `subCategory`) |

**Rules (di `absensi.rules.ts`):**
- Check-in window: **06:45–07:45**
- Sebelum 06:45 → `400: "Absensi dibuka pukul 06:45."`
- Sudah absen hari ini → `409: "Sudah absen hari ini"`
- Check-in sebelum 07:45 → `status: "hadir"`, `mainCategory: "physical_present"`, `subCategory: "physical_standard"`
- Check-in sesudah 07:45 → `status: "terlambat"`, `subCategory: "physical_violation"`

#### `PATCH /absensi/:id` — Check-out

| Aspek | Detail |
|-------|--------|
| Auth | Required. Non-admin hanya bisa check-out untuk diri sendiri. |
| Request | `{ checkOut: ISO string, photos? }` |
| Response | Full updated Absensi object |

**Rules:**
- Check-out sebelum 16:00 → `status: "pulang_cepat"`, `subCategory: "physical_violation"`
- Photos baru di-append ke array photos existing (check-in + check-out)

#### `GET /absensi` — List Absensi

| Aspek | Detail |
|-------|--------|
| Auth | Required. Non-admin hanya melihat data sendiri. |
| Params | `userId`, `tanggal`, `tanggal_gte`, `tanggal_lte`, `status[]`, `mainCategory[]`, `subCategory[]`, `_sort`, `_order`, `_page`, `_limit` |
| Response | `{ success: true, data: Absensi[], meta: { page, total, totalPages } }` |

#### `GET /api/absensi/search` — Search Absensi by Nama

| Aspek | Detail |
|-------|--------|
| Auth | Required |
| Params | Semua filter dari `GET /absensi` **plus** `q` (search by karyawan name) |
| Response | Sama pagination format |

---

### 5.4 Pengajuan

#### `POST /pengajuan` — Create

| Aspek | Detail |
|-------|--------|
| Auth | Required |
| Request | `{ userId, jenis: 'cuti'|'izin'|'sakit', tanggalMulai, tanggalSelesai, alasan }` |
| Response | Full Pengajuan object (auto-set `status: "pending"`, `catatan: ""`) |

#### `GET /pengajuan` — List

| Auth | Required. Non-admin hanya melihat milik sendiri. |
| Params | `userId`, `jenis`, `status` |

#### `PATCH /pengajuan/:id` — Update Status

| Auth | Required |
| Request | `{ status?: 'approved'|'rejected'|'pending', catatan?: string }` |
| Rules | Hanya `pending` yang bisa di-update. `catatan` max 500 chars. |

#### `DELETE /pengajuan/:id` — Hapus

| Auth | Required. Owner atau admin. |
| Rules | Hanya `pending` yang bisa dihapus. |

---

### 5.5 Dashboard

#### `GET /api/dashboard/recent` — 7 Hari Terakhir

| Aspek | Detail |
|-------|--------|
| Auth | Required |
| Query | `userId` (optional — admin bisa lihat user lain) |
| Range | 7 hari rolling: `(today-6)` sampai `today` |
| Response | `{ data: [{ tanggal, checkIn, checkOut, status }] }` |

#### `GET /api/dashboard/admin/week` — Tren Kehadiran 7 Hari (Admin)

| Aspek | Detail |
|-------|--------|
| Auth | Admin only |
| Range | 7 hari penuh sebelum hari ini: `(today-7)` sampai `(today-1)` |
| Response | `{ chart: AdminWeekChartItem[], summary: AdminWeekSummary }` |

**Chart Item:**
```json
{
  "name": "Sen",       // Day name (ID locale)
  "hadir": 10,
  "pulangCepat": 2,
  "terlambat": 1,
  "izin": 1,
  "sakit": 0,
  "cuti": 0,
  "tidakHadir": 2,
  "present": 13,
  "absentPermit": 1,
  "absentUnpermit": 2,
  "persen": 87
}
```

**Summary:**
```json
{
  "totalKaryawan": 15,
  "hadirHariIni": 10,
  "terlambatHariIni": 2,
  "izinHariIni": 1,
  "alfaHariIni": 2,
  "belumAbsen": 3,
  "totalAbsensiBulanIni": 210,
  "weekAvg": 83,
  "bestDay": { "name": "Sen", "persen": 87 },
  "presentMonth": 180,
  "permitMonth": 20,
  "unpermitMonth": 10
}
```

#### `GET /api/dashboard/month` — Data Bulanan (Kalender)

| Aspek | Detail |
|-------|--------|
| Auth | Required |
| Query | `tahun` (default current year), `bulan` (1-12), `userId` (optional) |
| Response | `{ data: DayAttendanceData[], totalKaryawan: number }` |

---

## 6. Business Logic

### 6.1 Attendance Rules

| Rule | Value | Behavior |
|------|-------|----------|
| Check-in start | 06:45 | Sebelum 06:45 → `400 Bad Request` |
| Check-in end | 07:45 | Sebelum 07:45 → `hadir`. Sesudah 07:45 → `terlambat` |
| Check-out min | 16:00 | Sebelum 16:00 → `pulang_cepat` |
| Duplicate check-in | Per userId + tanggal | Cek apakah sudah ada record → `409 Conflict` |

### 6.2 Attendance Category System

**3 Main Categories + 14 Sub Categories:**

| Main Category | Sub Categories | Legacy Status |
|---------------|----------------|---------------|
| `physical_present` | `physical_standard`, `physical_flexible`, `physical_field`, `physical_overtime`, `physical_violation` | hadir, terlambat, pulang_cepat |
| `absent_permit` | `leave_annual`, `leave_maternity`, `leave_long`, `permit_sick`, `permit_personal`, `permit_general` | izin, sakit, cuti |
| `absent_unpermit` | `unpermit_absent`, `unpermit_partial`, `unpermit_suspension` | tidakHadir |

Mapping untuk backward compatibility (sama dengan frontend `attendance-categories.ts`).

### 6.3 Rate Limiting

| Endpoint | Limit | Window | Behavior |
|----------|-------|--------|----------|
| `POST /api/auth/sign-in/email` | 3 gagal | Per email + per IP | Block escalating (30s, 60s, 90s, max 120s) |
| `POST /api/register` | 5 percobaan | Per IP, 60s window | Block 60s |
| Global (endpoint lain) | 10 request | 1 detik | 429 Too Many Requests |

### 6.4 Profile Update → Status Reset

Jika user dengan status `rejected` melakukan update profile (PATCH `/users/:id`), status otomatis di-reset ke `pending` dan `rejectionNotes` dikosongkan. Admin perlu mereview ulang.

---

## 7. File Storage (MinIO)

### 7.1 Dev Setup

MinIO dijalankan via Docker (pada `docker-compose.dev.yml`):

```yaml
services:
  minio:
    image: minio/minio:latest
    ports:
      - "9000:9000"  # API
      - "9001:9001"  # Console UI
    environment:
      MINIO_ROOT_USER: minioadmin
      MINIO_ROOT_PASSWORD: minioadmin
    volumes:
      - minio-data:/data
    command: server /data --console-address ":9001"
```

### 7.2 Buckets

| Bucket | Purpose | Public Access |
|--------|---------|---------------|
| `absenku-foto` | User profile photos | No (presigned URL) |
| `absenku-absensi` | Check-in/out photos | No (presigned URL) |

### 7.3 Flow

```
Frontend (base64 data URL)
  → POST /absensi (include base64 photo)
  → Backend decode base64 → upload ke MinIO
  → Simpan URL MinIO di database
  → Return Absensi object dengan URL
```

---

## 8. Testing Strategy

### 8.1 Unit Tests (Jest)

| Module | Test Cases |
|--------|-----------|
| AuthService | Register validation (valid/invalid input), rate limit logic |
| UsersService | CRUD, status changes (pending→approved→rejected), rejection notes, profile update reset logic |
| AbsensiService | Check-in time rules (before 06:45, before 07:45, after 07:45), duplicate detection, check-out rules, category mapping |
| PengajuanService | CRUD, status transitions (only pending can change), ownership validation |
| DashboardService | Weekly aggregation, monthly data, edge cases (no data, all absent, single user) |
| AttendanceCategoriesService | Legacy status → category mapping, parent/child tree |


### 8.2 E2E Tests (Supertest + Testcontainers)

| Skenario | Coverage |
|----------|----------|
| Auth flow | Register → login → get-session → logout |
| Auth errors | Invalid credentials, duplicate email, rate limit |
| Guards | 401 tanpa cookie, 403 wrong role |
| Users CRUD | Admin approve/reject, user update, delete cascade |
| Absensi flow | Check-in → check-out, search with filters, pagination |
| Absensi rules | Before window, duplicate check-in, late check-in |
| Dashboard | Admin week, month, recent with various data states |
| Pengajuan | Create → list → approve → delete |

### 8.3 Test Infrastructure

```typescript
// E2E setup via Testcontainers
const container = await new PostgreSqlContainer().start();
process.env.DATABASE_URL = container.getConnectionUri();
await migrate(db, { migrationsFolder: './drizzle' });
// Run tests...
await container.stop();
```

Unit test: Mock Drizzle instance via `@nestjs/testing`.

---

## 9. Development Setup

### 9.1 Prerequisites

| Tool | Version | Notes |
|------|---------|-------|
| Node.js | ≥ 18.x | Runtime |
| pnpm | ≥ 9.x | Package manager |
| PostgreSQL | 16.x | Via `~/Projects/docker/postgresql` |
| MinIO | Latest | Via Docker (docker-compose.dev.yml) |
| Docker | ≥ 24.x | Untuk testcontainers + MinIO |

### 9.2 Environment Variables

```env
# ── Server ──
PORT=9090
NODE_ENV=development

# ── Database ──
DATABASE_URL=postgresql://user:password@localhost:5432/absenku

# ── Auth ──
BETTER_AUTH_SECRET=your-secret-min-32-chars
BETTER_AUTH_URL=http://localhost:9090
CORS_ORIGIN=http://localhost:5173

# ── Storage (MinIO) ──
MINIO_ENDPOINT=http://localhost:9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET_FOTO=absenku-foto
MINIO_BUCKET_ABSENSI=absenku-absensi

# ── Throttler ──
THROTTLE_TTL=1000
THROTTLE_LIMIT=10
```

### 9.3 Package Scripts

| Perintah | Fungsi |
|----------|--------|
| `pnpm run start:dev` | NestJS watch mode |
| `pnpm run build` | NestJS production build |
| `pnpm run test` | Unit tests (Jest) |
| `pnpm run test:e2e` | E2E tests (supertest + testcontainers) |
| `pnpm run test:cov` | Unit tests with coverage report |
| `pnpm run db:generate` | Drizzle Kit: generate migration from schema |
| `pnpm run db:migrate` | Drizzle Kit: run pending migrations |
| `pnpm run db:push` | Drizzle Kit: push schema (dev only) |
| `pnpm run db:seed` | Run seed script |
| `pnpm run lint` | ESLint |

---

## 10. Seed System

### 10.1 Data Scope

| Entity | Count | Detail |
|--------|-------|--------|
| Users | 8 | 1 admin + 7 karyawan (2 pending, 5 approved) |
| Absensi | ~400+ records | 1 month per user (20-22 hari kerja × 6 approved karyawan) |
| Pengajuan | ~8-10 records | Mix approved/rejected/pending |

### 10.2 Demo Users

| Email | Password | Role | Status | Nama |
|-------|----------|------|--------|------|
| andika@stekom.ac.id | password | admin | approved | Andika Pratama |
| rudi@stekom.ac.id | password | karyawan | approved | Rudi Hartono |
| siti@stekom.ac.id | password | karyawan | approved | Siti Rahmawati |
| dewi@stekom.ac.id | password | karyawan | approved | Dewi Lestari |
| ani@stekom.ac.id | password | karyawan | approved | Ani Susanti |
| tono@stekom.ac.id | password | karyawan | approved | Tono Wibowo |
| budi@stekom.ac.id | password | karyawan | pending | Budi Santoso |
| ferry@stekom.ac.id | password | karyawan | pending | Ferry Hermawan |

### 10.3 Seed Logic

```typescript
// src/seed/seed.service.ts
async function seed() {
  // 1. Create users via auth.api.signUpEmail
  for (const u of demoUsers) {
    const result = await auth.api.signUpEmail({ body: u });
    // 2. Set status via direct DB update (some to pending)
    await db.update(user).set({ status: u.status })
      .where(eq(user.id, result.user.id));
  }

  // 3. Generate absensi records (past 30 days)
  const records = generateAbsensi(demoUsers.filter(u => u.status === 'approved'), 30);
  await db.insert(absensi).values(records);

  // 4. Insert pengajuan samples
  await db.insert(pengajuan).values(samplePengajuan);
}
```

---

## 11. Key Architecture Decisions

| Keputusan | Pilihan | Rationale |
|-----------|---------|-----------|
| Auth Strategy | Better Auth (Cookie Session) | Konsisten dengan frontend, no JWT complexity needed |
| Database | PostgreSQL | Production-ready, relasional, migration dari SQLite |
| ORM | Drizzle ORM | TypeScript-first, ringan, familiar dari mock-api |
| Validation | Zod | Type-safe, reusable schemas, frontend juga pakai Zod |
| Rate Limiting | @nestjs/throttler | Decorator-based, bisa upgrade ke Redis store nanti |
| File Storage | MinIO | S3-compatible, bisa jalan di local Docker, scalable |
| API Docs | @nestjs/swagger | Auto-generate dari decorators, zero maintenance |
| Error Format | `{ success, error }` | Structured, frontend-friendly, consistent parsing |
| Pagination | Body `{ data, meta }` | Explicit, tidak perlu parsing header |
| Test DB | Testcontainers PostgreSQL | Production parity, isolated per test run |
| Logging | NestJS Logger (built-in) | Cukup untuk kebutuhan saat ini |
| Migrations | Drizzle Kit | Auto-generate SQL, versioned migration files |
| Better Auth Mounting | `app.use()` + Controller hybrid | Standard routes via middleware, custom routes via NestJS |

---

## 12. Migration Timeline (Mock API → NestJS)

| Phase | Module | Estimasi | Deliverable |
|-------|--------|----------|-------------|
| **1** | Foundation | 1 session | Database module, Drizzle schema, Better Auth instance, env config |
| **2** | Common Infrastructure | 1 session | Guards, decorators, pipes, filters, interceptors, response format |
| **3** | Auth + Users | 1-2 sessions | Auth controller, Users controller, rate limiter, Swagger setup |
| **4** | Absensi | 1 session | Absensi module, rules, category mapping, search + pagination |
| **5** | Pengajuan | 1 session | CRUD, status transitions, ownership validation |
| **6** | Dashboard | 1 session | Aggregation queries, chart/summary calculation |
| **7** | File Storage | 0.5 session | MinIO service, upload/download endpoints |
| **8** | Seed + Testing | 1-2 sessions | Seed script, unit tests, E2E tests |
| **9** | Cut Over | 1 session | Update frontend VITE_API_URL, verify all flows, archive mock-api |

---

## 13. Non-Functional Requirements

| Aspek | Target |
|-------|--------|
| Type Safety | TypeScript strict mode, Zod validation on every input |
| Test Coverage | ≥ 90% service layer, E2E for all endpoints |
| Error Handling | Global exception filter — 100% structured errors |
| API Documentation | Swagger UI at `/api/docs` |
| Rate Limiting | Login: 3 gagal → block. Register: 5/IP/60s. Global: 10 req/s |
| File Upload Size | Profile photo: max 500KB. Absensi photo: max 2MB |
| Password Security | Via Better Auth (hashed, never returned in response) |
| CORS | Terbatas ke origin dari env variable |
| Database Index | userId, tanggal, status indexed on absensi table |
| Response Time | Dashboard queries < 500ms (properly indexed) |
