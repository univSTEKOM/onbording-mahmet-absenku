# Frontend

Proyek frontend aplikasi AbsenKu yang mencakup dua versi:

- **frontend/** — Versi lama (React + React Router), masih dipertahankan sebagai referensi
- **frontend-v2/** — Versi baru (better-t-stack + TanStack Router), pengembangan aktif

## Fitur Utama

AbsenKu memiliki dua role pengguna dengan fitur yang berbeda:

### Role: Karyawan

| Fitur | Deskripsi |
|---|---|
| Dashboard Personal | Ringkasan kehadiran pribadi, statistik harian/mingguan/bulanan |
| Absensi (Check-in/Out) | Absensi dengan verifikasi wajah (face recognition) |
| Riwayat Kehadiran | Riwayat absensi dengan filter tanggal dan status |
| Pengajuan Cuti/Izin | Ajukan cuti, izin, atau sakit |
| Manajemen Profil | Edit data profil pribadi |

### Role: Admin (HRD)

| Fitur | Deskripsi |
|---|---|
| Dashboard HRD | Overview seluruh karyawan, statistik real-time |
| Verifikasi Karyawan | Approve/reject pendaftaran karyawan baru |
| Riwayat HRD | Riwayat absensi seluruh karyawan |
| Manajemen Pengajuan | Approve/reject pengajuan cuti/izin |
| Manajemen Karyawan | CRUD data karyawan |

## Alur Navigasi

```
/                    → Welcome Page (landing page)
/login               → Login
/register            → Register

=== Setelah Login ===
/dashboard           → Dashboard (berdasarkan role)
/status              → Status pendaftaran (jika pending/rejected)
/profil              → Edit profil

=== Karyawan ===
/absensi             → Check-in / Check-out
/absensi/riwayat     → Riwayat kehadiran pribadi
/pengajuan           → Daftar pengajuan
/pengajuan/baru      → Form pengajuan baru

=== Admin ===
/hrd/dashboard       → Dashboard HRD
/hrd/riwayat         → Riwayat semua karyawan
/hrd/pengajuan       → Manajemen pengajuan
/hrd/karyawan        → Manajemen data karyawan
/hrd/verifikasi      → Verifikasi pendaftaran
```
