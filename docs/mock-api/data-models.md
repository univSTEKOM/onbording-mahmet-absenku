# Data Model

## User

```json
{
  "id": "string (UUID dari better-auth)",
  "email": "string (unique)",
  "nama": "string (max 100)",
  "jabatan": "string (max 100)",
  "role": "'admin' | 'karyawan'",
  "status": "'pending' | 'approved' | 'rejected'",
  "rejectionNotes": "[{ note: string, createdAt: string }]",
  "foto": "string (base64)",
  "phone": "string (10-15 digit)",
  "alamat": "string (max 500)",
  "createdAt": "string (ISO date)"
}
```

### Role & Status Flow

```
Register (karyawan)
  → status: pending
    → Admin approve → status: approved → bisa login & akses
    → Admin reject → status: rejected → perlu edit profil
      → User edit profil → status: pending lagi
```

## Absensi

```json
{
  "id": "number (auto-increment)",
  "userId": "string (UUID user)",
  "tanggal": "string (YYYY-MM-DD)",
  "checkIn": "string (ISO datetime)",
  "checkOut": "string (ISO datetime | null)",
  "status": "'hadir' | 'terlambat' | 'pulang_cepat' | 'izin' | 'sakit' | 'cuti' | 'tanpa_keterangan'",
  "faceVerified": "boolean",
  "photos": "string[] (array of base64 photos)",
  "keterangan": "string",
  "createdAt": "string (ISO datetime)"
}
```

### Aturan Status

| Kondisi | Status |
|---|---|
| Check-in ≤ 07:45 | hadir |
| Check-in > 07:45 | terlambat |
| Check-out < 16:00 | pulang_cepat |
| Check-in & Check-out selesai + tepat waktu | hadir |

## Pengajuan

```json
{
  "id": "number (auto-increment)",
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

### Aturan Status

| Status | Arti | Action |
|---|---|---|
| pending | Menunggu approval admin | Admin bisa approve/reject |
| approved | Disetujui | Tidak bisa diubah |
| rejected | Ditolak | Tidak bisa diubah |

## Relasi Antar Data

```
User (1) ──< Absensi (N)
  userId di Absensi → id di User

User (1) ──< Pengajuan (N)
  userId di Pengajuan → id di User
```
