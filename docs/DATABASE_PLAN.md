# Database Design — Sistem Absensi Karyawan

## 1. Entity Relationship

```
users 1───* absensi
users 1───* pengajuan
```

## 2. Tabel / Resource

### 2.1. `users`

Menyimpan data akun karyawan dan admin.

| Field | Type | Contoh | Keterangan |
|---|---|---|---|
| id | number (auto) | 1 | Primary key |
| email | string | andika@stekom.ac.id | Unique, digunakan login |
| password | string | password | Plain text (fake auth) |
| nama | string | Andika | Nama lengkap |
| jabatan | string | Staff IT | Posisi / jabatan |
| role | string | "karyawan" \| "admin" | Roles |
| foto | string | "" | URL / base64 foto, atau face descriptor |
| phone | string | 08123456789 | Nomor telepon (opsional) |
| alamat | string | Jl. Merdeka No.1 | Alamat (opsional) |
| createdAt | string (ISO) | 2026-07-20T08:00:00Z | Timestamp dibuat |

### 2.2. `absensi`

Menyimpan record check-in / check-out harian.

| Field | Type | Contoh | Keterangan |
|---|---|---|---|
| id | number (auto) | 1 | Primary key |
| userId | number | 1 | Foreign key → users.id |
| tanggal | string (date) | 2026-07-20 | Tanggal absensi |
| checkIn | string (ISO) \| null | 2026-07-20T08:00:00Z | Jam masuk |
| checkOut | string (ISO) \| null | 2026-07-20T17:00:00Z | Jam pulang |
| status | string | "hadir" \| "terlambat" \| "izin" \| "sakit" \| "cuti" | Status kehadiran |
| faceVerified | boolean | false | Apakah wajah terverifikasi |
| keterangan | string | "" | Catatan tambahan |
| createdAt | string (ISO) | 2026-07-20T08:00:00Z | Timestamp dibuat |

**Aturan bisnis:**
- Satu user hanya boleh memiliki **1 record per hari** (cek unik userId + tanggal)
- `checkOut` bisa null jika belum check-out
- Status "izin"/"sakit"/"cuti" diisi otomatis jika ada pengajuan yang approved pada tanggal tersebut

### 2.3. `pengajuan`

Menyampaikan data pengajuan izin / cuti / sakit.

| Field | Type | Contoh | Keterangan |
|---|---|---|---|
| id | number (auto) | 1 | Primary key |
| userId | number | 1 | Foreign key → users.id |
| jenis | string | "cuti" \| "izin" \| "sakit" | Jenis pengajuan |
| tanggalMulai | string (date) | 2026-08-01 | Tanggal mulai |
| tanggalSelesai | string (date) | 2026-08-03 | Tanggal selesai |
| alasan | string | Acara keluarga | Alasan pengajuan |
| status | string | "pending" \| "approved" \| "rejected" | Status approval |
| catatan | string | "" | Catatan dari HRD (saat approve/reject) |
| createdAt | string (ISO) | 2026-07-20T10:00:00Z | Timestamp dibuat |

## 3. Relasi

```
users.id ──1:N── absensi.userId
users.id ──1:N── pengajuan.userId
```

## 4. Seed Data (db.json)

### Users (initial)

```json
[
  {
    "id": 1,
    "email": "andika@stekom.ac.id",
    "password": "password",
    "nama": "Andika",
    "jabatan": "Manager HRD",
    "role": "admin",
    "foto": "",
    "phone": "081234567890",
    "alamat": "Jl. Merdeka No. 1, Jakarta",
    "createdAt": "2026-01-01T00:00:00Z"
  },
  {
    "id": 2,
    "email": "rudi@stekom.ac.id",
    "password": "password",
    "nama": "Rudi Hartono",
    "jabatan": "Staff IT",
    "role": "karyawan",
    "foto": "",
    "phone": "081234567891",
    "alamat": "Jl. Sudirman No. 2, Jakarta",
    "createdAt": "2026-01-01T00:00:00Z"
  },
  {
    "id": 3,
    "email": "siti@stekom.ac.id",
    "password": "password",
    "nama": "Siti Nurhaliza",
    "jabatan": "Staff Keuangan",
    "role": "karyawan",
    "foto": "",
    "phone": "081234567892",
    "alamat": "Jl. Gatot Subroto No. 3, Jakarta",
    "createdAt": "2026-01-01T00:00:00Z"
  }
]
```

### Absensi (initial — sample 7 hari terakhir)

```json
[
  {
    "id": 1,
    "userId": 2,
    "tanggal": "2026-07-13",
    "checkIn": "2026-07-13T08:00:00Z",
    "checkOut": "2026-07-13T17:00:00Z",
    "status": "hadir",
    "faceVerified": true,
    "keterangan": "",
    "createdAt": "2026-07-13T08:00:00Z"
  },
  {
    "id": 2,
    "userId": 2,
    "tanggal": "2026-07-14",
    "checkIn": "2026-07-14T08:15:00Z",
    "checkOut": "2026-07-14T17:00:00Z",
    "status": "terlambat",
    "faceVerified": true,
    "keterangan": "",
    "createdAt": "2026-07-14T08:15:00Z"
  },
  {
    "id": 3,
    "userId": 3,
    "tanggal": "2026-07-13",
    "checkIn": "2026-07-13T07:55:00Z",
    "checkOut": "2026-07-13T16:30:00Z",
    "status": "hadir",
    "faceVerified": true,
    "keterangan": "",
    "createdAt": "2026-07-13T07:55:00Z"
  },
  {
    "id": 4,
    "userId": 3,
    "tanggal": "2026-07-14",
    "checkIn": "2026-07-14T08:00:00Z",
    "checkOut": null,
    "status": "hadir",
    "faceVerified": false,
    "keterangan": "",
    "createdAt": "2026-07-14T08:00:00Z"
  },
  {
    "id": 5,
    "userId": 2,
    "tanggal": "2026-07-15",
    "checkIn": "2026-07-15T08:00:00Z",
    "checkOut": "2026-07-15T17:00:00Z",
    "status": "hadir",
    "faceVerified": true,
    "keterangan": "",
    "createdAt": "2026-07-15T08:00:00Z"
  },
  {
    "id": 6,
    "userId": 2,
    "tanggal": "2026-07-16",
    "checkIn": "2026-07-16T08:00:00Z",
    "checkOut": "2026-07-16T17:00:00Z",
    "status": "hadir",
    "faceVerified": true,
    "keterangan": "",
    "createdAt": "2026-07-16T08:00:00Z"
  },
  {
    "id": 7,
    "userId": 2,
    "tanggal": "2026-07-17",
    "checkIn": "2026-07-17T08:00:00Z",
    "checkOut": "2026-07-17T17:00:00Z",
    "status": "hadir",
    "faceVerified": true,
    "keterangan": "",
    "createdAt": "2026-07-17T08:00:00Z"
  }
]
```

### Pengajuan (initial)

```json
[
  {
    "id": 1,
    "userId": 2,
    "jenis": "cuti",
    "tanggalMulai": "2026-07-25",
    "tanggalSelesai": "2026-07-27",
    "alasan": "Acara keluarga",
    "status": "pending",
    "catatan": "",
    "createdAt": "2026-07-18T10:00:00Z"
  },
  {
    "id": 2,
    "userId": 3,
    "jenis": "izin",
    "tanggalMulai": "2026-07-21",
    "tanggalSelesai": "2026-07-21",
    "alasan": "Keperluan bank",
    "status": "approved",
    "catatan": "Disetujui",
    "createdAt": "2026-07-17T09:00:00Z"
  }
]
```
