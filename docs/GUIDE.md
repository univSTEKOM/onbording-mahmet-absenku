# Panduan Fitur

## Dua Role Pengguna

| Fitur | Karyawan | Admin |
|-------|----------|-------|
| Dashboard personal | ✅ | — |
| Dashboard admin | — | ✅ |
| Check-in / Check-out + Face Verification | ✅ | — |
| Riwayat absensi sendiri | ✅ | ✅ (semua karyawan) |
| Pengajuan cuti/izin/sakit | ✅ (buat, edit, hapus) | ✅ (approve/reject) |
| Edit profil | ✅ | ✅ |
| Foto profil + crop | ✅ | ✅ |
| Verifikasi karyawan baru | — | ✅ |
| Kelola data karyawan | — | ✅ (CRUD) |
| Lihat profil + absensi karyawan lain | — | ✅ |
| Status pendaftaran | ✅ (jika pending) | — |
| Product Tour onboarding | ✅ | ✅ |
| Export CSV riwayat | ✅ | ✅ |
| Filter dialog (search, tanggal, status) | ✅ | ✅ |
| Password toggle + strength indicator | ✅ | ✅ |

---

## Panduan per Role

### Karyawan

#### Alur Pertama Kali

```
Register → Login → Verification Tour (jika pending)
                       │
                       ├── Admin approve → Main Tour → Dashboard
                       │
                       └── Admin reject → Edit profil → Submit ulang
```

#### Product Tour

Saat pertama login (setelah approve), tour otomatis muncul dalam 800ms:

```
Welcome → Sidebar → Dashboard Summary → Absen Button → Riwayat → Pengajuan → Profile → Selesai
```

- Tekan **ESC** atau klik **Lewati** untuk skip
- Tekan **→** / **←** untuk navigasi cepat
- Tour hanya muncul sekali (tersimpan di localStorage)
- Reset: `localStorage.removeItem('absenku-tour')` di console

#### Check-in / Check-out

1. Buka halaman **Absensi** (`/absensi`)
2. Klik **"Absen Sekarang"** untuk check-in
3. (Opsional) Verifikasi wajah via kamera — kamera otomatis mendeteksi wajah
4. Setelah 10 detik atau wajah terdeteksi, foto otomatis diambil
5. Selesai bekerja → Klik **"Check-out"**
6. Lihat riwayat di **Riwayat** (`/absensi/riwayat`)

#### Face Verification

- **Pertama kali:** Kamera mengambil foto wajah → disimpan sebagai descriptor
- **Berikutnya:** Kamera mendeteksi wajah → dibandingkan dengan descriptor tersimpan
- Jika cocok (threshold) → absensi berhasil
- Jika tidak cocok → bisa ulang atau skip verifikasi
- Bisa daftar ulang verifikasi wajah di halaman **Profil**

#### Pengajuan Cuti / Izin

1. Buka **Pengajuan** (`/pengajuan`)
2. Klik **"Ajukan Baru"**
3. Pilih jenis: **Cuti**, **Izin**, atau **Sakit**
4. Isi tanggal mulai, tanggal selesai, dan alasan
5. Kirim → status `pending`
6. Tunggu admin approve/reject
7. Jika masih `pending`, bisa diedit atau dihapus
8. Riwayat pengajuan ditampilkan di halaman yang sama

#### Filter Riwayat & Pengajuan

Klik ikon **Filter** untuk membuka dialog filter:

| Filter | Format |
|--------|--------|
| Search | Cari tanggal |
| Status | hadir / terlambat / izin / dll |
| Jenis | cuti / izin / sakit (pengajuan) |
| Rentang Tanggal | Date picker |

#### Dashboard

| Section | Deskripsi |
|---------|-----------|
| Status Hari Ini | Check-in/out status + tombol absen |
| Statistik Bulan | Hadir, terlambat, pulang cepat, izin/sakit |
| Chart 7 Hari | Pie chart kehadiran minggu ini |
| Chart Bulan Ini | Pie chart kehadiran bulan ini |
| Kalender | Warna-coded per hari (hijau=hadir, merah=alfa, dll) |
| Aktivitas Terbaru | Riwayat 5 absensi terakhir |

---

### Admin

#### Dashboard

| Section | Deskripsi |
|---------|-----------|
| Statistik | Total karyawan, hadir hari ini, terlambat, pending verifikasi |
| Bar Chart | Tren kehadiran 7 hari (stacked: hadir, terlambat, izin, sakit, cuti, alfa) |
| Pie Chart | Distribusi kehadiran bulan ini |
| Kalender | Warna-coded per hari untuk seluruh tim |
| Tombol Refresh | Refresh data dashboard |

#### Verifikasi Karyawan Baru

1. Buka **Verifikasi Karyawan** (`/admin/verifikasi`)
2. Lihat daftar user dengan status `pending`
3. Klik **Setujui** → user bisa login
4. Klik **Tolak** → masukkan catatan → user melihat alasan penolakan
5. User yang ditolak bisa edit profil → status kembali `pending`

#### Kelola Karyawan

1. Buka **Kelola Karyawan** (`/admin/karyawan`)
2. Cari karyawan via search bar
3. Klik **Edit** untuk ubah data (nama, email, jabatan, role, telepon)
4. Klik **Hapus** → konfirmasi → user dihapus dari auth + semua data terkait
5. Klik nama karyawan → lihat detail profil + riwayat absensi

#### Manajemen Pengajuan

1. Buka **Pengajuan** (`/admin/pengajuan`)
2. Filter berdasarkan status atau jenis
3. Klik **Setujui** → pengajuan approved
4. Klik **Tolak** → catatan wajib → pengajuan rejected
5. Status berubah, karyawan bisa melihat di halaman pengajuan

#### Export CSV

Di halaman **Riwayat** (`/admin/riwayat`), klik ikon **Download** untuk export data absensi ke CSV.

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

| Menu | Route | Badge |
|------|-------|-------|
| Admin | `/admin/dashboard` | — |
| Verifikasi Karyawan | `/admin/verifikasi` | Jumlah pending |
| Riwayat | `/admin/riwayat` | — |
| Pengajuan | `/admin/pengajuan` | Jumlah pending |
| Kelola Karyawan | `/admin/karyawan` | — |

### Sidebar — Onboarding (Pending/Rejected)

| Menu | Route |
|------|-------|
| Status Akun | `/status` |
| Profil | `/profil` |

---

## Role Badge

Setiap user memiliki **RoleBadge** di halaman profil dan detail:

- **Admin** — Badge biru
- **Karyawan** — Badge hijau

---

## Status Color Reference

| Status | Warna | CSS Variable |
|--------|-------|-------------|
| Hadir | Hijau | `--color-status-hadir` |
| Terlambat | Kuning | `--color-status-terlambat` |
| Pulang Cepat | Oranye | `--color-status-pulang-cepat` |
| Izin | Biru | `--color-status-izin` |
| Sakit | Ungu | `--color-status-sakit` |
| Cuti | Abu-abu | `--color-status-cuti` |
| Alfa / Tidak Hadir | Merah | `--color-status-tidakHadir` |
