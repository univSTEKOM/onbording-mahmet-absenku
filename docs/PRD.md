# Product Requirements Document — Sistem Absensi Karyawan

## 1. Executive Summary

Sistem absensi karyawan berbasis web yang memungkinkan manajemen kehadiran secara digital. Sistem melayani dua peran pengguna (Karyawan dan HRD) dengan fitur check-in/check-out, riwayat kehadiran, pengajuan izin/cuti, dashboard personal dan HRD, serta verifikasi wajah sebagai fitur bonus.

## 2. Tujuan

- Membangun frontend client fungsional yang berjalan penuh melawan mock API lokal (json-server).
- Mendemonstrasikan seluruh alur inti absensi dari sudut pandang Karyawan maupun HRD.
- Menyediakan fondasi yang siap diintegrasikan dengan API backend sesungguhnya pada tahap berikutnya.

## 3. Target Pengguna

| Persona | Deskripsi | Kebutuhan Utama |
|---|---|---|
| **Karyawan** | Pegawai yang melakukan absensi harian | Check-in/out, lihat riwayat, ajukan izin/cuti, dashboard personal |
| **HRD / Admin** | Pengelola data kepegawaian | Pantau kehadiran seluruh karyawan, kelola pengajuan, lihat statistik |

## 4. Fitur & Cakupan

### 4.1. Fitur Inti (Wajib)

| ID | Fitur | Deskripsi |
|---|---|---|
| F1 | Registrasi Akun | Karyawan dapat mendaftarkan akun baru |
| F2 | Login | Autentikasi berbasis email & password (fake untuk tahap ini) |
| F3 | Kelola Profil | Edit data diri (nama, jabatan, foto) |
| F4 | Check-in / Check-out | Absensi masuk dan pulang dengan timestamp |
| F5 | Verifikasi Wajah | Verifikasi wajah berbasis browser (face-api.js) saat check-in |
| F6 | Riwayat Kehadiran | Tabel riwayat dengan filter tanggal dan status, sort |
| F7 | Pengajuan Izin / Cuti | Ajukan izin/cuti/sakit dengan rentang tanggal |
| F8 | Konfirmasi Pengajuan | HRD dapat approve/reject pengajuan |
| F9 | Dashboard Personal | Ringkasan kehadiran milik sendiri (hari ini, minggu ini, bulan ini) |
| F10 | Dashboard HRD | Overview seluruh karyawan, statistik kehadiran, pengajuan pending |

### 4.2. Fitur Bonus (Extend)

| ID | Fitur | Deskripsi |
|---|---|---|
| F11 | Ekspor Riwayat | Download riwayat kehadiran sebagai CSV |
| F12 | Notifikasi Status | Indikator visual saat pengajuan di-approve/rejected |
| F13 | Search & Sort Lanjutan | Pencarian karyawan dan sorting multi-kolom di dashboard HRD |

## 5. Alur Utama

### 5.1. Alur Karyawan

```
Login → Dashboard Personal → [Check-in → (Face Verification)] → Aktivitas
    ├── Riwayat Kehadiran (filter, sort)
    ├── Pengajuan Izin/Cuti (ajukan, lihat status)
    └── Edit Profil
```

### 5.2. Alur HRD

```
Login → Dashboard HRD → Overview Karyawan
    ├── Lihat statistik kehadiran
    ├── Kelola Pengajuan (approve/reject)
    └── Lihat detail karyawan
```

## 6. Lingkup Teknis

### 6.1. Stack

| Layer | Teknologi |
|---|---|
| Frontend Framework | React 18 + TypeScript |
| Bundler | Vite |
| Styling | Tailwind CSS |
| Component Library | shadcn/ui (Radix UI primitives) |
| Data Fetching | TanStack Query (React Query) |
| Routing | React Router v6 |
| State Management | React Context (Auth) + TanStack Query (server state) |
| HTTP Client | Axios |
| Mock API | json-server |
| Face Recognition | face-api.js (TensorFlow.js) |

### 6.2. Environment

```
VITE_API_URL=http://localhost:3001  # base URL mock API
```

### 6.3. Definisi Selesai

- [ ] Semua fitur inti (F1–F10) berjalan melawan json-server
- [ ] CRUD terbukti persist (create → tampil di list/history)
- [ ] Alur karyawan dan HRD dapat didemonstrasikan utuh
- [ ] Base URL API berada di satu tempat (env)
- [ ] Shape data konsisten dan terdokumentasi

## 7. Catatan

- Face recognition tidak memblokir alur absensi manual — fallback tetap tersedia
- Tahap ini fokus pada frontend murni; integrasi ke backend sesungguhnya menyusul
- Gunakan TypeScript interfaces untuk menjaga konsistensi data shape
