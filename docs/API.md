# API Reference

**Base URL:** `http://localhost:3001`

> Semua endpoint kecuali login/register membutuhkan cookie session (better-auth).

---

## Data Models

### User

```json
{
  "id": "string (UUID)",
  "email": "string (unique)",
  "nama": "string (max 100)",
  "jabatan": "string (max 100)",
  "role": "'admin' | 'karyawan'",
  "status": "'pending' | 'approved' | 'rejected'",
  "rejectionNotes": "[{ note: string, createdAt: string }]",
  "foto": "string (base64 image)",
  "phone": "string (10-15 digit)",
  "alamat": "string (max 500)",
  "faceDescriptor": "string (JSON array float32)",
  "createdAt": "string (ISO date)"
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
  "status": "'hadir' | 'terlambat' | 'pulang_cepat' | 'izin' | 'sakit' | 'cuti' | 'tidakHadir'",
  "mainCategory": "string — lihat category system",
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

### Dashboard

#### DayAttendanceData
```json
{
  "tanggal": "YYYY-MM-DD",
  "hadir": "number", "pulangCepat": "number", "terlambat": "number",
  "checkInOnly": "number", "izin": "number", "sakit": "number", "cuti": "number",
  "tidakHadir": "number",
  "present": "number", "absentPermit": "number", "absentUnpermit": "number"
}
```

#### AdminWeekChartItem
```json
{
  "name": "string (day name)",
  "hadir": "number", "terlambat": "number",
  "izin": "number", "sakit": "number", "cuti": "number", "tidakHadir": "number",
  "present": "number", "absentPermit": "number", "absentUnpermit": "number",
  "persen": "number (0-100)"
}
```

#### AdminWeekSummary
```json
{
  "totalKaryawan": "number",
  "hadirHariIni": "number", "terlambatHariIni": "number", "izinHariIni": "number",
  "belumAbsen": "number",
  "totalAbsensiBulanIni": "number",
  "weekAvg": "number (0-100)",
  "bestDay": "{ name: string, persen: number } | null",
  "presentMonth": "number", "permitMonth": "number", "unpermitMonth": "number"
}
```

### Attendance Category System

```json
[
  { "id": "physical_present",    "parentId": null,           "label": "Kehadiran Fisik",             "type": "present" },
  { "id": "physical_standard",   "parentId": "physical_present", "label": "Hadir Standar",          "type": "present" },
  { "id": "physical_flexible",   "parentId": "physical_present", "label": "Hadir Fleksibel",        "type": "present" },
  { "id": "physical_field",      "parentId": "physical_present", "label": "Dinas Luar",             "type": "present" },
  { "id": "physical_overtime",   "parentId": "physical_present", "label": "Lembur",                 "type": "present" },
  { "id": "physical_violation",  "parentId": "physical_present", "label": "Pelanggaran Jam",        "type": "present" },
  { "id": "absent_permit",       "parentId": null,           "label": "Ketidakhadiran Berizin",     "type": "absent_permit" },
  { "id": "leave_annual",        "parentId": "absent_permit",    "label": "Cuti Tahunan",            "type": "absent_permit" },
  { "id": "leave_maternity",     "parentId": "absent_permit",    "label": "Cuti Melahirkan",         "type": "absent_permit" },
  { "id": "leave_long",          "parentId": "absent_permit",    "label": "Cuti Besar",              "type": "absent_permit" },
  { "id": "permit_sick",         "parentId": "absent_permit",    "label": "Izin Sakit",              "type": "absent_permit" },
  { "id": "permit_personal",     "parentId": "absent_permit",    "label": "Izin Personal",           "type": "absent_permit" },
  { "id": "permit_general",      "parentId": "absent_permit",    "label": "Izin Umum",               "type": "absent_permit" },
  { "id": "absent_unpermit",     "parentId": null,           "label": "Ketidakhadiran Tanpa Izin",  "type": "absent_unpermit" },
  { "id": "unpermit_absent",     "parentId": "absent_unpermit",  "label": "Alfa",                   "type": "absent_unpermit" },
  { "id": "unpermit_partial",    "parentId": "absent_unpermit",  "label": "Mangkir Parsial",         "type": "absent_unpermit" },
  { "id": "unpermit_suspension", "parentId": "absent_unpermit",  "label": "Skorsing",               "type": "absent_unpermit" }
]
```

---

## Authentication

### `POST /api/auth/sign-in/email` — Login
```json
// Request
{ "email": "andika@stekom.ac.id", "password": "password" }
// Response 200
{ "user": { "id": "uuid", "email": "...", "role": "admin", ... }, "session": { ... } }
// Error 400 / 429
{ "message": "Email atau password salah" }
```
- Rate limit: 3 gagal → blokir 30 detik (per email + per IP)

### `POST /api/auth/sign-out` — Logout
- Cookie session required

### `GET /api/auth/get-session` — Cek Session
```json
// 200 — login
{ "user": { "id": "uuid", "email": "...", "role": "admin", "name": "...", "nama": "...", ... }, "session": { ... } }
// 200 — tidak login
{ "user": null, "session": null }
```

### `GET /api/me` — Profile Lengkap
- Menggabungkan data session + profile dari db.json

---

## Users

| Method | Path | Auth | Deskripsi |
|--------|------|------|-----------|
| POST | `/api/register` | Publik / Admin | Daftar akun baru |
| GET | `/users` | Login | List users (non-admin hanya lihat dirinya) |
| GET | `/api/users/pending` | Admin | User dengan status pending |
| GET | `/api/users/all` | Admin | Semua user |
| PATCH | `/users/:id` | Login | Update profil sendiri |
| PATCH | `/api/users/:id` | Admin | Update user (termasuk role) |
| PATCH | `/api/users/:id/status` | Admin | Approve/reject user |
| DELETE | `/api/users/:id` | Admin | Hapus user + data terkait |

### Register — `POST /api/register`
```json
// Request
{ "email": "user@example.com", "password": "Min8chars1", "nama": "Nama", "jabatan": "Staff IT", "phone": "081234567890" }
// Response 201
{ "user": { "id": "uuid", "email": "...", "nama": "...", "role": "karyawan", "status": "pending", ... } }
```

### Filter params untuk `GET /users`
| Param | Contoh | Fungsi |
|-------|--------|--------|
| `q` | `andi` | Full-text search (nama, email, jabatan) |
| `role` | `admin` | Filter by role |
| `_sort` | `nama` | Sort field |
| `_order` | `asc` / `desc` | Sort direction |
| `_page` | `1` | Pagination |
| `_limit` | `10` | Items per page |

---

## Absensi

| Method | Path | Auth | Deskripsi |
|--------|------|------|-----------|
| GET | `/absensi` | Login | List absensi dengan filter |
| GET | `/api/absensi/search` | Login | Search absensi by nama karyawan |
| POST | `/absensi` | Login | Check-in |
| PATCH | `/absensi/:id` | Login | Check-out |

### Check-in — `POST /absensi`
```json
// Request dikirim frontend
{ "userId": "uuid", "tanggal": "2026-07-24", "checkIn": "2026-07-24T07:45:00Z", "photos": [...] }
// Yang tersimpan (server override status + category)
{ "userId": "...", "tanggal": "...", "checkIn": "...", "checkOut": null,
  "status": "hadir|terlambat",
  "mainCategory": "physical_present",
  "subCategory": "physical_standard|physical_violation",
  "faceVerified": false, "photos": [...], "createdAt": "..." }
```

### Check-out — `PATCH /absensi/:id`
```json
// Request
{ "checkOut": "2026-07-24T16:30:00Z", "photos": [...] }
// Response — full updated object
```

### Filter params untuk `GET /absensi` dan `GET /api/absensi/search`

| Param | Contoh | Fungsi |
|-------|--------|--------|
| `userId` | `uuid` | Filter by user |
| `tanggal` | `2026-07-24` | Filter exact date |
| `tanggal_gte` | `2026-07-01` | Filter start date |
| `tanggal_lte` | `2026-07-31` | Filter end date |
| `status` | `hadir` | Filter by status (array: `?status=hadir&status=terlambat`) |
| `mainCategory` | `physical_present` | Filter by main category |
| `subCategory` | `physical_standard` | Filter by sub category |
| `q` | `andi` | Search by user name (hanya `/api/absensi/search`) |
| `_sort` | `tanggal` | Sort field |
| `_order` | `desc` | Sort direction |
| `_page` | `1` | Page number |
| `_limit` | `10` | Items per page |

Response header: `x-total-count` — total data untuk pagination.

---

## Pengajuan

| Method | Path | Auth | Deskripsi |
|--------|------|------|-----------|
| GET | `/pengajuan` | Login | List pengajuan |
| POST | `/pengajuan` | Login | Buat pengajuan baru |
| PATCH | `/pengajuan/:id` | Login | Update status (admin) / edit (karyawan) |
| DELETE | `/pengajuan/:id` | Login | Hapus (hanya pending) |

### Create — `POST /pengajuan`
```json
// Request
{ "userId": "uuid", "jenis": "cuti", "tanggalMulai": "2026-07-25", "tanggalSelesai": "2026-07-27", "alasan": "Acara keluarga" }
// Server auto-add
{ ..., "status": "pending", "catatan": "", "createdAt": "..." }
```

### Filter params untuk `GET /pengajuan`
| Param | Contoh | Fungsi |
|-------|--------|--------|
| `userId` | `uuid` | Filter by user |
| `jenis` | `cuti` | Filter by jenis |
| `status` | `pending` | Filter by status |

---

## Dashboard

| Method | Path | Auth | Deskripsi |
|--------|------|------|-----------|
| GET | `/api/dashboard/recent` | Login | 7 hari terakhir (per user) |
| GET | `/api/dashboard/admin/week` | Admin | Ringkasan mingguan + chart |
| GET | `/api/dashboard/month` | Login | Data bulanan (kalender) |

### `/api/dashboard/recent?userId=uuid`
```json
{ "data": [{ "tanggal": "2026-07-23", "checkIn": "...", "checkOut": "...", "status": "hadir" }, ...] }
```

### `/api/dashboard/admin/week`
```json
{ "chart": [{ "name": "Sen", "hadir": 10, "terlambat": 2, "izin": 1, "sakit": 0, "cuti": 1, "tidakHadir": 2, "present": 9, "absentPermit": 1, "absentUnpermit": 1, "persen": 75 }],
  "summary": { "totalKaryawan": 15, "hadirHariIni": 10, "presentMonth": 120, "permitMonth": 5, "unpermitMonth": 2, ... } }
```

### `/api/dashboard/month?tahun=2026&bulan=7&userId=uuid` (opsional)
```json
{ "data": [{ "tanggal": "2026-07-13", "hadir": 5, "present": 4, "absentPermit": 1, "absentUnpermit": 0, ... }], "totalKaryawan": 15 }
```

---

## Error Codes

| Kode | Arti | Penyebab |
|------|------|----------|
| 400 | Bad Request | Validasi gagal |
| 401 | Unauthorized | Tidak login / session expired |
| 403 | Forbidden | Bukan admin |
| 404 | Not Found | Resource tidak ditemukan |
| 429 | Too Many Requests | 3x gagal login |
| 500 | Internal Server Error | Error server |

Semua error: `{ "message": "deskripsi error" }`
