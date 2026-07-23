# Endpoint API

Semua endpoint menggunakan base URL `http://localhost:3001`.

## Autentikasi

### Login
```
POST /api/auth/sign-in/email
Body: { email: string, password: string }
Response: { user: SessionUser, session: Session }
```
- Rate limit: 3x gagal → blokir
- Error: 429 (Too Many Requests), 400 (Invalid credentials)

### Logout
```
POST /api/auth/sign-out
Headers: Cookie: better-auth-session=...
Response: { success: true }
```

### Cek Session
```
GET /api/auth/session
Response: { user: SessionUser | null, session: Session | null }
```

## Profile & Users

### Ambil Profile Sendiri
```
GET /api/me
Headers: Cookie: ... (harus login)
Response: merged session.user + profile dari db.json
```

### Update Profile
```
PATCH /users/:id
Headers: Cookie: ...
Body: { nama?, email?, jabatan?, phone?, alamat?, foto? }
```
- Validasi: nama max 100, email max 100, phone 10-15 digit, alamat max 500
- Jika status user = rejected → otomatis jadi pending + hapus rejectionNotes

### Ambil Semua Users (Admin only)
```
GET /api/users/all
Headers: Cookie: ... (role admin)
Response: User[]
```

### Ambil Users Pending (Admin only)
```
GET /api/users/pending
Headers: Cookie: ... (role admin)
Response: User[] (hanya status=pending)
```

### Update Status User (Admin only)
```
PATCH /api/users/:id/status
Headers: Cookie: ... (role admin)
Body: { status: "approved" | "rejected", note?: string }
```
- Jika rejected + note → catatan ditambahkan ke rejectionNotes
- Jika approved → rejectionNotes dikosongkan
- Juga update status di better-auth via Drizzle

### Hapus User (Admin only — permanent)
```
DELETE /api/users/:id
Headers: Cookie: ... (role admin)
```
- Hapus dari better-auth (accounts, sessions, users)
- Hapus dari db.json (users + absensi + pengajuan milik user)

### Hapus User (json-server — standard)
```
DELETE /users/:id
```
- Error: 403 — gunakan endpoint admin

## Register

### Daftar Akun Baru
```
POST /api/register
Body: { email: string, password: string, nama: string, jabatan?: string, phone?: string, role?: string }
```
- Jika login sebagai admin: role sesuai body, status = approved
- Jika tidak login: role = karyawan, status = pending
- Validasi: email format, password min 8, nama max 100, jabatan max 100

## Absensi

### Check-In
```
POST /absensi
Body: { userId: string, tanggal: string, checkIn: string, ... }
```
- Hanya bisa check-in jam 06:45 - 07:45
- Jika sebelum 06:45 → error "Absensi dibuka pukul 06:45"
- Jika sudah absen hari ini → error "Sudah absen hari ini"
- Status: check-in ≤ 07:45 → "hadir", > 07:45 → "terlambat"

### Check-Out
```
PATCH /absensi/:id
Body: { checkOut: string, ... }
```
- Jika checkOut < 16:00 → status = "pulang_cepat"
- Jika checkOut ≥ 16:00 → status tetap (tidak diubah)

### Get All Absensi
```
GET /absensi
Query: userId?, tanggal?, status?
Response: Absensi[]
```
- json-server standard query params

## Pengajuan Cuti / Izin

### Create Pengajuan
```
POST /pengajuan
Body: { userId, jenis, tanggalMulai, tanggalSelesai, alasan }
```

### Get All Pengajuan
```
GET /pengajuan
Query: userId?, jenis?, status?
Response: Pengajuan[]
```

### Update Status (Admin)
```
PATCH /pengajuan/:id
Body: { status: "approved" | "rejected", catatan?: string }
```
- Hanya bisa update jika status masih "pending"
- Alasan max 500 karakter

### Delete Pengajuan
```
DELETE /pengajuan/:id
```
- Hanya bisa hapus jika status masih "pending"

## Dashboard

### Riwayat 7 Hari (Personal)
```
GET /api/dashboard/recent?userId=...
Response: { data: [{ tanggal, checkIn, checkOut, status }] }
```
- 7 tanggal terakhir yang memiliki data absensi
- Filter by userId (opsional)

### Dashboard HRD (Weekly)
```
GET /api/dashboard/hrd/week
Response: {
  chart: [{ name, hadir, terlambat, persen }],
  summary: { totalKaryawan, hadirHariIni, terlambatHariIni, izinHariIni, belumAbsen, totalAbsensiBulanIni, weekAvg, bestDay }
}
```
- Chart 7 hari terakhir
- Summary statistik hari ini + bulan ini

### Dashboard Month
```
GET /api/dashboard/month?tahun=2026&bulan=7
Response: { data: [{ tanggal, hadir, terlambat, checkInOnly, izin, tidakHadir }], totalKaryawan }
```
- Data per-hari dalam satu bulan
- Query params: tahun, bulan (default: sekarang)

## Data Register User Image

```
PATCH /users/:id
Body: { foto: string } (base64 image)
```
- Foto profil dalam format base64 string
