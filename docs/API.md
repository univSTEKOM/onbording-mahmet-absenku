# API Reference

**Base URL:** `http://localhost:3001`

> Semua endpoint kecuali login/register membutuhkan cookie session (better-auth).

---

## Data Models

### User

```json
{
  "id": "string (UUID)",
  "email": "string (unique, max 100)",
  "nama": "string (max 100)",
  "jabatan": "string (max 100)",
  "role": "'admin' | 'karyawan'",
  "status": "'pending' | 'approved' | 'rejected'",
  "rejectionNotes": "[{ note: string, createdAt: string }]",
  "foto": "string (base64 image)",
  "phone": "string (10-15 digit)",
  "alamat": "string (max 500)",
  "faceDescriptor": "string (JSON array float32, max 10KB)",
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
  "status": "'hadir' | 'terlambat' | 'pulang_cepat' | 'izin' | 'sakit' | 'cuti' | 'tidakHadir' | 'checkInOnly'",
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
  "name": "string (day name, e.g. 'Sen')",
  "hadir": "number", "pulangCepat": "number", "terlambat": "number",
  "izin": "number", "sakit": "number", "cuti": "number", "tidakHadir": "number",
  "present": "number", "absentPermit": "number", "absentUnpermit": "number",
  "persen": "number (0-100)"
}
```
- **Range:** 7 hari kalender penuh sebelum hari ini `(today-7)` sampai `(today-1)`, bukan Monday-based week
- Semua hari sudah lewat — tidak ada `skip future` atau special case `isToday`

#### AdminWeekSummary
```json
{
  "totalKaryawan": "number",
  "hadirHariIni": "number",
  "terlambatHariIni": "number",
  "izinHariIni": "number",
  "alfaHariIni": "number",
  "belumAbsen": "number",
  "totalAbsensiBulanIni": "number",
  "weekAvg": "number (0-100)",
  "bestDay": "{ name: string, persen: number } | null",
  "presentMonth": "number",
  "permitMonth": "number",
  "unpermitMonth": "number"
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

| Aspek | Detail |
|-------|--------|
| **Auth** | None |
| **Rate Limit** | 3 gagal → blokir 30 detik (per email + per IP). Blokir naik kelipatan (60s, 90s, max 120s) |
| **Request** | `{ "email": string, "password": string }` |
| **Response 200** | `{ "token": string, "user": { id, email, name, role, status, ... } }` |
| **Response 429** | `{ "message": "Terlalu banyak percobaan. Coba lagi X detik lagi." }` |
| **Validation** | Email wajib format valid. Password wajib diisi. |

### `POST /api/auth/sign-up/email` — Register (Better Auth bawaan)

| Aspek | Detail |
|-------|--------|
| **Auth** | None |
| **Request** | `{ "email": string, "password": string, "name": string }` |
| **Response 200** | `{ "user": { ... }, "session": { ... }, "token": string }` |
| **Catatan** | Endpoint ini tidak disarankan untuk frontend — gunakan `POST /api/register` yang sudah include profile fields |

### `POST /api/auth/sign-out` — Logout

| Aspek | Detail |
|-------|--------|
| **Auth** | Required (cookie session) |
| **Response 200** | `{ "success": true }` |

### `GET /api/auth/get-session` — Cek Session

| Aspek | Detail |
|-------|--------|
| **Auth** | None |
| **Response 200 (login)** | `{ "user": { id, email, role, name, nama, jabatan, status, ... }, "session": { ... } }` |
| **Response 200 (not login)** | `{ "user": null, "session": null }` |

### `POST /api/register` — Daftar Akun Baru

| Aspek | Detail |
|-------|--------|
| **Auth** | Optional. Jika ada session admin, role bisa di-set manual. Jika publik, role dipaksa `karyawan` dan status `pending`. |
| **Rate Limit** | Max 5 percobaan per IP per 60 detik |
| **Request** | `{ "email": string, "password": string, "nama": string, "jabatan"?: string, "phone"?: string, "alamat"?: string, "role"?: "admin"|"karyawan" }` |
| **Response 201** | `{ "user": { id, email, name, role, status: "pending", jabatan, phone, alamat, createdAt } }` |
| **Response 400** | `{ "message": string }` (validasi) |
| **Response 429** | `{ "message": "Terlalu banyak percobaan pendaftaran. Coba lagi dalam 1 menit." }` |
| **Validation** | `email`: max 100, format email. `password`: min 8, max 50, harus ada huruf + angka. `nama`: max 100, required. `phone`: 10-15 digit (opsional). `jabatan`: max 100 (opsional). `alamat`: max 500 (opsional). |

---

## Profile

### `GET /api/me` — Profile Lengkap

| Aspek | Detail |
|-------|--------|
| **Auth** | Required |
| **Response 200** | Full user object dari db.json + session (password dihapus) |
| **Response 401** | `{ "message": "Unauthorized" }` |

### `PATCH /users/:id` — Update Profile (Self-service)

| Aspek | Detail |
|-------|--------|
| **Auth** | Required. Non-admin hanya bisa update diri sendiri. |
| **Request** | `{ "nama"?: string, "jabatan"?: string, "phone"?: string, "alamat"?: string, "foto"?: string (base64, max 500KB), "faceDescriptor"?: string (max 10KB), "email"?: string }` |
| **Response 200** | Full user object (password dihapus) |
| **Response 400** | `{ "message": string }` |
| **Catatan** | Jika user status `rejected`, update profile otomatis reset status ke `pending`. Sinkron ke Better Auth Drizzle DB. Field `status`, `rejectionNotes`, `role`, `id`, `createdAt` dihapus dari body — tidak bisa diubah lewat endpoint ini. |

---

## Admin — User Management

### `GET /api/users/pending` — User Pending

| Aspek | Detail |
|-------|--------|
| **Auth** | Admin only |
| **Response 200** | `[User, ...]` — semua user dengan `status: "pending"` |

### `GET /api/users/all` — Semua User

| Aspek | Detail |
|-------|--------|
| **Auth** | Admin only |
| **Response 200** | `[User, ...]` — semua user dari db.json |

### `PATCH /api/users/:id` — Update User (Admin)

| Aspek | Detail |
|-------|--------|
| **Auth** | Admin only |
| **URL Params** | `:id` — user ID |
| **Request** | `{ "nama"?: string (max 100), "jabatan"?: string (max 100), "phone"?: string (10-15 digit), "alamat"?: string (max 500), "role"?: "admin"|"karyawan", "foto"?: string (base64, max 500KB), "faceDescriptor"?: string (max 10KB), "email"?: string (max 100) }` |
| **Response 200** | `{ "message": "User berhasil diupdate" }` |
| **Response 400** | `{ "message": string }` (validasi) |
| **Response 404** | `{ "message": "User tidak ditemukan" }` |

### `PATCH /api/users/:id/status` — Approve / Reject User

| Aspek | Detail |
|-------|--------|
| **Auth** | Admin only |
| **URL Params** | `:id` — user ID |
| **Request** | `{ "status": "approved"|"rejected", "note"?: string }` |
| **Response 200** | `{ "message": "Status berhasil diubah ke approved/rejected" }` |
| **Response 400** | `{ "message": "Invalid status" }` |
| **Response 404** | `{ "message": "User tidak ditemukan" }` |
| **Catatan** | Jika approved, `rejectionNotes` dikosongkan. Jika rejected, note (opsional) ditambahkan ke `rejectionNotes[]`. |

### `POST /api/users/:id/notes` — Tambah Catatan Rejection

| Aspek | Detail |
|-------|--------|
| **Auth** | Admin only |
| **URL Params** | `:id` — user ID |
| **Request** | `{ "note": string (max 500 chars) }` |
| **Response 200** | `{ "message": "Catatan ditambahkan" }` |
| **Response 400** | `{ "message": "Catatan harus diisi" }` atau `"Catatan maksimal 500 karakter"` |

### `DELETE /api/users/:id` — Hapus User

| Aspek | Detail |
|-------|--------|
| **Auth** | Admin only |
| **URL Params** | `:id` — user ID |
| **Response 200** | `{ "message": "User dan semua data terkait berhasil dihapus" }` |
| **Response 404** | `{ "message": "User tidak ditemukan" }` |
| **Catatan** | Menghapus user dari Better Auth (accounts, sessions) + db.json (users, absensi, pengajuan). **Permanent.** |

---

## Absensi

### `POST /absensi` — Check-in

| Aspek | Detail |
|-------|--------|
| **Auth** | Required. Non-admin hanya bisa check-in untuk diri sendiri. |
| **Request** | `{ "userId": string, "tanggal": string (YYYY-MM-DD), "checkIn"?: string (ISO), "photos"?: array, "faceVerified"?: boolean, "keterangan"?: string, "createdAt"?: string }` |
| **Response** | Full Absensi object yang tersimpan (server override `status`, `mainCategory`, `subCategory`) |
| **Response 400** | `{ "message": "Data absensi tidak valid" }` / `"Sudah absen hari ini"` / `"Absensi dibuka pukul 06:45."` |
| **Response 403** | `{ "message": "Anda hanya bisa absen untuk diri sendiri" }` |
| **Rules** | Check-in window: 06:45–07:45. Belum 06:45 → ditolak. Sebelum 07:45 → `status: "hadir"`. Sesudah 07:45 → `status: "terlambat"`. `mainCategory` selalu `physical_present`. `subCategory` = `physical_standard` (hadir) atau `physical_violation` (terlambat). |

### `PATCH /absensi/:id` — Check-out

| Aspek | Detail |
|-------|--------|
| **Auth** | Required. Non-admin hanya bisa check-out untuk diri sendiri. |
| **URL Params** | `:id` — ID absensi (number) |
| **Request** | `{ "checkOut": string (ISO datetime), "photos"?: array }` |
| **Response** | Full updated Absensi object |
| **Response 400** | `{ "message": "Data tidak valid" }` |
| **Response 403** | `{ "message": "Anda hanya bisa check-out untuk diri sendiri" }` |
| **Response 404** | `{ "message": "Absensi tidak ditemukan" }` |
| **Rules** | Jika check-out sebelum 16:00, status diubah menjadi `"pulang_cepat"` dan `subCategory` menjadi `"physical_violation"`. Photos dari check-in dipertahankan, photos baru ditambahkan ke array. |

### `GET /absensi` — List Absensi

| Aspek | Detail |
|-------|--------|
| **Auth** | Required. Non-admin hanya melihat data sendiri. |
| **Params** | `userId` (filter), `tanggal`, `tanggal_gte`, `tanggal_lte`, `status` (array), `mainCategory`, `subCategory`, `_sort`, `_order`, `_page`, `_limit` |
| **Response** | Array of Absensi. Header `x-total-count` untuk pagination. |

### `GET /api/absensi/search` — Search Absensi by Nama

| Aspek | Detail |
|-------|--------|
| **Auth** | Required |
| **Params** | Semua filter dari `GET /absensi` **plus** `q` (string — search by nama karyawan) |
| **Response** | Array of Absensi + `x-total-count` header |
| **Catatan** | Endpoint ini join data user untuk search by name. Pagination: `_page` (default 1), `_limit` (default 15). |

### Filter params untuk `GET /absensi` dan `GET /api/absensi/search`

| Param | Contoh | Fungsi |
|-------|--------|--------|
| `userId` | `uuid` | Filter by user |
| `tanggal` | `2026-07-24` | Exact date |
| `tanggal_gte` | `2026-07-01` | Start date (>=) |
| `tanggal_lte` | `2026-07-31` | End date (<=) |
| `status` | `hadir` | Multi-value: `?status=hadir&status=terlambat` |
| `mainCategory` | `physical_present` | Filter by main category |
| `subCategory` | `physical_standard` | Filter by sub category |
| `q` | `andi` | Search by user name (hanya `/api/absensi/search`) |
| `_sort` | `tanggal` | Sort field |
| `_order` | `desc` | Sort direction |
| `_page` | `1` | Page number |
| `_limit` | `10` | Items per page |

---

## Pengajuan

### `POST /pengajuan` — Create

| Aspek | Detail |
|-------|--------|
| **Auth** | Required |
| **Request** | `{ "userId": string, "jenis": "cuti"|"izin"|"sakit", "tanggalMulai": string (YYYY-MM-DD), "tanggalSelesai": string (YYYY-MM-DD), "alasan": string }` |
| **Response** | Full Pengajuan object (server auto-set `status: "pending"`, `catatan: ""`, `createdAt`) |

### `GET /pengajuan` — List

| Aspek | Detail |
|-------|--------|
| **Auth** | Required. Non-admin hanya melihat milik sendiri. |
| **Params** | `userId`, `jenis`, `status` |

### `PATCH /pengajuan/:id` — Update

| Aspek | Detail |
|-------|--------|
| **Auth** | Required |
| **URL Params** | `:id` — ID pengajuan (number) |
| **Request** | `{ "status"?: "approved"|"rejected"|"pending", "catatan"?: string }` |
| **Response 400** | `{ "message": "Pengajuan tidak ditemukan" }` / `"Pengajuan sudah diproses"` / `"Alasan maksimal 500 karakter"` |
| **Rules** | Hanya `pending` yang bisa di-update. `alasan` max 500 chars. |

### `DELETE /pengajuan/:id` — Hapus

| Aspek | Detail |
|-------|--------|
| **Auth** | Required. Non-admin hanya bisa hapus milik sendiri. |
| **URL Params** | `:id` — ID pengajuan (number) |
| **Response 200** | `{ "message": "Dihapus" }` |
| **Response 400** | `{ "message": "Hanya pending yang bisa dihapus" }` |
| **Response 403** | `{ "message": "Anda hanya bisa menghapus pengajuan sendiri" }` |
| **Response 404** | `{ "message": "Pengajuan tidak ditemukan" }` |
| **Rules** | Hanya `pending` yang bisa dihapus. Owner atau admin yang berhak. |

---

## Dashboard

### `GET /api/dashboard/recent` — 7 Hari Terakhir

| Aspek | Detail |
|-------|--------|
| **Auth** | Required |
| **Query** | `userId` (opsional — hanya dipake jika caller adalah admin) |
| **Range** | 7 hari rolling: `(today-6)` sampai `today` |
| **Response 200** | `{ "data": [{ "tanggal": "2026-07-21", "checkIn": "string|null", "checkOut": "string|null", "status": "string|null" }, ...] }` |

### `GET /api/dashboard/admin/week` — Tren Kehadiran 7 Hari

| Aspek | Detail |
|-------|--------|
| **Auth** | Admin only |
| **Range** | 7 hari kalender penuh SEBELUM hari ini: `(today-7)` sampai `(today-1)` |
| **Response 200** | `{ chart: AdminWeekChartItem[], summary: AdminWeekSummary }` |
| **chart[]** | Array 7 item, tidak ada skip (semua hari sudah lewat). Perhitungan `tidakHadir` normal (tidak ada special case isToday). |
| **summary** | Lihat `AdminWeekSummary` di data models. **Catatan:** `alfaHariIni` = totalKaryawan - hadirHariIni - terlambatHariIni - izinHariIni. |

**Contoh response:**
```json
{
  "chart": [
    { "name": "Sen", "hadir": 10, "pulangCepat": 2, "terlambat": 1, "izin": 1, "sakit": 0, "cuti": 0, "tidakHadir": 1, "present": 13, "absentPermit": 1, "absentUnpermit": 1, "persen": 87 },
    { "name": "Sel", "hadir": 9, "pulangCepat": 1, "terlambat": 2, "izin": 0, "sakit": 1, "cuti": 0, "tidakHadir": 2, "present": 12, "absentPermit": 1, "absentUnpermit": 2, "persen": 80 },
    ...
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

### `GET /api/dashboard/month` — Data Bulanan (Kalender)

| Aspek | Detail |
|-------|--------|
| **Auth** | Required |
| **Query** | `tahun` (int, default current year), `bulan` (int 1-12, default current month), `userId` (opsional — admin bisa lihat user lain) |
| **Range** | 1 tanggal — akhir bulan. Data sebelum `APP_RELEASE_DATE` atau setelah hari ini diisi `0`. |
| **Response 200** | `{ "data": DayAttendanceData[], "totalKaryawan": number }` |

---

## Error Codes

| Kode | Arti | Penyebab |
|------|------|----------|
| 400 | Bad Request | Validasi gagal |
| 401 | Unauthorized | Tidak login / session expired |
| 403 | Forbidden | Bukan admin |
| 404 | Not Found | Resource tidak ditemukan |
| 429 | Too Many Requests | Rate limit (login / register) |
| 500 | Internal Server Error | Error server |

Semua error: `{ "message": "deskripsi error" }`

---

## Tipe TypeScript

```typescript
// —————— Data Models ——————

interface User {
  id: string
  email: string
  nama: string
  jabatan: string
  role: 'admin' | 'karyawan'
  status: 'pending' | 'approved' | 'rejected'
  rejectionNotes: { note: string; createdAt: string }[]
  foto: string
  phone: string
  alamat: string
  faceDescriptor: string
  createdAt: string
}

interface Absensi {
  id: number
  userId: string
  tanggal: string
  checkIn: string | null
  checkOut: string | null
  status: AbsensiStatus
  mainCategory?: string
  subCategory?: string
  faceVerified: boolean
  photos: { type: string; url: string; capturedAt: string }[]
  keterangan: string
  createdAt: string
}

type AbsensiStatus = 'hadir' | 'terlambat' | 'pulang_cepat' | 'izin' | 'sakit' | 'cuti' | 'tidakHadir' | 'checkInOnly'

interface Pengajuan {
  id: number
  userId: string
  jenis: PengajuanJenis
  tanggalMulai: string
  tanggalSelesai: string
  alasan: string
  status: PengajuanStatus
  catatan: string
  createdAt: string
}

type PengajuanJenis = 'cuti' | 'izin' | 'sakit'
type PengajuanStatus = 'pending' | 'approved' | 'rejected'

interface AttendanceCategory {
  id: string
  parentId: string | null
  label: string
  type: 'present' | 'absent_permit' | 'absent_unpermit'
  color: string
  requiresApproval: boolean
}

// —————— Attendance Category System ——————

type MainCategoryId = 'physical_present' | 'absent_permit' | 'absent_unpermit'
type SubCategoryId =
  | 'physical_standard' | 'physical_flexible' | 'physical_field'
  | 'physical_overtime' | 'physical_violation'
  | 'leave_annual' | 'leave_maternity' | 'leave_long'
  | 'permit_sick' | 'permit_personal' | 'permit_general'
  | 'unpermit_absent' | 'unpermit_partial' | 'unpermit_suspension'

// —————— Dashboard Types ——————

interface AdminWeekData {
  chart: AdminWeekChartItem[]
  summary: AdminWeekSummary
}

interface AdminWeekChartItem {
  name: string
  hadir: number
  pulangCepat: number
  terlambat: number
  izin: number
  sakit: number
  cuti: number
  tidakHadir: number
  present: number
  absentPermit: number
  absentUnpermit: number
  persen: number  // 0-100
}

interface AdminWeekSummary {
  totalKaryawan: number
  hadirHariIni: number
  terlambatHariIni: number
  izinHariIni: number
  alfaHariIni: number
  belumAbsen: number
  totalAbsensiBulanIni: number
  weekAvg: number  // 0-100
  bestDay: { name: string; persen: number } | null
  presentMonth: number
  permitMonth: number
  unpermitMonth: number
}

interface DayAttendanceData {
  tanggal: string
  hadir: number
  pulangCepat: number
  terlambat: number
  checkInOnly: number
  izin: number
  sakit: number
  cuti: number
  tidakHadir: number
  present: number
  absentPermit: number
  absentUnpermit: number
}

interface MonthData {
  data: DayAttendanceData[]
  totalKaryawan: number
}

interface RecentAbsensiItem {
  tanggal: string
  checkIn: string | null
  checkOut: string | null
  status: string | null
}

// —————— Request Types ——————

interface RegisterRequest {
  email: string
  password: string
  nama: string
  jabatan?: string
  phone?: string
  alamat?: string
  role?: 'admin' | 'karyawan'
}

interface LoginRequest {
  email: string
  password: string
}

interface CheckInRequest {
  userId: string
  tanggal: string
  checkIn?: string
  photos?: { type: string; url: string; capturedAt: string }[]
  faceVerified?: boolean
  keterangan?: string
}

interface CheckOutRequest {
  checkOut: string
  photos?: { type: string; url: string; capturedAt: string }[]
}

interface UpdateUserRequest {
  nama?: string
  email?: string
  jabatan?: string
  phone?: string
  alamat?: string
  foto?: string
  faceDescriptor?: string
}

interface ApproveUserRequest {
  status: 'approved' | 'rejected'
  note?: string
}

interface CreatePengajuanRequest {
  userId: string
  jenis: PengajuanJenis
  tanggalMulai: string
  tanggalSelesai: string
  alasan: string
}

// —————— Absensi Filters ——————

interface AbsensiFilters {
  userId?: string
  tanggal?: string
  tanggal_gte?: string
  tanggal_lte?: string
  status?: string | string[]
  mainCategory?: string | string[]
  subCategory?: string | string[]
  q?: string
  _sort?: string
  _order?: string
  _page?: number
  _limit?: number
}

// —————— Pagination ——————

interface PaginatedResult<T> {
  data: T[]
  total: number
  page: number
  totalPages: number
}
```

---

> **Last updated:** 2026-07-27
> **Changes:** Added `alfaHariIni` field, updated weekly chart range from Monday-based to `(today-7)→(today-1)`, added full endpoint documentation with validation rules, added TypeScript types.
