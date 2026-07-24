# API Reference

**Base URL:** `http://localhost:3001`

## Data Models

### User

```json
{
  "id": "string (UUID dari better-auth)",
  "email": "string (unique)",
  "nama": "string (max 100)",
  "jabatan": "string (max 100)",
  "role": "'admin' | 'karyawan'",
  "status": "'pending' | 'approved' | 'rejected'",
  "rejectionNotes": "[{ note: string, createdAt: string }]",
  "foto": "string (base64 image atau URL)",
  "phone": "string (10-15 digit)",
  "alamat": "string (max 500)",
  "createdAt": "string (ISO date)"
}
```

### Absensi

```json
{
  "id": "number (auto-increment json-server)",
  "userId": "string (UUID user)",
  "tanggal": "string (YYYY-MM-DD)",
  "checkIn": "string (ISO datetime | null)",
  "checkOut": "string (ISO datetime | null)",
  "status": "'hadir' | 'terlambat' | 'pulang_cepat' | 'izin' | 'sakit' | 'cuti'",
  "faceVerified": "boolean",
  "photos": "[{ type: string, url: string, capturedAt: string }]",
  "keterangan": "string",
  "createdAt": "string (ISO datetime)"
}
```

### Pengajuan

```json
{
  "id": "number (auto-increment json-server)",
  "userId": "string (UUID user)",
  "jenis": "'cuti' | 'izin' | 'sakit'",
  "tanggalMulai": "string (YYYY-MM-DD)",
  "tanggalSelesai": "string (YYYY-MM-DD)",
  "alasan": "string (max 500)",
  "status": "'pending' | 'approved' | 'rejected'",
  "catatan": "string",
  "createdAt": "string (ISO datetime)"
}
```

### DayAttendanceData (Dashboard)

```json
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
```

---

## Authentication

Semua endpoint `/api/auth/*` menggunakan **cookie-based session** dari better-auth. Setelah login, session cookie otomatis dikirim oleh browser.

### `POST /api/auth/sign-in/email` — Login

**Request:**
```json
{ "email": "andika@stekom.ac.id", "password": "password" }
```

**Response 200:**
```json
{
  "user": { "id": "uuid", "email": "andika@stekom.ac.id", "name": "Andika", "role": "admin", ... },
  "session": { "id": "uuid", "token": "string", ... }
}
```

**Error Responses:**
| Code | Kondisi |
|------|---------|
| 400 | Email/password salah |
| 429 | 3x gagal login — blokir sementara |

**Contoh:**
```bash
curl -X POST http://localhost:3001/api/auth/sign-in/email \
  -H "Content-Type: application/json" \
  -d '{"email":"andika@stekom.ac.id","password":"password"}' \
  -c cookies.txt
```

### `POST /api/auth/sign-out` — Logout

**Headers:** Cookie dari login sebelumnya

**Response 200:**
```json
{ "success": true }
```

**Contoh:**
```bash
curl -X POST http://localhost:3001/api/auth/sign-out -b cookies.txt
```

### `GET /api/auth/get-session` — Cek Session

**Response 200:**
```json
{
  "user": { "id": "uuid", "email": "...", "role": "admin", ... },
  "session": { "id": "uuid", ... }
}
```

Jika tidak login: `{ "user": null, "session": null }`

---

## Users

### `POST /api/register` — Daftar Akun Baru

**Akses:** Publik (tanpa login) atau Admin (jika login sebagai admin)

**Request:**
```json
{
  "email": "user@example.com",
  "password": "min8chars",
  "nama": "Nama User",
  "jabatan": "Staff IT",
  "phone": "081234567890",
  "role": "karyawan"
}
```

**Response 201:**
```json
{ "user": { "id": "uuid", "email": "...", "nama": "...", "role": "karyawan", "status": "pending", ... } }
```

**Aturan:**
- Jika request dari admin yang login: `role` sesuai body, `status` = `approved`
- Jika request publik: `role` = `karyawan`, `status` = `pending`
- Validasi: email format valid, password min 8, nama max 100, jabatan max 100

**Error:**
| Code | Kondisi |
|------|---------|
| 400 | Validasi gagal |

### `GET /api/me` — Profile Sendiri

**Akses:** Cookie login

**Response 200:** User object (merge session user + data dari db.json)

### `PATCH /users/:id` — Update Profile

**Akses:** Cookie login (user update profil sendiri)

**Request:**
```json
{ "nama": "Nama Baru", "jabatan": "Staff Senior", "phone": "081234567890", "alamat": "Jl. Baru", "foto": "data:image/jpeg;base64,..." }
```

**Response 200:** User object yang sudah diupdate

**Validasi:**
| Field | Syarat |
|-------|--------|
| nama | max 100, tidak boleh kosong |
| email | max 100, format valid |
| jabatan | max 100 |
| phone | 10-15 digit (hanya angka) |
| alamat | max 500 |
| foto | base64 image |

**Catatan:** Jika user berstatus `rejected`, update profil akan otomatis mengubah status ke `pending` dan menghapus `rejectionNotes`.

### `GET /api/users/all` — [Admin] Semua User

**Akses:** Admin

**Response 200:** `User[]`

### `GET /api/users/pending` — [Admin] User Pending

**Akses:** Admin

**Response 200:** `User[]` (hanya yang `status: "pending"`)

### `PATCH /api/users/:id/status` — [Admin] Approve/Reject

**Akses:** Admin

**Request:**
```json
{ "status": "approved", "note": "Selamat bergabung" }
```

| Field | Wajib | Keterangan |
|-------|-------|------------|
| status | ya | `"approved"` atau `"rejected"` |
| note | tidak | Catatan, tersimpan di `rejectionNotes` jika reject |

**Response 200:** `{ "message": "Status berhasil diubah ke approved" }`

### `POST /api/users/:id/notes` — [Admin] Tambah Catatan

**Akses:** Admin

**Request:**
```json
{ "note": "Catatan tambahan untuk user ini" }
```

**Response 200:** `{ "message": "Catatan ditambahkan" }`

### `DELETE /api/users/:id` — [Admin] Hapus User

**Akses:** Admin

**Response 200:** `{ "message": "User dan semua data terkait berhasil dihapus" }`

Menghapus dari:
- better-auth (accounts, sessions, users table)
- db.json (users, absensi, pengajuan milik user)

---

## Absensi

### `POST /absensi` — Check-In

**Akses:** Cookie login

**Request:**
```json
{
  "userId": "uuid",
  "tanggal": "2026-07-24",
  "checkIn": "2026-07-24T07:45:00.000Z",
  "faceVerified": true,
  "photos": [{ "type": "check_in", "url": "data:image/...", "capturedAt": "..." }]
}
```

**Aturan:**
| Kondisi | Response |
|---------|----------|
| Sebelum 06:45 | 400: "Absensi dibuka pukul 06:45" |
| Sudah absen hari ini | 400: "Sudah absen hari ini" |
| Check-in ≤ 07:45 | Status otomatis `hadir` |
| Check-in > 07:45 | Status otomatis `terlambat` |

### `PATCH /absensi/:id` — Check-Out

**Akses:** Cookie login

**Request:**
```json
{ "checkOut": "2026-07-24T16:30:00.000Z", "photos": [{ "type": "check_out", "url": "data:image/...", "capturedAt": "..." }] }
```

**Aturan:**
| Kondisi | Status |
|---------|--------|
| Check-out < 16:00 | `pulang_cepat` |
| Check-out ≥ 16:00 | Status tetap (tidak diubah) |

### `GET /absensi` — List Absensi

**Akses:** Cookie login

**Query Parameters:**

| Parameter | Tipe | Contoh | Keterangan |
|-----------|------|--------|------------|
| userId | string | `abc123` | Filter by user |
| tanggal | string | `2026-07-24` | Filter by tanggal |
| status | string | `hadir` | Filter by status |
| _sort | string | `tanggal` | Sort field |
| _order | string | `asc` / `desc` | Sort direction |
| _page | number | `1` | Pagination |
| _limit | number | `10` | Items per page |
| tanggal_gte | string | `2026-07-01` | Filter >= tanggal |
| tanggal_lte | string | `2026-07-31` | Filter <= tanggal |

**Response 200:** `Absensi[]`

Header `x-total-count` berisi total data untuk pagination.

---

## Pengajuan

### `POST /pengajuan` — Buat Pengajuan

**Akses:** Cookie login

**Request:**
```json
{
  "userId": "uuid",
  "jenis": "cuti",
  "tanggalMulai": "2026-07-25",
  "tanggalSelesai": "2026-07-27",
  "alasan": "Acara keluarga"
}
```

Server otomatis menambahkan: `status: "pending"`, `catatan: ""`, `createdAt: NOW`.

### `GET /pengajuan` — List Pengajuan

**Akses:** Cookie login

**Query Parameters:** userId, jenis, status, _sort, _order, _page, _limit

**Response 200:** `Pengajuan[]`

### `PATCH /pengajuan/:id` — Update Status (Admin)

**Akses:** Cookie login (admin)

**Request:**
```json
{ "status": "approved", "catatan": "Disetujui" }
```

**Aturan:**
- Hanya bisa di-update jika status saat ini `pending`
- `catatan` max 500 karakter

### `DELETE /pengajuan/:id` — Hapus

**Akses:** Cookie login

**Aturan:**
- Hanya bisa dihapus jika status saat ini `pending`

---

## Dashboard

### `GET /api/dashboard/recent` — Riwayat 7 Hari

**Query:**
| Parameter | Wajib | Keterangan |
|-----------|-------|------------|
| userId | ya | UUID user |

**Response 200:**
```json
{
  "data": [
    { "tanggal": "2026-07-23", "checkIn": "2026-07-23T07:45:17Z", "checkOut": "2026-07-23T16:30:00Z", "status": "hadir" },
    { "tanggal": "2026-07-22", "checkIn": null, "checkOut": null, "status": null }
  ]
}
```

7 tanggal terakhir yang memiliki data absensi.

### `GET /api/dashboard/admin/week` — Ringkasan Mingguan

**Akses:** Cookie

**Response 200:**
```json
{
  "chart": [
    { "name": "Sen", "hadir": 10, "terlambat": 2, "izin": 1, "sakit": 0, "cuti": 1, "persen": 85 },
    { "name": "Sel", "hadir": 8, "terlambat": 1, "izin": 2, "sakit": 1, "cuti": 0, "persen": 75 }
  ],
  "summary": {
    "totalKaryawan": 15,
    "hadirHariIni": 10,
    "terlambatHariIni": 2,
    "izinHariIni": 1,
    "belumAbsen": 2,
    "totalAbsensiBulanIni": 180,
    "weekAvg": 82,
    "bestDay": { "name": "Sen", "persen": 85 }
  }
}
```

### `GET /api/dashboard/month` — Data Bulanan

**Query:**
| Parameter | Wajib | Default | Keterangan |
|-----------|-------|---------|------------|
| tahun | tidak | tahun sekarang | Tahun |
| bulan | tidak | bulan sekarang | Bulan (1-12) |
| userId | tidak | semua user | Filter per user |

**Response 200:**
```json
{
  "data": [
    { "tanggal": "2026-07-13", "hadir": 5, "pulangCepat": 1, "terlambat": 0, "checkInOnly": 0, "izin": 0, "sakit": 0, "cuti": 1, "tidakHadir": 2 }
  ],
  "totalKaryawan": 15
}
```

---

## Error Codes

| Kode | Arti | Penyebab Umum |
|------|------|---------------|
| 400 | Bad Request | Validasi gagal, body tidak valid |
| 401 | Unauthorized | Tidak login / session expired |
| 403 | Forbidden | Bukan admin, akses ditolak |
| 404 | Not Found | Resource tidak ditemukan |
| 413 | Payload Too Large | File foto > 5MB |
| 429 | Too Many Requests | 3x gagal login |
| 500 | Internal Server Error | Error server (cek console) |

Semua error response berbentuk:
```json
{ "message": "Deskripsi error" }
```
