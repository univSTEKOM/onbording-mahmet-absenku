# Backend PRD — AbsenKu (NestJS)

**Versi:** 1.2 | **Status:** Draft | **Target:** Replace mock-api

---

## 1. Project Overview

### 1.1 Visi

Backend API absensi karyawan yang **type-safe**, **testable**, dan **maintainable** menggunakan NestJS + PostgreSQL. Menggantikan `mock-api` (Express 5 + json-server + SQLite) dengan architecture modular, testing coverage, dan production-ready.

### 1.2 Tujuan

- API konsisten (format response, error, pagination)
- Type safety end-to-end (Zod + Drizzle ORM + TypeScript)
- Test coverage tinggi (unit + E2E)
- Architecture sederhana — **no over-engineering**
- Siap production deployment

### 1.3 Target Pengguna

| Persona | Deskripsi |
|---------|-----------|
| **Karyawan** | Check-in/out, riwayat, pengajuan cuti/izin/sakit |
| **Admin HR** | Verifikasi user, kelola karyawan, approve/reject pengajuan, lihat dashboard |

### 1.4 Scope

- Implementasi ulang **semua endpoint** dari `mock-api`
- Database: SQLite + db.json → **PostgreSQL + Drizzle ORM**
- Auth: Better Auth (SQLite) → **Better Auth (PostgreSQL adapter)**
- File Storage: **MinIO** untuk foto profil + foto absensi (endpoint upload terpisah)
- **Seed system** — 8 demo users + 1 month attendance
- **Testing** — Unit (Jest) + E2E (Supertest)
- **Tidak include**: Swagger docs, Redis, complex rate limiter — tambah kalau needed

---

## 2. Tech Stack

### 2.1 Technology Choices

| Layer | Teknologi | Alasan |
|-------|-----------|--------|
| Framework | NestJS 11 | Modular, decorator-based, enterprise patterns |
| Language | TypeScript 5.7 | Strict mode, type safety |
| Database | PostgreSQL | Production-ready, migration dari SQLite |
| ORM | Drizzle ORM | TypeScript-first, ringan, familiar dari mock-api |
| Auth | Better Auth | Cookie session, konsisten frontend. PostgreSQL via Drizzle adapter |
| Validation | Zod 4 | Type-safe schemas, frontend juga pakai Zod |
| Config | `@nestjs/config` | Environment validation + `.env` loading |
| File Storage | MinIO (Docker) | S3-compatible untuk development |
| Rate Limiting | In-memory Map | Sederhana, mock-api juga pakai ini. Naikkin kalau perlu Redis |
| Logging | NestJS Logger | Built-in, cukup |
| Migrations | Drizzle Kit | Manual schema definition + `drizzle-kit generate` + `migrate` |
| Testing | Jest + Supertest | Unit: Jest. E2E: Supertest + PostgreSQL dedicated test DB |
| Container | Docker Compose | `backend/docker-compose.dev.yml` (MinIO + PostgreSQL) |

`ponytail: swagger skip — belum ada konsumen API docs selain developer sendiri. tambah kalau perlu.`

`ponytail: @nestjs/throttler skip — in-memory Map cukup untuk 2 endpoint yang di-rate-limit. state reset tiap restart — upgrade ke Redis kalau production multi-instance.`

### 2.2 Dependencies

```json
{
  "dependencies": {
    "@nestjs/common": "^11.0.1",
    "@nestjs/core": "^11.0.1",
    "@nestjs/platform-express": "^11.0.1",
    "@nestjs/config": "^4.0.0",
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
    "ts-jest": "^29.2.5",
    "ts-node": "^10.9.2",
    "typescript": "^5.7.3"
  }
}
```

**Compare v1.0:** Hapus `@nestjs/throttler`, `@nestjs/swagger`, `testcontainers`, `class-validator`, `class-transformer`.

### 2.3 Folder Structure

```
backend/
├── src/
│   ├── common/
│   │   ├── guards/
│   │   │   ├── auth.guard.ts        # Cek session via Better Auth, inject user ke request
│   │   │   └── roles.guard.ts       # Cek role admin/karyawan
│   │   └── filters/
│   │       └── http-exception.filter.ts  # Error → { success: false, error: {...} }
│   │
│   ├── config/
│   │   └── env.config.ts            # Zod schema validasi env
│   │
│   ├── database/
│   │   ├── database.module.ts
│   │   ├── database.provider.ts     # PG pool + Drizzle instance
│   │   └── schema/
│   │       ├── index.ts
│   │       ├── auth.schema.ts       # Better Auth tables — manual definition (opsi A)
│   │       ├── absensi.schema.ts
│   │       └── pengajuan.schema.ts
│   │
│   ├── auth/
│   │   ├── auth.module.ts
│   │   ├── auth.instance.ts         # Singleton better-auth()
│   │   ├── auth.controller.ts       # POST /api/register
│   │   ├── auth.service.ts          # Validasi + rate limit
│   │   ├── auth.rate-limiter.ts     # In-memory Map: login + register
│   │   └── auth.register.schema.ts  # Zod schema
│   │
│   ├── users/
│   │   ├── users.module.ts
│   │   ├── users.controller.ts      # /users, /api/users/*, /api/me
│   │   ├── users.service.ts
│   │   └── users.schema.ts          # Zod schemas
│   │
│   ├── absensi/
│   │   ├── absensi.module.ts
│   │   ├── absensi.controller.ts    # /absensi, /api/absensi/search
│   │   ├── absensi.service.ts
│   │   ├── absensi.rules.ts         # Check-in/out window + status logic
│   │   └── absensi.schema.ts        # Zod schemas
│   │
│   ├── pengajuan/
│   │   ├── pengajuan.module.ts
│   │   ├── pengajuan.controller.ts  # /pengajuan
│   │   ├── pengajuan.service.ts
│   │   └── pengajuan.schema.ts      # Zod schemas
│   │
│   ├── dashboard/
│   │   ├── dashboard.module.ts
│   │   ├── dashboard.controller.ts  # /api/dashboard/*
│   │   └── dashboard.service.ts
│   │
│   ├── storage/
│   │   ├── storage.module.ts
│   │   └── storage.service.ts       # MinIO upload/download
│   │
│   ├── seed/
│   │   ├── seed.module.ts
│   │   ├── seed.service.ts          # 8 users + 30 days data
│   │   └── seed.data.ts            # Demo data constants
│   │
│   ├── attendance-categories.ts     # Constants file, BUKAN module
│   │
│   └── main.ts                      # Bootstrap + CORS + middleware
│
├── test/
│   ├── jest-e2e.json
│   └── app.e2e-spec.ts
│
├── docker-compose.dev.yml           # PostgreSQL + MinIO
├── .env
├── package.json
├── tsconfig.json
├── tsconfig.build.json
└── nest-cli.json
```

`ponytail: attendance-categories constants file saja, bukan module. decorators/@CurrentUser inline di controller. interceptors gabung di exception filter.`

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
    ├── /api/register            →   AuthController (+ rate limit)
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
    └── /api/upload/*            →   StorageController (file upload)
            │
            ▼
        Drizzle ORM → PostgreSQL
            │
            ▼
        MinIO (file storage)
```

### 3.2 Better Auth Integration

#### Mounting

Better Auth di-mount sebagai Express middleware di `main.ts`. Semua route `/api/auth/*` langsung ditangani Better Auth. **CORS handle di satu pintu** — via `app.enableCors()` NestJS, Better Auth `trustedOrigins` di-set `['*']`.

```
main.ts:
  app.enableCors({ origin: process.env.CORS_ORIGIN, credentials: true })

  // Better Auth — CORS sudah di-handle NestJS
  const authHandler = toNodeHandler(auth)

  app.use('/api/auth/sign-in/email', rateLimiterMiddleware)
  app.use('/api/auth/*', (req, res, next) => {
    try {
      authHandler(req, res, next)
    } catch (err) {
      // Tangkap error dari Better Auth, lempar ke NestJS pipeline
      app.getHttpAdapter().getInstance().emit('error', err, req, res)
    }
  })
```

#### AuthGuard — Session Injection Pattern

**Hanya ada 1 cara** untuk akses session user di controller — via `AuthGuard`:

```typescript
// common/guards/auth.guard.ts
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(@Inject(AUTH_INSTANCE) private auth: typeof betterAuth) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest()
    const headers = fromNodeHeaders(req.headers)

    const session = await this.auth.api.getSession({ headers })
    if (!session) throw new UnauthorizedException('UNAUTHORIZED', 'Silakan login terlebih dahulu')

    req.user = session.user
    return true
  }
}
```

**Controller pattern — wajib pakai `AuthGuard` + `@CurrentUser()`:**

```typescript
@UseGuards(AuthGuard)
@Controller('/absensi')
export class AbsensiController {
  @Post()
  checkIn(@Body() body: CheckInDto, @CurrentUser() user: User) {
    // user.id, user.role, user.email — inject dari session
  }
}
```

**Better Auth error wrapper:** Middleware `/api/auth/*` wrap error dari Better Auth agar masuk ke NestJS ExceptionFilter. Tanpa ini, error Better Auth return mentah ke client (bypass filter pipeline).

#### Error Boundary: Better Auth vs NestJS

| Route | Handler | Error Format | Catatan |
|-------|---------|-------------|---------|
| `/api/auth/*` | `toNodeHandler(betterAuth)` | Better Auth native | Frontend `auth-client.ts` handle format ini |
| `/api/register` | AuthController | `{ success, error }` | Format standar NestJS |
| All other endpoints | NestJS Controllers | `{ success, error }` | Format standar NestJS |

**Axios interceptor** (`api/axios.ts`) handle exception untuk **kedua format** — tidak ada dual-handling di frontend.

### 3.3 API Response Format

**Success (NestJS endpoints):**
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

**Error (all endpoints):**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Deskripsi error"
  }
}
```

| Kode | HTTP Status | Penyebab |
|------|-------------|----------|
| `VALIDATION_ERROR` | 400 | Validasi Zod gagal |
| `UNAUTHORIZED` | 401 | Tidak login / session expired |
| `FORBIDDEN` | 403 | Bukan admin |
| `NOT_FOUND` | 404 | Resource tidak ditemukan |
| `CONFLICT` | 409 | Duplicate / sudah absen |
| `RATE_LIMIT` | 429 | Too many requests |
| `UPLOAD_FAILED` | 422 | File upload gagal (korup, terlalu besar) |
| `INTERNAL_ERROR` | 500 | Server error |

---

## 4. Database Schema

### 4.1 Auth Tables — Manual Definition (Opsi A)

Auth schema didefinisikan **manual** di `database/schema/auth.schema.ts`, **bukan auto-create** via Better Auth. Ini memastikan migrasi versioned via Drizzle Kit.

```typescript
// database/schema/auth.schema.ts
export const user = pgTable('user', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  name: text('name'),
  role: text('role').default('karyawan'),
  status: text('status').default('pending'),
  emailVerified: boolean('email_verified').default(false),
  image: text('image'),
  jabatan: text('jabatan'),
  phone: text('phone'),
  alamat: text('alamat'),
  faceDescriptor: text('face_descriptor'),
  rejectionNotes: text('rejection_notes').default('[]'),  // JSON string
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})

export const session = pgTable('session', { /* ... Better Auth fields */ })
export const account = pgTable('account', { /* ... Better Auth fields */ })
export const verification = pgTable('verification', { /* ... Better Auth fields */ })
```

**Catatan:** Nama tabel harus sesuai ekspektasi Better Auth (`user`, `session`, `account`, `verification`). Kolom Better Auth built-in (email, password hash, dll) tetap seperti default.

### 4.2 Absensi Table

```typescript
export const absensi = pgTable('absensi', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  tanggal: date('tanggal').notNull(),
  checkIn: timestamp('check_in', { withTimezone: true }),
  checkOut: timestamp('check_out', { withTimezone: true }),
  status: text('status').notNull(),
  mainCategory: text('main_category'),
  subCategory: text('sub_category'),
  faceVerified: boolean('face_verified').default(false),
  photos: jsonb('photos').default('[]'),
  keterangan: text('keterangan').default(''),
  createdAt: timestamp('created_at').defaultNow(),
})

// Composite index untuk dashboard aggregation queries
export const absensiUserIdTanggalIdx = index('absensi_user_id_tanggal_idx').on(absensi.userId, absensi.tanggal)
export const absensiTanggalStatusIdx = index('absensi_tanggal_status_idx').on(absensi.tanggal, absensi.status)
```

### 4.3 Pengajuan Table

```typescript
export const pengajuan = pgTable('pengajuan', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  jenis: text('jenis').notNull(),
  tanggalMulai: date('tanggal_mulai').notNull(),
  tanggalSelesai: date('tanggal_selesai').notNull(),
  alasan: text('alasan').notNull(),
  status: text('status').default('pending'),
  catatan: text('catatan').default(''),
  createdAt: timestamp('created_at').defaultNow(),
})

export const pengajuanUserIdIdx = index('pengajuan_user_id_idx').on(pengajuan.userId)
```

---

## 5. API Specifications

### 5.1 Authentication

#### `POST /api/auth/sign-in/email` — Login (Better Auth)

| Aspek | Detail |
|-------|--------|
| Auth | None |
| Rate Limit | 3 gagal → block 30s–120s (escalating per email + IP) |
| Response | Better Auth default: `{ user, session, token }` |

#### `POST /api/auth/sign-out` — Logout (Better Auth)

| Auth | Required (cookie) |
| Response | `{ success: true }` |

#### `GET /api/auth/get-session` — Cek Session (Better Auth)

| Auth | None |
| Response (login) | `{ user, session }` |
| Response (not login) | `{ user: null, session: null }` |

---

#### `POST /api/register` — Register (Custom — AuthController)

| Aspek | Detail |
|-------|--------|
| Auth | Optional. Admin bisa set role manual. Publik → `karyawan`, `pending` |
| Rate Limit | 5/IP/60s |
| Response 201 | `{ success: true, data: { user } }` |

**Validasi:**

| Field | Rule |
|-------|------|
| email | Required, max 100, format email |
| password | Publik: min 8, harus uppercase + lowercase + digit. Admin action: skip |
| nama | Required, max 100 |
| jabatan | Optional, max 100 |
| phone | Optional, 10-15 digit, awali `+` |
| alamat | Optional, max 500 |

**Logic:**
- Admin caller → role bisa di-set, status `approved`
- Publik → role `karyawan`, status `pending`
- Panggil `auth.api.signUpEmail()` → insert profile

### 5.2 Users

#### `GET /api/me` — Profile

| Auth | Required |
| Response | Full user (password excluded) |

#### `PATCH /users/:id` — Update Profile (Self-service)

| Auth | Required. Non-admin hanya update diri sendiri |
| Request | `{ nama?, jabatan?, phone?, alamat?, foto?, faceDescriptor?, email? }` |

**Logic:** Jika status `rejected` → reset ke `pending`, kosongkan `rejectionNotes`.

#### `GET /api/users/pending` — Admin: User Pending

| Auth | Admin |
| Response | `[User]` — status `pending` |

#### `GET /api/users/all` — Admin: Semua User

| Auth | Admin |
| Params | `_page`, `_limit`, `q` (search nama/email), `role`, `status` |
| Response | Paginated: `{ success: true, data, meta: { page, total, totalPages } }` |

`ponytail: users list wajib pagination — untuk scale 500+ karyawan. template query: WHERE nama ILIKE $q + ORDER BY createdAt DESC + LIMIT/OFFSET.`

#### `PATCH /api/users/:id` — Admin: Update User

| Auth | Admin |
| Request | `{ nama?, jabatan?, phone?, alamat?, role?, foto?, faceDescriptor?, email? }` |

#### `PATCH /api/users/:id/status` — Admin: Approve/Reject

| Auth | Admin |
| Request | `{ status: 'approved'|'rejected', note?: string }` |

**Logic:**
- `approved` → kosongkan `rejectionNotes`
- `rejected` → tambah note ke `rejectionNotes[]`

#### `POST /api/users/:id/notes` — Admin: Tambah Catatan

| Auth | Admin |
| Request | `{ note: string (max 500) }` |

#### `DELETE /api/users/:id` — Admin: Hapus User

| Auth | Admin |
| Note | Hapus cascade: Better Auth + absensi + pengajuan |

### 5.3 Absensi

#### `POST /absensi` — Check-in

| Auth | Required. Non-admin hanya check-in diri sendiri |
| Request | `{ userId, tanggal, checkIn?, photos?, faceVerified?, keterangan? }` |
| Response | Absensi object (server override status + category) |

**Rules:**

| Kondisi | Status | subCategory |
|----------|--------|-------------|
| Sebelum 06:45 | `400` ditolak | — |
| Sudah absen hari ini | `409` conflict | — |
| Check-in ≤ 07:45 | `hadir` | `physical_standard` |
| Check-in > 07:45 | `terlambat` | `physical_violation` |

#### `PATCH /absensi/:id` — Check-out

| Auth | Required. Non-admin hanya check-out diri sendiri |
| Request | `{ checkOut: ISO string, photos? }` |

**Rules:**
- Check-out < 16:00 → `pulang_cepat`, `subCategory: physical_violation`
- Photos baru di-append ke array existing

#### `GET /absensi` — List Absensi

| Auth | Required. Non-admin hanya lihat data sendiri |
| Params | `userId`, `tanggal`, `tanggal_gte`, `tanggal_lte`, `status[]`, `mainCategory[]`, `subCategory[]`, `_sort`, `_order`, `_page`, `_limit` |
| Response | Paginated: `{ success: true, data, meta: { page, total, totalPages } }` |

#### `GET /api/absensi/search` — Search by Nama

| Auth | Required |
| Params | Semua filter di atas + `q` (search nama) |
| Response | Paginated |

### 5.4 Pengajuan

#### `POST /pengajuan` — Create

| Auth | Required |
| Request | `{ userId, jenis, tanggalMulai, tanggalSelesai, alasan }` |
| Response | Pengajuan object (auto `status: pending`) |

#### `GET /pengajuan` — List

| Auth | Required. Non-admin hanya lihat sendiri |
| Params | `userId`, `jenis`, `status`, `_page`, `_limit` |
| Response | Paginated |

`ponytail: pengajuan sekarang pakai pagination — aman untuk scale >100 records.`

#### `PATCH /pengajuan/:id` — Update Status

| Auth | Required. Admin bisa approve/reject |
| Request | `{ status?, catatan? }` |
| Rules | Hanya `pending` bisa di-update. `catatan` max 500 |

#### `DELETE /pengajuan/:id` — Hapus

| Auth | Owner atau admin |
| Rules | Hanya `pending` |

### 5.5 Dashboard

#### `GET /api/dashboard/recent` — 7 Hari Terakhir

| Auth | Required |
| Query | `userId` (opsional — admin bisa lihat user lain) |
| Response | `{ data: [{ tanggal, checkIn, checkOut, status }] }` |

#### `GET /api/dashboard/admin/week` — Tren 7 Hari (Admin)

| Auth | Admin only |
| Range | `(today-7)` sampai `(today-1)` |
| Response | `{ chart: AdminWeekChartItem[], summary: AdminWeekSummary }` |

**Implementation (1 SQL query per endpoint — no JS loops):**

```sql
-- Tren 7 hari: 1 query, GROUP BY + date_trunc
SELECT
  tanggal,
  COUNT(*) FILTER (WHERE status = 'hadir') AS hadir,
  COUNT(*) FILTER (WHERE status = 'terlambat') AS terlambat,
  -- ... etc
FROM absensi
WHERE tanggal BETWEEN $1 AND $2
GROUP BY tanggal
ORDER BY tanggal
```

```
Dashboard query pattern:
  - 1 SQL query per endpoint (no JavaScript loops for aggregation)
  - Composite indexes: (userId, tanggal) + (tanggal, status) — sudah defined di schema
  - Known limitation: fine sampai ~10rb user. Materialized view kalau perlu scale >50rb.
```

`ponytail: dashboard pake SQL GROUP BY + FILTER — 1 query, no JS loop. Composite index sudah siap. Optimasi materialized view kalau terbukti lambat.`

#### `GET /api/dashboard/month` — Data Bulanan

| Auth | Required |
| Query | `tahun` (default current), `bulan` (1-12), `userId` (opsional) |
| Response | `{ data: DayAttendanceData[], totalKaryawan: number }` |

### 5.6 File Upload

Upload endpoint terpisah — **Opsi B**:

#### `POST /api/upload/foto` — Upload Foto

| Aspek | Detail |
|-------|--------|
| Auth | Required |
| Content-Type | `multipart/form-data` |
| Body | `file` — image file (PNG, JPEG, WebP) |
| Max Size | 2MB |
| Response 200 | `{ success: true, data: { url: string } }` |
| Error: korup | `422: { code: "UPLOAD_FAILED", message: "Gambar tidak valid atau rusak" }` |
| Error: terlalu besar | `422: { code: "FILE_TOO_LARGE", message: "Ukuran maksimal 2MB" }` |

**Flow:**
```typescript
// storage.controller.ts
@Post('/api/upload/foto')
@UseGuards(AuthGuard)
@UseInterceptors(FileInterceptor('file'))
async uploadFoto(@UploadedFile() file: Express.Multer.File) {
  if (!file) throw new UploadFailedException('File tidak ditemukan')
  if (file.size > 2 * 1024 * 1024) throw new FileTooLargeException()
  if (!file.mimetype.startsWith('image/')) throw new UploadFailedException('Hanya file gambar')

  const url = await this.storage.upload('absenku-foto', file.buffer, file.mimetype)
  return { success: true, data: { url } }
}
```

**Integrasi dengan update profil:**
```
1. POST /api/upload/foto → { url: "https://minio/..." }
2. PATCH /users/:id → { foto: "https://minio/..." }
```

**Keuntungan Opsi B:**
- Upload error tidak bikin update profil gagal total
- Retry upload independen
- Frontend bisa upload sambil isi form lain
- Backend validasi file terjadi sebelum masuk ke business logic user

---

## 6. Business Logic

### 6.1 Attendance Rules

```
CHECK_IN_START = '06:45'
CHECK_IN_END   = '07:45'
CHECK_OUT_MIN  = '16:00'
```

Rules diimplementasi di `absensi.rules.ts`, reusable untuk service + tests.

### 6.2 Attendance Category System

Definisi di `attendance-categories.ts` (constants file, reusable frontend-backend):

| Main Category | Sub Categories | Legacy Status |
|---------------|----------------|---------------|
| `physical_present` | `physical_standard`, `flexible`, `field`, `overtime`, `violation` | hadir, terlambat, pulang_cepat |
| `absent_permit` | `leave_annual`, `leave_maternity`, `leave_long`, `permit_sick`, `permit_personal`, `permit_general` | izin, sakit, cuti |
| `absent_unpermit` | `unpermit_absent`, `unpermit_partial`, `unpermit_suspension` | tidakHadir |

### 6.3 Rate Limiting

In-memory Map (sama dengan mock-api):

| Endpoint | Limit | Block |
|----------|-------|-------|
| `/api/auth/sign-in/email` | 3 gagal | 30s → 60s → 90s → max 120s |
| `/api/register` | 5/IP | 60s |

```typescript
// auth.rate-limiter.ts — ~30 lines, no dependencies
const attempts = new Map<string, { count: number; blockedAt?: number; duration?: number }>()
```

`ponytail: in-memory rate limiter — state reset tiap restart server. upgrade ke Redis via @nestjs/throttler kalau production multi-instance.`

### 6.4 Profile Update → Status Reset

User `rejected` yang update profile → otomatis `pending` + `rejectionNotes` dikosongkan. Admin review ulang.

### 6.5 Photo Upload & WebP Conversion Flow

```
Frontend:
  1. User pilih foto (PNG/JPEG, max 2MB)
  2. ImageCropperDialog crop + canvasToWebP(canvas, 0.8) → ~40% smaller
  3. POST /api/upload/foto (multipart) → { url }
  4. PATCH /users/:id → { foto: url }

Backend:
  1. POST /api/upload/foto → validasi → upload ke MinIO → return URL
  2. PATCH /users/:id → simpan URL di DB
```

`ponytail: canvasToWebP() reusable utility di src/lib/image.ts — FaceVerification + ImageCropperDialog pakai fungsi yang sama. backend 0 perubahan format.`

---

## 7. File Storage (MinIO)

### 7.1 Dev Setup

```yaml
# docker-compose.dev.yml
services:
  minio:
    image: minio/minio:latest
    ports:
      - "9000:9000"
      - "9001:9001"
    environment:
      MINIO_ROOT_USER: minioadmin
      MINIO_SECRET_KEY: minioadmin
    volumes:
      - minio-data:/data
    command: server /data --console-address ":9001"

volumes:
  minio-data:
```

### 7.2 Buckets

| Bucket | Untuk |
|--------|-------|
| `absenku-foto` | Foto profil user |
| `absenku-absensi` | Foto check-in/out |

### 7.3 Storage Service

```typescript
@Injectable()
export class StorageService {
  async upload(bucket: string, key: string, buffer: Buffer, mimeType: string): Promise<string>
  async delete(bucket: string, key: string): Promise<void>
}
```

---

## 8. Testing Strategy

### 8.1 Unit Tests

| Module | Test Cases |
|--------|-----------|
| AuthService | Register validasi, rate limit |
| UsersService | CRUD, status changes, rejection notes, profile-update-reset |
| AbsensiService | Check-in rules (before/after window, duplicate), check-out rules, category mapping |
| PengajuanService | CRUD, status transitions, ownership |
| DashboardService | Weekly/monthly aggregation, edge cases |

**Test DB:** SQLite in-memory untuk service tests (query logic beda minimal). PostgreSQL dedicated untuk E2E.

`ponytail: testcontainers skip — SQLite in-memory cukup untuk unit test query logic. PG dedicated test DB untuk E2E via script terpisah.`

### 8.2 E2E Tests

| Skenario | Coverage |
|----------|----------|
| Auth flow | Register → login → get-session → logout |
| Guards | 401, 403 |
| Absensi | Check-in → check-out, search, pagination |
| Admin | Approve/reject, delete cascade |
| Dashboard | Week, month, recent |
| Upload | Valid file → success, invalid file → 422, too large → 422 |

---

## 9. Development Setup

### 9.1 Prerequisites

| Tool | Notes |
|------|-------|
| Node.js ≥ 18.x | Runtime |
| pnpm ≥ 9 | Package manager |
| PostgreSQL 16 | Via `~/Projects/docker/postgresql` |
| Docker | MinIO |

### 9.2 Environment

```env
PORT=9090
DATABASE_URL=postgresql://user:password@localhost:5432/absenku
BETTER_AUTH_SECRET=your-secret-min-32-chars
BETTER_AUTH_URL=http://localhost:9090
CORS_ORIGIN=http://localhost:5173
MINIO_ENDPOINT=http://localhost:9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
```

### 9.3 Scripts

| Perintah | Fungsi |
|----------|--------|
| `pnpm start:dev` | Watch mode |
| `pnpm test` | Unit tests |
| `pnpm test:e2e` | E2E tests |
| `pnpm db:generate` | Drizzle: generate migration |
| `pnpm db:migrate` | Drizzle: run migration |
| `pnpm db:seed` | Seed 8 users + 30 days data |
| `pnpm lint` | ESLint |

---

## 10. Seed System

### 10.1 Data Scope

| Entity | Count |
|--------|-------|
| Users | 8 (1 admin + 7 karyawan, 2 pending + 5 approved) |
| Absensi | ~400+ (30 days × ~6 approved karyawan) |
| Pengajuan | ~8-10 (mix status) |

### 10.2 Seed Strategy: Sequential + Idempotent + Cleanup on Fail

```
Karena auth.api.signUpEmail() adalah API call (bukan DB insert langsung),
tidak bisa di-wrap Drizzle transaction. Strategi:

1. Loop sequential — 1 user at a time
2. Idempotent — cek email sudah ada → skip
3. Gagal di user N → cleanup manual: delete user + account + session dari DB
```

```typescript
// seed.service.ts
async seed() {
  const created: { user: User; password: string }[] = []

  for (const u of demoUsers) {
    // Idempotent: skip kalau sudah ada
    const existing = await db.select().from(user).where(eq(user.email, u.email)).limit(1)
    if (existing.length > 0) {
      created.push({ user: existing[0] as User, password: u.password })
      continue
    }

    try {
      // Via Better Auth API — handle hash + user + account atomically
      const result = await auth.api.signUpEmail({
        body: { email: u.email, password: u.password, name: u.nama, ... }
      })
      created.push({ user: result.user as User, password: u.password })
    } catch (e) {
      // Cleanup: hapus semua yang sudah terlanjur dibuat
      for (const c of created) {
        await Promise.all([
          db.delete(account).where(eq(account.userId, c.user.id)),
          db.delete(session).where(eq(session.userId, c.user.id)),
          db.delete(user).where(eq(user.id, c.user.id)),
        ])
      }
      throw new Error(`Seed gagal di user ${u.email}: ${e.message}`)
    }
  }

  // Insert absensi + pengajuan (bisa di-transaction, pure DB insert)
  const approved = created.filter(u => u.user.status === 'approved')
  await db.transaction(async (tx) => {
    await tx.insert(absensi).values(generateAbsensi(approved, 30))
    await tx.insert(pengajuan).values(samplePengajuan(created))
  })
}
```

### 10.3 Demo Users

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

---

## 11. Key Decisions

| Keputusan | Pilihan | Kenapa |
|-----------|---------|--------|
| Auth | Better Auth Cookie Session | Konsisten frontend, no JWT |
| Auth schema | Manual definition (opsi A) | Migration versioned via Drizzle Kit |
| DB | PostgreSQL | Production-ready |
| ORM | Drizzle | TypeScript-first, ringan |
| Validation | Zod | Type-safe, frontend juga pakai |
| Rate Limiting | In-memory Map | Cuma 2 endpoint. State reset tiap restart — documented limitation |
| File Storage | MinIO | S3-compatible, scalable |
| Upload flow | Endpoint terpisah (Opsi B) | Error upload tidak ganggu update profile. Retry independent |
| API Docs | PRD ini | Belum perlu Swagger |
| Error Format | `{ success, error }` | Frontend-friendly |
| Error boundary | Better Auth native, NestJS standard | Axios interceptor handle kedua format |
| CORS | Single entry — `app.enableCors()` | Better Auth `trustedOrigins: ['*']` |
| Pagination | Body `{ data, meta }` + wajib di users/absensi/pengajuan | Explicit, no header magic |
| Test DB | SQLite (unit) + PG (E2E) | Simpel + production parity |
| WebP Convert | Frontend `canvasToWebP()` | Reusable utility, 0 backend change |
| attendance-categories | Constants file | Bukan module — data statis |
| Dashboard | SQL GROUP BY + composite index | 1 query per endpoint, no JS loop |
| Seed | Sequential via Better Auth API + idempotent loop | Hash consistency, cleanup on fail |

---

## 12. Migration Timeline

| # | Phase | Estimasi |
|---|-------|----------|
| 1 | Database + Auth Foundation | 1 session |
| 2 | Auth + Users Module | 1 session |
| 3 | Absensi Module | 1 session |
| 4 | Pengajuan Module | 1 session |
| 5 | Dashboard Module | 1 session |
| 6 | File Storage + Upload (MinIO) | 0.5 session |
| 7 | Seed System | 0.5 session |
| 8 | Testing (unit + E2E) | 1 session |
| 9 | Cut Over | 1 session |

---

## 13. Non-Functional Requirements

| Aspek | Target |
|-------|--------|
| Type Safety | TypeScript strict + Zod all inputs |
| Test Coverage | ≥ 90% service layer, E2E all endpoints |
| Error Handling | Global filter — structured errors. Better Auth error wrapped ke pipeline |
| Rate Limiting | Login 3× → block, Register 5/IP/60s |
| File Size | 2MB max. WebP convert turun ~40% |
| Password | Hashed via Better Auth, never returned |
| CORS | Single entry point — NestJS `app.enableCors()` |
| DB Index | Composite: (userId, tanggal) + (tanggal, status) |
| Dashboard Performance | 1 SQL query per endpoint (GROUP BY + date_trunc), no JS loops. Materialized view kalau perlu |
| Upload Error Handling | Validasi MIME, size, integritas file sebelum upload ke MinIO |
