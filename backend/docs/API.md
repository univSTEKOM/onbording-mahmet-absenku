# API Reference — AbsenKu Backend

**Base URL:** `http://localhost:9090`

> Semua endpoint kecuali login/register membutuhkan cookie session (better-auth).

---

## Response Format

Semua endpoint NestJS menggunakan format response terstruktur:

**Success (single):**
```json
{
  "success": true,
  "data": { ... }
}
```

**Success (list):**
```json
{
  "success": true,
  "data": [ ... ]
}
```

**Success (paginated):**
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

**Error:**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Deskripsi error"
  }
}
```

### Error Codes

| Kode | HTTP Status | Penyebab |
|------|-------------|----------|
| `VALIDATION_ERROR` | 400 | Validasi Zod gagal |
| `UNAUTHORIZED` | 401 | Tidak login / session expired |
| `FORBIDDEN` | 403 | Bukan admin / bukan milik sendiri |
| `NOT_FOUND` | 404 | Resource tidak ditemukan |
| `CONFLICT` | 409 | Duplicate / sudah absen / email sudah dipakai |
| `RATE_LIMIT` | 429 | Too many requests |
| `UPLOAD_FAILED` | 422 | File upload gagal (ukuran/type/korup) |
| `UNPROCESSABLE` | 422 | Data tidak dapat diproses |
| `INTERNAL_ERROR` | 500 | Server error |

### Rate Limiting

| Endpoint | Limit | Blokir |
|----------|-------|--------|
| `POST /api/auth/sign-in/email` | 3 gagal | 30s → 120s (escalating, per email + IP) |
| `POST /api/register` | 5 percobaan | 60s (per IP) |

---

## Authentication

Better Auth di-mount sebagai middleware di `/api/auth/*`. **Response format Better Auth asli** (bukan `{ success, data }`).

### `POST /api/auth/sign-in/email` — Login

| Aspek | Detail |
|-------|--------|
| Auth | None |
| Rate Limit | 3 gagal → block (escalating 30s–120s) |
| Content-Type | `application/json` |

**Request:**
```json
{
  "email": "andika@stekom.ac.id",
  "password": "password"
}
```

**Response 200 (Better Auth format):**
```json
{
  "user": {
    "id": "uuid",
    "email": "andika@stekom.ac.id",
    "name": "Andika Pratama",
    "role": "admin",
    "status": "approved",
    "emailVerified": false,
    "jabatan": "Manager HRD",
    "phone": "+6281234567890",
    "alamat": "Jl. Merdeka No. 1, Jakarta",
    "createdAt": "2026-07-30T00:00:00.000Z",
    "updatedAt": "2026-07-30T00:00:00.000Z"
  },
  "session": { "id": "session-id", "expiresAt": "2026-08-30T00:00:00.000Z" },
  "token": "session-token"
}
```

**Response 429:**
```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT",
    "message": "Terlalu banyak percobaan. Coba lagi 30 detik lagi."
  }
}
```

---

### `POST /api/auth/sign-out` — Logout

| Aspek | Detail |
|-------|--------|
| Auth | Required (cookie session) |

**Response 200:**
```json
{ "success": true }
```

---

### `GET /api/auth/get-session` — Cek Session

| Aspek | Detail |
|-------|--------|
| Auth | None |

**Response 200 (login):**
```json
{
  "user": { ... },
  "session": { ... }
}
```

**Response 200 (not login):**
```json
{ "user": null, "session": null }
```

---

## Auth (Custom)

### `POST /api/register` — Register Akun Baru

| Aspek | Detail |
|-------|--------|
| Auth | Optional. Admin bisa set role manual. Publik → `karyawan`, `pending` |
| Rate Limit | 5/IP/60s |

**Request:**
```json
{
  "email": "user@example.com",
  "password": "Password1",
  "nama": "User Baru",
  "jabatan": "Staff IT",
  "phone": "+6281234567890",
  "alamat": "Jl. Contoh No. 1"
}
```

**Validasi:**

| Field | Rule |
|-------|------|
| email | Required, max 100, format email |
| password | Publik: min 8, uppercase + lowercase + digit. Admin: skip validasi |
| nama | Required, max 100 |
| jabatan | Optional, max 100 |
| phone | Optional, 10-15 digit, awali `+` |
| alamat | Optional, max 500 |
| role | Optional (admin-only override), default `karyawan` |

**Response 201:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "name": "User Baru",
      "role": "karyawan",
      "status": "pending",
      "jabatan": "Staff IT",
      "phone": "+6281234567890",
      "alamat": "Jl. Contoh No. 1",
      "createdAt": "2026-07-30T00:00:00.000Z"
    }
  }
}
```

**Response 409:**
```json
{
  "success": false,
  "error": {
    "code": "CONFLICT",
    "message": "Email sudah terdaftar"
  }
}
```

---

## Users

### `GET /api/me` — Profile Lengkap

| Aspek | Detail |
|-------|--------|
| Auth | Required |

**Response 200:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "andika@stekom.ac.id",
    "name": "Andika Pratama",
    "role": "admin",
    "status": "approved",
    "image": null,
    "jabatan": "Manager HRD",
    "phone": "+6281234567890",
    "alamat": "Jl. Merdeka No. 1, Jakarta",
    "faceDescriptor": null,
    "rejectionNotes": "[]",
    "createdAt": "2026-07-30T00:00:00.000Z",
    "updatedAt": "2026-07-30T00:00:00.000Z"
  }
}
```

---

### `PATCH /users/:id` — Update Profile (Self-service)

| Aspek | Detail |
|-------|--------|
| Auth | Required. Non-admin hanya bisa update diri sendiri |

**Request:**
```json
{
  "nama": "Nama Baru",
  "jabatan": "Staff Senior",
  "phone": "+6281234567890",
  "alamat": "Jl. Baru No. 1",
  "foto": "https://minio/absenku-foto/foto/uuid.jpg"
}
```

**Rules:**
- Jika status user `rejected` → update otomatis reset ke `pending`, `rejectionNotes` dikosongkan
- `status`, `rejectionNotes`, `role`, `id`, `createdAt` dihapus dari body

**Response 200:**
```json
{
  "success": true,
  "data": { ... full user object ... }
}
```

---

### `GET /api/users/pending` — Daftar User Pending (Admin)

| Auth | Admin only |
| Response | `{ success: true, data: [User, ...] }` |

---

### `GET /api/users/all` — Semua User (Admin)

| Auth | Admin only |
| Query | `_page`, `_limit`, `q` (search nama/email), `role`, `status` |

**Response:**
```json
{
  "success": true,
  "data": [ ... ],
  "meta": { "page": 1, "total": 50, "totalPages": 4 }
}
```

---

### `GET /users` — Semua User (Public, tanpa pagination)

| Auth | Required |
| Query | `q` (search nama/email), `role` |

**Response:**
```json
{
  "success": true,
  "data": [ ... ]
}
```

---

### `PATCH /api/users/:id` — Update User (Admin)

| Auth | Admin only |
| Request | `{ nama?, email?, jabatan?, phone?, alamat?, role?, foto?, faceDescriptor? }` |

**Response:**
```json
{
  "success": true,
  "data": { "message": "User berhasil diupdate" }
}
```

---

### `PATCH /api/users/:id/status` — Approve / Reject User (Admin)

| Auth | Admin only |

**Request:**
```json
{
  "status": "approved",
  "note": "Data lengkap, disetujui"
}
```

**Logic:**
- `approved` → kosongkan `rejectionNotes`
- `rejected` → tambah note ke `rejectionNotes[]`

**Response:**
```json
{
  "success": true,
  "data": { "message": "Status berhasil diubah ke approved" }
}
```

---

### `POST /api/users/:id/notes` — Tambah Catatan (Admin)

| Auth | Admin only |

**Request:**
```json
{ "note": "Catatan maksimal 500 karakter" }
```

**Response:**
```json
{
  "success": true,
  "data": { "message": "Catatan ditambahkan" }
}
```

---

### `DELETE /api/users/:id` — Hapus User (Admin)

| Auth | Admin only |
| Note | Hapus cascade: Better Auth + absensi + pengajuan. Permanent. |

**Response:**
```json
{
  "success": true,
  "data": { "message": "User dan semua data terkait berhasil dihapus" }
}
```

---

## Absensi

### `POST /absensi` — Check-in

| Aspek | Detail |
|-------|--------|
| Auth | Required. Non-admin hanya check-in diri sendiri |

**Request:**
```json
{
  "userId": "uuid",
  "tanggal": "2026-07-30",
  "checkIn": "2026-07-30T07:15:00.000Z",
  "faceVerified": true,
  "photos": [
    { "type": "check_in", "url": "https://minio/...", "capturedAt": "2026-07-30T07:15:00.000Z" }
  ]
}
```

**Rules:**

| Kondisi | Status | subCategory |
|----------|--------|-------------|
| Sebelum 06:45 | `400` ditolak | — |
| Sudah absen hari ini | `409` conflict | — |
| Check-in ≤ 07:45 | `hadir` | `physical_standard` |
| Check-in > 07:45 | `terlambat` | `physical_violation` |

**Response 201:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "userId": "uuid",
    "tanggal": "2026-07-30",
    "checkIn": "2026-07-30T07:15:00.000Z",
    "checkOut": null,
    "status": "hadir",
    "mainCategory": "physical_present",
    "subCategory": "physical_standard",
    "faceVerified": true,
    "photos": [],
    "keterangan": "",
    "createdAt": "2026-07-30T07:15:00.000Z"
  }
}
```

---

### `PATCH /absensi/:id` — Check-out

| Aspek | Detail |
|-------|--------|
| Auth | Required. Non-admin hanya check-out diri sendiri |

**Request:**
```json
{
  "checkOut": "2026-07-30T16:30:00.000Z",
  "photos": [
    { "type": "check_out", "url": "https://minio/...", "capturedAt": "2026-07-30T16:30:00.000Z" }
  ]
}
```

**Rules:**
- Check-out < 16:00 → `pulang_cepat`, `subCategory: physical_violation`
- Photos baru di-append ke array photos existing

**Response:**
```json
{
  "success": true,
  "data": { ... full absensi object with checkOut ... }
}
```

---

### `GET /absensi` — List Absensi

| Aspek | Detail |
|-------|--------|
| Auth | Required. Non-admin hanya lihat data sendiri |

**Query Params:**

| Param | Contoh | Fungsi |
|-------|--------|--------|
| `userId` | `uuid` | Filter by user |
| `tanggal` | `2026-07-24` | Exact date |
| `tanggal_gte` | `2026-07-01` | Start date (>=) |
| `tanggal_lte` | `2026-07-31` | End date (<=) |
| `status` | `hadir` | Multi-value: `?status=hadir&status=terlambat` |
| `mainCategory` | `physical_present` | Filter by main category |
| `subCategory` | `physical_standard` | Filter by sub category |
| `_sort` | `tanggal` | Sort field |
| `_order` | `desc` | Sort direction |
| `_page` | `1` | Page number |
| `_limit` | `10` | Items per page |

**Response:**
```json
{
  "success": true,
  "data": [ ... ],
  "meta": { "page": 1, "total": 100, "totalPages": 10 }
}
```

---

### `GET /api/absensi/search` — Search Absensi by Nama

| Aspek | Detail |
|-------|--------|
| Auth | Required |

**Query Params:** Semua filter dari `GET /absensi` **plus** `q` (search by nama)

| Param | Contoh | Fungsi |
|-------|--------|--------|
| `q` | `andi` | Search by user name (ILIKE) |

**Response:** Sama format paginated.

---

## Pengajuan

### `POST /pengajuan` — Create

| Aspek | Detail |
|-------|--------|
| Auth | Required. Non-admin hanya untuk diri sendiri |

**Request:**
```json
{
  "userId": "uuid",
  "jenis": "cuti",
  "tanggalMulai": "2026-08-01",
  "tanggalSelesai": "2026-08-03",
  "alasan": "Liburan tahunan keluarga (min 10 karakter)"
}
```

**Response 201:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "userId": "uuid",
    "jenis": "cuti",
    "tanggalMulai": "2026-08-01",
    "tanggalSelesai": "2026-08-03",
    "alasan": "Liburan tahunan keluarga",
    "status": "pending",
    "catatan": "",
    "createdAt": "2026-07-30T00:00:00.000Z"
  }
}
```

---

### `GET /pengajuan` — List

| Auth | Required. Non-admin hanya lihat sendiri |
| Query | `userId`, `jenis`, `status`, `_page`, `_limit` |

**Response:** Paginated.

---

### `PATCH /pengajuan/:id` — Update Status

| Auth | Required. Hanya admin yang bisa ubah status |

**Request:**
```json
{
  "status": "approved",
  "catatan": "Disetujui"
}
```

**Rules:**
- Hanya `pending` yang bisa di-update
- Non-admin tidak bisa mengubah `status`
- `catatan` max 500 karakter

**Response:**
```json
{
  "success": true,
  "data": { ... updated pengajuan object ... }
}
```

---

### `DELETE /pengajuan/:id` — Hapus

| Auth | Required. Owner atau admin |
| Rules | Hanya `pending` yang bisa dihapus |

**Response:**
```json
{
  "success": true,
  "data": { "message": "Dihapus" }
}
```

---

## Dashboard

### `GET /api/dashboard/recent` — 7 Hari Terakhir

| Auth | Required |
| Query | `userId` (opsional — admin bisa lihat user lain) |
| Range | 7 hari rolling: `(today-6)` sampai `today` |

**Response 200:**
```json
{
  "success": true,
  "data": [
    { "tanggal": "2026-07-24", "checkIn": null, "checkOut": null, "status": null },
    { "tanggal": "2026-07-25", "checkIn": "2026-07-25T07:15:00.000Z", "checkOut": "2026-07-25T16:30:00.000Z", "status": "hadir" }
  ]
}
```

---

### `GET /api/dashboard/admin/week` — Tren 7 Hari (Admin)

| Auth | Admin only |
| Range | 7 hari penuh sebelum hari ini: `(today-7)` sampai `(today-1)` |

**Response 200:**
```json
{
  "success": true,
  "chart": [
    {
      "name": "Sen",
      "hadir": 10, "pulangCepat": 2, "terlambat": 1,
      "izin": 1, "sakit": 0, "cuti": 0, "tidakHadir": 1,
      "present": 13, "absentPermit": 1, "absentUnpermit": 1,
      "persen": 87
    }
  ],
  "summary": {
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
}
```

---

### `GET /api/dashboard/month` — Data Bulanan

| Auth | Required |
| Query | `tahun` (default current), `bulan` (1-12), `userId` (opsional) |

**Response 200:**
```json
{
  "success": true,
  "data": [
    {
      "tanggal": "2026-07-01",
      "hadir": 10, "pulangCepat": 1, "terlambat": 2,
      "checkInOnly": 0, "izin": 1, "sakit": 0, "cuti": 0,
      "tidakHadir": 1,
      "present": 13, "absentPermit": 1, "absentUnpermit": 1
    }
  ],
  "totalKaryawan": 15
}
```

---

## File Storage

### `POST /api/upload/foto` — Upload Foto

| Aspek | Detail |
|-------|--------|
| Auth | Required |
| Content-Type | `multipart/form-data` |
| Body | `file` — image (PNG, JPEG, WebP) |
| Max Size | 2MB |

**Response 200:**
```json
{
  "success": true,
  "data": {
    "url": "http://localhost:9000/absenku-foto/foto/uuid.jpg"
  }
}
```

**Response 422:**
```json
{
  "success": false,
  "error": {
    "code": "UPLOAD_FAILED",
    "message": "Gagal upload file: ..."
  }
}
```

---

## Data Models

### User

```json
{
  "id": "string (UUID)",
  "email": "string (unique, max 100)",
  "name": "string (max 100)",
  "nama": "string (max 100) — alias name",
  "role": "'admin' | 'karyawan'",
  "status": "'pending' | 'approved' | 'rejected'",
  "image": "string (URL foto dari MinIO)",
  "foto": "string (URL foto) — alias image",
  "jabatan": "string (max 100)",
  "phone": "string (10-15 digit, awali +)",
  "alamat": "string (max 500)",
  "faceDescriptor": "string (JSON array float32)",
  "rejectionNotes": "string (JSON array: [{ note, createdAt }])",
  "createdAt": "string (ISO datetime)",
  "updatedAt": "string (ISO datetime)"
}
```

### Absensi

```json
{
  "id": "number (auto-increment)",
  "userId": "string (UUID user)",
  "tanggal": "string (YYYY-MM-DD)",
  "checkIn": "string (ISO datetime) | null",
  "checkOut": "string (ISO datetime) | null",
  "status": "'hadir' | 'terlambat' | 'pulang_cepat' | 'izin' | 'sakit' | 'cuti' | 'tidakHadir' | 'checkInOnly'",
  "mainCategory": "'physical_present' | 'absent_permit' | 'absent_unpermit'",
  "subCategory": "string — lihat category system",
  "faceVerified": "boolean",
  "photos": "[{ type: string, url: string, capturedAt: string }]",
  "keterangan": "string",
  "createdAt": "string (ISO datetime)"
}
```

### Pengajuan

```json
{
  "id": "number",
  "userId": "string (UUID)",
  "jenis": "'cuti' | 'izin' | 'sakit'",
  "tanggalMulai": "string (YYYY-MM-DD)",
  "tanggalSelesai": "string (YYYY-MM-DD)",
  "alasan": "string (10-500 chars)",
  "status": "'pending' | 'approved' | 'rejected'",
  "catatan": "string",
  "createdAt": "string (ISO datetime)"
}
```

---

## Attendance Category System

| Main Category | Sub Categories | Legacy Status |
|---------------|----------------|---------------|
| `physical_present` | `physical_standard`, `physical_flexible`, `physical_field`, `physical_overtime`, `physical_violation` | hadir, terlambat, pulang_cepat |
| `absent_permit` | `leave_annual`, `leave_maternity`, `leave_long`, `permit_sick`, `permit_personal`, `permit_general` | izin, sakit, cuti |
| `absent_unpermit` | `unpermit_absent`, `unpermit_partial`, `unpermit_suspension` | tidakHadir |

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
