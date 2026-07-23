# Fitur Aplikasi

## 1. Autentikasi

Login dan registrasi pengguna dengan better-auth. Menggunakan HTTP-only cookie session untuk keamanan.

- **Register:** Pengguna baru mendaftar dengan nama, email, password, jabatan, nomor telepon
- **Login:** Masuk dengan email dan password
- **Logout:** Hapus session
- **Role:** Setelah registrasi, admin akan memverifikasi akun (status: pending → approved/rejected)
- **Rate Limiting:** 3x gagal login → akun diblokir sementara

### Status Akun

| Status | Arti |
|---|---|
| `pending` | Menunggu verifikasi admin |
| `approved` | Akun aktif, bisa menggunakan aplikasi |
| `rejected` | Ditolak, perlu perbarui profil |

## 2. Dashboard

### Dashboard Karyawan
- Greeting dengan nama pengguna
- Statistik kehadiran: total hadir hari ini, minggu ini, bulan ini
- Progress bar jam kerja
- Kalender kehadiran 7 hari terakhir
- Tombol aksi cepat: Absen Sekarang

### Dashboard HRD
- Total karyawan aktif
- Karyawan hadir hari ini
- Karyawan terlambat hari ini
- Pengajuan pending
- Grafik kehadiran 7 hari
- Daftar karyawan yang perlu verifikasi
- Ringkasan keterlambatan

## 3. Absensi dengan Face Recognition

Absensi menggunakan verifikasi wajah berbasis browser (face-api.js).

### Check-In
1. Buka halaman absensi
2. Klik "Check In"
3. Kamera aktif, deteksi wajah otomatis
4. Wajah terverifikasi → foto tersimpan → check-in berhasil
5. Data: waktu check-in, foto, status face verified

### Check-Out
1. Klik "Check Out"
2. Verifikasi wajah kembali
3. Foto check-out tersimpan
4. Sistem menghitung total jam kerja

### Fitur Kamera
- Auto capture saat wajah terdeteksi stabil
- Tombol capture manual sebagai cadangan
- Preview foto sebelum konfirmasi
- Batas ukuran foto 5MB
- Loading state, error handling, timeout

## 4. Riwayat Kehadiran

### Riwayat Karyawan
- Card-based layout per tanggal
- Informasi: tanggal, hari, jam check-in/out, total jam kerja, status
- Filter: tanggal (date range), status kehadiran
- Status badge dengan warna berbeda
- Loading skeleton
- Empty state

### Riwayat Admin
- Sama dengan riwayat karyawan + filter nama karyawan
- Melihat semua data kehadiran seluruh karyawan
- Filter berdasarkan karyawan, tanggal, status

### Status Kehadiran

| Status | Warna | Arti |
|---|---|---|
| `hadir` | Hijau | Check-in dan check-out tepat waktu |
| `terlambat` | Kuning | Check-in melewati jam masuk |
| `izin` | Biru | Izin tidak masuk |
| `sakit` | Ungu | Sakit |
| `cuti` | Orange | Cuti |
| `tanpa_keterangan` | Merah | Tidak masuk tanpa keterangan |

## 5. Pengajuan Cuti / Izin / Sakit

### Daftar Pengajuan (Karyawan)
- Card-based layout
- Status: pending (kuning), approved (hijau), rejected (merah)
- Detail dialog dengan informasi lengkap
- Filter: jenis, status, tanggal

### Form Pengajuan Baru
- Jenis: Cuti, Izin, Sakit
- Tanggal mulai - tanggal selesai
- Alasan (textarea, max 500 karakter)
- Validasi: semua field wajib, tanggal selesai >= tanggal mulai
- Redirect ke daftar pengajuan setelah sukses

### Manajemen Pengajuan (Admin)
- Tabel semua pengajuan
- Approve / Reject dengan catatan
- Filter: jenis, status, rentang tanggal
- Statistik: pending, approved, rejected

## 6. Profil

- View mode: tampilkan semua data profil
- Edit mode: form dengan nilai pre-filled
- Field: nama, email, jabatan, nomor telepon, alamat
- Validasi: nama (max 100), email (max 100, format valid), telepon (max 15 digit), alamat (max 500)
- Update otomatis tanpa refresh halaman

## 7. Verifikasi Karyawan (Admin)

- Daftar karyawan dengan status `pending`
- Approve → akun aktif
- Reject → beri catatan penolakan
- Setelah approved, karyawan bisa login dan menggunakan aplikasi

## 8. Manajemen Karyawan (Admin)

- CRUD data karyawan
- Edit: nama, email, jabatan, role, status, telepon, alamat
- Hapus: konfirmasi sebelum hapus
- Validasi email format
- Select role: admin / karyawan
- Select status: pending / approved / rejected
