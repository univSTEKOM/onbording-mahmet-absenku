# API Contract — Frontend Data Requirements

Dokumen ini berisi **seluruh kontrak data** yang diharapkan oleh frontend dari backend. Backend harus mengembalikan data sesuai format di bawah agar aplikasi berfungsi dengan benar.

---

## Daftar Isi

1. [Response Format Umum](#1-response-format-umum)
2. [Auth API](#2-auth-api)
3. [Users API](#3-users-api)
4. [Absensi API](#4-absensi-api)
5. [Pengajuan API](#5-pengajuan-api)
6. [Dashboard API](#6-dashboard-api)
7. [Data Types Reference](#7-data-types-reference)
8. [Validation Rules](#8-validation-rules)
9. [Date & Time Formats](#9-date--time-formats)
10. [Error Codes](#10-error-codes)

---

## 1. Response Format Umum

### Success Response

Semua response sukses berbentuk **JSON langsung** (tidak dibungkus wrapper). Contoh:

```json
// GET /users → array langsung
[{ "id": "abc", "email": "...", ... }]

// POST /absensi → object langsung
{ "id": 1, "userId": "abc", ... }
```

Pengecualian: **Dashboard endpoints** (`/api/dashboard/*`) membungkus data dalam properti `data`:

```json
// GET /api/dashboard/recent?userId=xxx
{ "data": [{ "tanggal": "2026-07-25", "checkIn": null, ... }] }

// GET /api/dashboard/month?tahun=2026&bulan=7
{ "data": [{ "tanggal": "2026-07-13", ... }], "totalKaryawan": 15 }
```

### Error Response

Semua error berbentuk:

```json
{ "message": "Deskripsi error" }
```

HTTP status code menentukan jenis error (401, 403, 404, 400, 429, 500).

### Pagination

`GET /absensi` dan `GET /pengajuan` menggunakan **header** untuk pagination:

| Header | Contoh | Keterangan |
|--------|--------|------------|
| `x-total-count` | `42` | Total jumlah record (sebelum filter _page/_limit) |

Frontend membaca header ini di `getAbsensiPaginated()`.

---

## 2. Auth API

### 2.1 Login — Better Auth `signIn.email()`

**Endpoint:** `POST /api/auth/sign-in/email`

**Request:**
```json
{
  "email": "string (required, valid email)",
  "password": "string (required, min 8 chars)"
}
```

**Response 200:**
```json
{
  "user": {
    "id": "string (UUID)",
    "email": "string",
    "name": "string",
    "role": "'admin' | 'karyawan'"
  },
  "session": {
    "id": "string",
    "token": "string"
  }
}
```

**Rate Limiting:** 3 attempts → block 30s–120s. Response 429:
```json
{ "message": "Terlalu banyak percobaan. Coba lagi 27 detik lagi." }
```

### 2.2 Session Check — Better Auth `useSession()`

**Endpoint:** `GET /api/auth/get-session`

**Response 200 (login):**
```json
{
  "user": {
    "id": "string (UUID)",
    "email": "string",
    "name": "string",
    "role": "'admin' | 'karyawan'",
    "image": "string | null",
    "createdAt": "string (ISO datetime)"
  },
  "session": {
    "id": "string",
    "token": "string",
    "expiresAt": "string (ISO datetime)"
  }
}
```

**Response 200 (tidak login):**
```json
{
  "user": null,
  "session": null
}
```

### 2.3 Logout — Better Auth `signOut()`

**Endpoint:** `POST /api/auth/sign-out`

**Response 200:**
```json
{ "success": true }
```

### 2.4 Profile Merge — `GET /api/me`

Dipanggil setelah login untuk menggabungkan data dari `db.json` dengan session user.

**Endpoint:** `GET /api/me`

**Akses:** Cookie session

**Response 200:**
```json
{
  "user": {
    "id": "string (UUID)",
    "email": "string",
    "nama": "string",
    "jabatan": "string",
    "role": "'admin' | 'karyawan'",
    "status": "'pending' | 'approved' | 'rejected'",
    "rejectionNotes": [{ "note": "string", "createdAt": "string (ISO)" }],
    "foto": "string (base64/URL | '' )",
    "phone": "string",
    "alamat": "string",
    "createdAt": "string (ISO datetime)"
  }
}
```

> **Penting:** Field `name` dari session user di-merge dengan field `nama` dari `/api/me`. Frontend menggunakan key `nama`, bukan `name`.

### 2.6 Register — `POST /api/register`

**Endpoint:** `POST /api/register`

**Akses:** Publik (tanpa login) atau Admin (jika login sebagai admin)

**Request:**
```json
{
  "email": "string (required, valid email)",
  "password": "string (required, min 8)",
  "nama": "string (required, max 100)",
  "jabatan": "string (required, max 100)",
  "phone": "string (optional, 10-15 digit)",
  "role": "'karyawan' | 'admin' (optional, default 'karyawan')"
}
```

**Response 201:**
```json
{
  "user": {
    "id": "string (UUID)",
    "email": "string",
    "nama": "string",
    "jabatan": "string",
    "role": "'admin' | 'karyawan'",
    "status": "'pending' | 'approved'",
    "rejectionNotes": [],
    "foto": "",
    "phone": "string",
    "alamat": "string",
    "createdAt": "string (ISO datetime)"
  }
}
```

**Aturan:**
- Jika request dari admin login → `role` sesuai body, `status` = `approved`
- Jika request publik → `role` = `karyawan`, `status` = `pending`
- **Wajib:** User juga dibuat di Better Auth (`user` table) agar bisa login

---

## 3. Users API

### 3.1 Get All Users — `GET /users`

**Akses:** Cookie session

**Response 200:** `User[]`
```json
[
  {
    "id": "string (UUID)",
    "email": "string",
    "nama": "string",
    "jabatan": "string",
    "role": "'admin' | 'karyawan'",
    "status": "'pending' | 'approved' | 'rejected'",
    "rejectionNotes": [{ "note": "string", "createdAt": "string (ISO)" }],
    "foto": "string",
    "phone": "string",
    "alamat": "string",
    "createdAt": "string (ISO datetime)"
  }
]
```

### 3.2 Update User — `PATCH /users/:id`

**Akses:** Cookie session (user update profil sendiri)

**Request:**
```json
{
  "nama": "string (optional, max 100)",
  "email": "string (optional, max 100, valid format)",
  "jabatan": "string (optional, max 100)",
  "phone": "string (optional, 10-15 digit)",
  "alamat": "string (optional, max 500)",
  "foto": "string (optional, base64 image)",
  "role": "'admin' | 'karyawan' (optional, admin only)"
}
```

**Response 200:** `User` yang sudah diupdate

**Catatan penting:**
- Jika user berstatus `rejected`, update profil akan mengubah status ke `pending` + hapus `rejectionNotes`
- Field `status`, `rejectionNotes`, `role`, `id`, `createdAt` **tidak boleh diubah** oleh user biasa (hanya admin via endpoint terpisah)
- Update juga harus sinkron ke Better Auth `user` table

### 3.3 Admin Update Status — `PATCH /api/users/:id/status`

**Akses:** Admin

**Request (approve):**
```json
{ "status": "approved" }
```

**Request (reject):**
```json
{ "status": "rejected", "note": "string (alasan penolakan)" }
```

**Response 200:**
```json
{ "message": "Status berhasil diubah ke approved" }
```

### 3.4 Admin Tambah Catatan — `POST /api/users/:id/notes`

**Akses:** Admin

**Request:**
```json
{ "note": "string (catatan tambahan)" }
```

**Response 200:**
```json
{ "message": "Catatan ditambahkan" }
```

### 3.5 Admin Delete User — `DELETE /api/users/:id`

**Akses:** Admin

**Response 200:**
```json
{ "message": "User dan semua data terkait berhasil dihapus" }
```

**Wajib menghapus dari:**
1. Better Auth `user` table (Drizzle ORM — `db.delete(usersSchema).where(eq(usersSchema.id, id))`)
2. Better Auth `session` table (semua session user ini)
3. Better Auth `account` table
4. Data absensi milik user
5. Data pengajuan milik user

> ✅ Tanpa `.run()` — Drizzle v0.45+ langsung `await db.delete()`

### 3.6 Get Pending Users — `GET /api/users/pending`

**Akses:** Admin

**Response 200:** `User[]` (hanya yang `status: "pending"`)

### 3.7 Get All Users (Admin) — `GET /api/users/all`

**Akses:** Admin

**Response 200:** `User[]`

Frontend menggunakan ini sebagai alternatif jika `GET /users` tidak menyediakan data lengkap.

---

## 4. Absensi API

### 4.1 Get Absensi — `GET /absensi`

**Akses:** Cookie session

**Query Parameters:**

| Parameter | Tipe | Contoh | Wajib |
|-----------|------|--------|-------|
| `userId` | string | `abc123` | tidak |
| `tanggal` | string | `2026-07-25` | tidak |
| `tanggal_gte` | string | `2026-07-01` | tidak |
| `tanggal_lte` | string | `2026-07-31` | tidak |
| `status` | string | `hadir` | tidak |
| `_sort` | string | `tanggal` | tidak |
| `_order` | string | `asc` / `desc` | tidak |
| `_page` | number | `1` | tidak |
| `_limit` | number | `10` | tidak |

**Response 200:** `Absensi[]`
```json
[
  {
    "id": "number",
    "userId": "string",
    "tanggal": "string (YYYY-MM-DD)",
    "checkIn": "string (ISO datetime) | null",
    "checkOut": "string (ISO datetime) | null",
    "status": "'hadir' | 'terlambat' | 'pulang_cepat' | 'izin' | 'sakit' | 'cuti'",
    "faceVerified": "boolean",
    "photos": [
      {
        "type": "'check_in' | 'check_out'",
        "url": "string (base64 image)",
        "capturedAt": "string (ISO datetime)"
      }
    ],
    "keterangan": "string",
    "createdAt": "string (ISO datetime)"
  }
]
```

**Header:** `x-total-count: number` — total record (sebelum `_page`/`_limit`)

### 4.2 Get Single Absensi — `GET /absensi/:id`

**Response 200:** `Absensi`

Dipanggil oleh `checkOut()` sebelum patch untuk mengambil photos existing.

### 4.3 Check-In — `POST /absensi`

**Akses:** Cookie session

**Request:**
```json
{
  "userId": "string (required)",
  "tanggal": "string (required, YYYY-MM-DD)",
  "checkIn": "string (required, ISO datetime)",
  "status": "'hadir' | 'terlambat'",
  "faceVerified": "boolean",
  "photos": [{ "type": "check_in", "url": "string", "capturedAt": "string (ISO)" }],
  "keterangan": "string",
  "createdAt": "string (ISO datetime)"
}
```

**Aturan server:**
| Kondisi | Action |
|---------|--------|
| `time < 06:45` | 400: "Absensi dibuka pukul 06:45" |
| `time >= 06:45 && time <= 07:45` | Status = `hadir` |
| `time > 07:45` | Status = `terlambat` |
| User sudah absen hari ini | 400: "Sudah absen hari ini" |

**Response 201:** `Absensi`

### 4.4 Check-Out — `PATCH /absensi/:id`

**Akses:** Cookie session

**Request:**
```json
{
  "checkOut": "string (required, ISO datetime)",
  "photos": [{ "type": "check_out", "url": "string", "capturedAt": "string (ISO)" }]
}
```

**Aturan server:**
| Kondisi | Action |
|---------|--------|
| `checkOut time < 16:00` | Status = `pulang_cepat` |
| `checkOut time >= 16:00` | Status tetap (tidak diubah) |

**Response 200:** `Absensi` (yang sudah diupdate)

---

## 5. Pengajuan API

### 5.1 Get Pengajuan — `GET /pengajuan`

**Akses:** Cookie session

**Query Parameters:**

| Parameter | Tipe | Contoh |
|-----------|------|--------|
| `userId` | string | `abc123` |
| `status` | string | `pending` |
| `jenis` | string | `cuti` |
| `_sort` | string | `createdAt` |
| `_order` | string | `asc` / `desc` |
| `_page` | number | `1` |
| `_limit` | number | `10` |

**Response 200:** `Pengajuan[]`
```json
[
  {
    "id": "number",
    "userId": "string",
    "jenis": "'cuti' | 'izin' | 'sakit'",
    "tanggalMulai": "string (YYYY-MM-DD)",
    "tanggalSelesai": "string (YYYY-MM-DD)",
    "alasan": "string (max 500)",
    "status": "'pending' | 'approved' | 'rejected'",
    "catatan": "string",
    "createdAt": "string (ISO datetime)"
  }
]
```

### 5.2 Create Pengajuan — `POST /pengajuan`

**Akses:** Cookie session

**Request:**
```json
{
  "userId": "string (required)",
  "jenis": "'cuti' | 'izin' | 'sakit' (required)",
  "tanggalMulai": "string (required, YYYY-MM-DD)",
  "tanggalSelesai": "string (required, YYYY-MM-DD)",
  "alasan": "string (required, 10-500 chars)",
  "status": "'pending' (auto)",
  "catatan": "'' (auto)",
  "createdAt": "string (auto, ISO datetime)"
}
```

**Response 201:** `Pengajuan`

### 5.3 Update Pengajuan (Karyawan) — `PATCH /pengajuan/:id`

**Akses:** Cookie session (hanya pemilik, hanya jika `status === 'pending'`)

**Request:**
```json
{
  "jenis": "'cuti' | 'izin' | 'sakit'",
  "tanggalMulai": "string (YYYY-MM-DD)",
  "tanggalSelesai": "string (YYYY-MM-DD)",
  "alasan": "string (10-500 chars)"
}
```

**Response 200:** `Pengajuan`

### 5.4 Update Status (Admin) — `PATCH /pengajuan/:id`

**Akses:** Cookie session (admin, hanya jika `status === 'pending'`)

**Request:**
```json
{
  "status": "'approved' | 'rejected'",
  "catatan": "string (wajib jika rejected)"
}
```

**Response 200:** `Pengajuan`

### 5.5 Delete Pengajuan — `DELETE /pengajuan/:id`

**Akses:** Cookie session (hanya jika `status === 'pending'`)

**Response 200:** `{}`

---

## 6. Dashboard API

### 6.1 Recent Absensi (Karyawan) — `GET /api/dashboard/recent`

**Query:**
```json
{ "userId": "string (required)" }
```

**Response 200:**
```json
{
  "data": [
    {
      "tanggal": "string (YYYY-MM-DD)",
      "checkIn": "string (ISO datetime) | null",
      "checkOut": "string (ISO datetime) | null",
      "status": "string | null"
    }
  ]
}
```

7 hari terakhir yang memiliki data absensi.

### 6.2 Admin Weekly Summary — `GET /api/dashboard/admin/week`

**Akses:** Cookie session (admin)

**Response 200:**
```json
{
  "chart": [
    {
      "name": "string (nama hari, e.g. 'Sen')",
      "hadir": "number",
      "terlambat": "number",
      "izin": "number",
      "sakit": "number",
      "cuti": "number",
      "tidakHadir": "number",
      "persen": "number (persentase hadir)"
    }
  ],
  "summary": {
    "totalKaryawan": "number",
    "hadirHariIni": "number",
    "terlambatHariIni": "number",
    "izinHariIni": "number",
    "belumAbsen": "number",
    "totalAbsensiBulanIni": "number",
    "weekAvg": "number (rata-rata persentase 7 hari)",
    "bestDay": { "name": "string", "persen": "number" } | null
  }
}
```

### 6.3 Month Attendance — `GET /api/dashboard/month`

**Query:**
```json
{
  "tahun": "number (e.g. 2026)",
  "bulan": "number (1-12)",
  "userId": "string (optional, filter per user)"
}
```

**Response 200:**
```json
{
  "data": [
    {
      "tanggal": "string (YYYY-MM-DD)",
      "hadir": "number",
      "pulangCepat": "number",
      "terlambat": "number",
      "checkInOnly": "number",
      "izin": "number",
      "sakit": "number",
      "cuti": "number",
      "tidakHadir": "number"
    }
  ],
  "totalKaryawan": "number"
}
```

Data per tanggal dalam bulan tersebut. Hari sebelum `APP_RELEASE_DATE` atau setelah hari ini: semua field `0`.

---

## 7. Data Types Reference

### 7.1 User

```typescript
interface User {
  id: string                    // UUID
  email: string                 // unique, valid format
  nama: string                  // display name (NOT "name")
  jabatan: string               // job title
  role: 'admin' | 'karyawan'
  status: 'pending' | 'approved' | 'rejected'
  rejectionNotes: RejectionNote[]
  foto: string                  // base64 data URL or URL, empty string if none
  phone: string
  alamat: string
  createdAt: string             // ISO 8601 datetime
}

interface RejectionNote {
  note: string
  createdAt: string             // ISO 8601
}
```

> **⚠️ Penting:** Frontend menggunakan key `nama`, bukan `name`. Field `password` sudah dihapus dari tipe (tidak perlu dikirim).

### 7.2 Absensi

```typescript
interface Absensi {
  id: number
  userId: string
  tanggal: string               // YYYY-MM-DD
  checkIn: string | null        // ISO 8601 or null
  checkOut: string | null       // ISO 8601 or null
  status: AbsensiStatus
  faceVerified: boolean
  photos?: Photo[]
  keterangan: string
  createdAt: string             // ISO 8601
}

type AbsensiStatus = 'hadir' | 'terlambat' | 'pulang_cepat' | 'izin' | 'sakit' | 'cuti'

interface Photo {
  type: string                  // 'check_in' | 'check_out'
  url: string                   // base64 data URL
  capturedAt: string            // ISO 8601
}
```

### 7.3 Pengajuan

```typescript
interface Pengajuan {
  id: number
  userId: string
  jenis: 'cuti' | 'izin' | 'sakit'
  tanggalMulai: string          // YYYY-MM-DD
  tanggalSelesai: string        // YYYY-MM-DD
  alasan: string                // 10-500 chars
  status: 'pending' | 'approved' | 'rejected'
  catatan: string
  createdAt: string             // ISO 8601
}
```

### 7.4 Pagination

```typescript
interface PaginatedResult<T> {
  data: T[]
  total: number                 // from x-total-count header
  page: number
  totalPages: number            // Math.ceil(total / limit)
}
```

---

## 8. Validation Rules

Frontend melakukan validasi berikut SEBELUM mengirim request. Backend harus memvalidasi ulang.

| Field | Entity | Min | Max | Pattern / Rules |
|-------|--------|-----|-----|----------------|
| Email | User | 1 | 100 | `/^[^\s@]+@[^\s@]+\.[^\s@]+$/` |
| Password | User | 8 | 50 | — |
| Nama | User | 1 | 100 | — |
| Jabatan | User | 1 | 100 | — |
| Phone | User | 10 digit | 15 digit | hanya angka |
| Alamat | User | — | 500 | — |
| Foto | User | — | 5MB | file image |
| Alasan | Pengajuan | 10 | 500 | — |
| Durasi Pengajuan | Pengajuan | — | 30 hari | tanggalSelesai - tanggalMulai |

---

## 9. Date & Time Formats

### Input (dikirim frontend ke backend)

| Field | Format | Contoh |
|-------|--------|--------|
| `tanggal` | `YYYY-MM-DD` | `2026-07-25` |
| `checkIn` | ISO 8601 | `2026-07-25T07:45:17.830Z` |
| `checkOut` | ISO 8601 | `2026-07-25T16:30:00.000Z` |
| `tanggalMulai` | `YYYY-MM-DD` | `2026-07-25` |
| `tanggalSelesai` | `YYYY-MM-DD` | `2026-07-27` |
| `tanggal_gte` | `YYYY-MM-DD` | `2026-07-01` |
| `tanggal_lte` | `YYYY-MM-DD` | `2026-07-31` |
| `createdAt` | ISO 8601 | `2026-07-25T07:45:17.830Z` |

### Output (backend harus kirim dalam format ini)

| Field | Format | Contoh Tampilan Frontend |
|-------|--------|--------------------------|
| `tanggal` | `YYYY-MM-DD` | `25 Jul 2026` |
| `checkIn` | ISO 8601 atau `null` | `07:45` |
| `checkOut` | ISO 8601 atau `null` | `16:30` |
| `createdAt` | ISO 8601 | — |

Frontend menampilkan tanggal dalam locale `id-ID`:
- **Full date:** `"Jumat, 25 Juli 2026"`
- **Short date:** `"25 Jul 2026"`
- **Time only:** `"07:45"`

### Preset Date Filters

| Preset | Rentang |
|--------|---------|
| `hari_ini` | hari ini |
| `kemarin` | kemarin |
| `7_hari` | 7 hari terakhir (termasuk hari ini) |
| `bulan_ini` | 1 bulan ini sampai hari ini |

---

## 10. Error Codes

| Kode | Arti | Contoh Body |
|------|------|-------------|
| 400 | Bad Request | `{ "message": "Password minimal 8 karakter" }` |
| 401 | Unauthorized | `{ "message": "Unauthorized" }` |
| 403 | Forbidden | `{ "message": "Forbidden" }` |
| 404 | Not Found | `{ "message": "User tidak ditemukan" }` |
| 413 | Payload Too Large | `{ "message": "File terlalu besar" }` |
| 429 | Too Many Requests | `{ "message": "Terlalu banyak percobaan. Coba lagi 27 detik lagi." }` |
| 500 | Internal Server Error | `{ "message": "Internal server error: ..." }` |

---

## Appendix: All Endpoints Summary

| # | Method | Path | Auth | Request Body / Params | Response |
|---|--------|------|------|----------------------|----------|
| 1 | POST | `/api/auth/sign-in/email` | — | `{ email, password }` | `{ user, session }` |
| 2 | POST | `/api/auth/sign-out` | Cookie | — | `{ success }` |
| 3 | GET | `/api/auth/get-session` | Cookie | — | `{ user, session }` |
| 4 | POST | `/api/register` | Optional | `{ email, password, nama, jabatan, phone?, role? }` | `{ user }` |
| 5 | GET | `/api/me` | Cookie | — | `{ user }` |
| 6 | GET | `/users` | Cookie | — | `User[]` |
| 7 | PATCH | `/users/:id` | Cookie | `Partial<User>` | `User` |
| 8 | PATCH | `/api/users/:id/status` | Admin | `{ status, note? }` | `{ message }` |
| 9 | POST | `/api/users/:id/notes` | Admin | `{ note }` | `{ message }` |
| 10 | DELETE | `/api/users/:id` | Admin | — | `{ message }` |
| 11 | GET | `/api/users/pending` | Admin | — | `User[]` |
| 12 | GET | `/api/users/all` | Admin | — | `User[]` |
| 13 | GET | `/absensi` | Cookie | Query params | `Absensi[]` + header |
| 14 | POST | `/absensi` | Cookie | `CheckInData` | `Absensi` |
| 15 | PATCH | `/absensi/:id` | Cookie | `CheckOutData` | `Absensi` |
| 16 | GET | `/pengajuan` | Cookie | Query params | `Pengajuan[]` |
| 17 | POST | `/pengajuan` | Cookie | `PengajuanFormData` | `Pengajuan` |
| 18 | PATCH | `/pengajuan/:id` | Cookie/Admin | `Partial<Pengajuan>` | `Pengajuan` |
| 19 | DELETE | `/pengajuan/:id` | Cookie | — | `{}` |
| 20 | GET | `/api/dashboard/recent` | Cookie | `{ userId }` | `{ data: [...] }` |
| 21 | GET | `/api/dashboard/admin/week` | Cookie | — | `{ chart, summary }` |
| 22 | GET | `/api/dashboard/month` | Cookie | `{ tahun, bulan, userId? }` | `{ data, totalKaryawan }` |
