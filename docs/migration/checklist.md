# Checklist Migrasi

Gunakan checklist ini untuk melacak progres migrasi dari frontend lama ke frontend-v2.

## Setup

- [ ] Init project dengan better-t-stack
- [ ] Setup Tailwind CSS + shadcn/ui
- [ ] Setup Vite config + TanStack Router plugin
- [ ] Setup Axios instance
- [ ] Setup TanStack Query client
- [ ] Setup better-auth client
- [ ] Setup route tree generator

## Layout & Routing

- [ ] Root layout (ThemeProvider + UserProvider + Toaster)
- [ ] Auth layout (untuk login/register)
- [ ] Main layout (sidebar + header)
- [ ] Authenticated guard (_authenticated.tsx)
- [ ] Admin guard (_admin.tsx)
- [ ] Karyawan guard (_karyawan.tsx)
- [ ] Catch-all route ($.tsx)
- [ ] Route tree generated tanpa error

## Auth

- [ ] Login page
- [ ] Register page
- [ ] useAuth hook
- [ ] Profile fetching via /api/me
- [ ] Logout
- [ ] Session check + redirect

## Halaman Karyawan

- [ ] Dashboard Personal
  - [ ] Stats cards (hari/minggu/bulan)
  - [ ] Kalender kehadiran 7 hari
  - [ ] Quick action button
- [ ] Absensi
  - [ ] Check-in dengan face verification
  - [ ] Check-out dengan face verification
  - [ ] Timeline status
  - [ ] Camera component reusable
- [ ] Riwayat Kehadiran
  - [ ] Card-based layout
  - [ ] Filter tanggal + status
  - [ ] Status badge
  - [ ] Loading skeleton
  - [ ] Empty state
- [ ] Pengajuan List
  - [ ] Card layout
  - [ ] Filter (jenis, status, tanggal)
  - [ ] Detail dialog
- [ ] Pengajuan Baru
  - [ ] Form validasi
  - [ ] Redirect setelah sukses
- [ ] Profil
  - [ ] View mode
  - [ ] Edit mode
  - [ ] Validasi field

## Halaman Admin

- [ ] Dashboard HRD
  - [ ] Statistik (total karyawan, hadir, terlambat, pending)
  - [ ] Grafik 7 hari
  - [ ] User pending list
- [ ] Riwayat HRD
  - [ ] Sama dengan riwayat karyawan + filter nama
- [ ] Manajemen Pengajuan
  - [ ] Tabel semua pengajuan
  - [ ] Approve/reject dialog
  - [ ] Statistik card
- [ ] Manajemen Karyawan
  - [ ] Tabel CRUD
  - [ ] Validasi email
- [ ] Verifikasi Karyawan
  - [ ] Daftar pending
  - [ ] Approve/reject action

## Components Reusable

- [ ] StatusBadge (warna berdasarkan status)
- [ ] EmptyState
- [ ] LoadingSkeleton
- [ ] FilterBar / FilterDialog
- [ ] ConfirmDialog
- [ ] AttendanceCard
- [ ] CameraCapture (face verification)
- [ ] ThemeToggle
- [ ] Logo
- [ ] PhoneInput

## Quality

- [ ] TypeScript build: 0 error
- [ ] Lint: 0 error
- [ ] Responsive design
- [ ] Loading states semua halaman
- [ ] Error handling semua API call
- [ ] Empty states semua list
- [ ] Toast notification untuk success/error
- [ ] Tidak ada unused import
- [ ] Bundle size optimized
