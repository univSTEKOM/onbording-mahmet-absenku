# Panduan Fitur

## Dua Role Pengguna

| Fitur | Karyawan | Admin |
|-------|----------|-------|
| Dashboard personal | ✅ | — |
| Dashboard admin | — | ✅ |
| Check-in / Check-out | ✅ | — |
| Riwayat absensi sendiri | ✅ | ✅ (semua karyawan) |
| Pengajuan cuti/izin/sakit | ✅ (buat & hapus) | ✅ (approve/reject) |
| Edit profil | ✅ | ✅ |
| Verifikasi karyawan baru | — | ✅ |
| Kelola data karyawan | — | ✅ (CRUD) |
| Lihat profil karyawan lain | — | ✅ |
| Status pendaftaran | ✅ (jika pending) | — |

---

## Panduan per Role

### Karyawan

#### Alur Pertama Kali

```
Register → Login → Halaman Status (menunggu verifikasi)
                                       ↓ (Admin approve)
                              Dashboard Karyawan
```

#### Check-in / Check-out

1. Buka halaman **Absensi** (`/absensi`)
2. Klik "Absen Sekarang" untuk check-in
3. (Opsional) Verifikasi wajah via kamera
4. Selesai bekerja → Klik "Check-out"
5. Lihat riwayat di **Riwayat** (`/absensi/riwayat`)

#### Pengajuan Cuti / Izin

1. Buka **Pengajuan** → klik **Ajukan Baru**
2. Pilih jenis (Cuti / Izin / Sakit), tanggal, alasan
3. Kirim → status `pending`
4. Tunggu admin approve/reject
5. Jika masih pending, bisa diedit atau dihapus

#### Dashboard

- Statistik hari ini: status check-in/out
- Statistik bulan: hadir, pulang cepat, terlambat, izin/sakit
- Kalender absensi: klik tanggal untuk detail
- Aktivitas 7 hari terakhir

---

### Admin

#### Dashboard

- Total karyawan, hadir hari ini, terlambat, verifikasi pending
- Tren kehadiran 7 hari (bar chart)
- Pie chart kehadiran bulan ini
- Kalender absensi seluruh karyawan

#### Verifikasi Karyawan Baru

1. Buka **Verifikasi Karyawan** (`/admin/verifikasi`)
2. Lihat daftar user dengan status `pending`
3. Klik **Setujui** atau **Tolak** (dengan catatan)
4. User yang ditolak bisa mengedit profil dan mengulang

#### Kelola Karyawan

1. Buka **Kelola Karyawan** (`/admin/karyawan`)
2. Cari, filter, edit, atau hapus karyawan
3. Klik nama karyawan untuk lihat detail profil + absensi

#### Manajemen Pengajuan

1. Buka **Pengajuan** (`/admin/pengajuan`)
2. Filter berdasarkan status atau jenis
3. Klik **Setujui** atau **Tolak** (catatan wajib jika tolak)
4. Status berubah, karyawan mendapat notifikasi

---

## Navigasi

### Sidebar — Karyawan

| Menu | Route |
|------|-------|
| Dashboard | `/dashboard` |
| Absensi | `/absensi` |
| Riwayat | `/absensi/riwayat` |
| Pengajuan | `/pengajuan` |

### Sidebar — Admin

| Menu | Route |
|------|-------|
| Admin | `/admin/dashboard` |
| Riwayat | `/admin/riwayat` |
| Pengajuan | `/admin/pengajuan` |
| Kelola Karyawan | `/admin/karyawan` |
| Verifikasi Karyawan | `/admin/verifikasi` |

### Sidebar — Onboarding (Pending/Rejected)

| Menu | Route |
|------|-------|
| Status Akun | `/status` |
| Profil | `/profil` |
