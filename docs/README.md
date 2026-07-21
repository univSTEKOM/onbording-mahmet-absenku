# Trial Onboarding — Frontend Client (Sistem Absensi Karyawan)

Frontend client untuk sistem absensi karyawan dengan dua role (Karyawan & HRD), fitur check-in/out, riwayat, pengajuan izin/cuti, dashboard, dan verifikasi wajah.

## Tech Stack

| Layer | Teknologi |
|---|---|
| Framework | React 19 + TypeScript |
| Bundler | Vite |
| Styling | Tailwind CSS v4 |
| Component Library | shadcn/ui |
| Data Fetching | TanStack Query |
| Routing | React Router v7 |
| HTTP Client | Axios |
| Mock API | json-server (localhost:3001) |
| Face Recognition | face-api.js |

## Environment Variables

Buat file `.env` di `frontend/.env`:

```env
BACKEND_URL=http://localhost:3001
```

## Cara Menjalankan

### 1. Mock API

```bash
cd mock-api
npm install
npm start
```

API berjalan di `http://localhost:3001`

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Aplikasi berjalan di `http://localhost:5173`

## Akun Demo

### Admin

| Field | Value |
|---|---|
| Email | andika@stekom.ac.id |
| Password | password |

### Karyawan

| Field | Value |
|---|---|
| Email | rudi@stekom.ac.id |
| Password | password |

| Email | siti@stekom.ac.id |
| Password | password |

## Fitur

### Role: Karyawan

| Fitur | Status | Keterangan |
|---|---|---|
| Registrasi Akun | ✅ | Daftar akun baru |
| Login | ✅ | Autentikasi fake |
| Edit Profil | ✅ | Upload foto, validasi field |
| Check-in / Check-out | ✅ | Absensi harian dengan timestamp |
| Verifikasi Wajah | ✅ | face-api.js, simpan descriptor |
| Riwayat Kehadiran | ✅ | Filter status, sort, pagination, export CSV |
| Pengajuan Izin/Cuti | ✅ | Ajukan, lihat status, hapus |
| Dashboard Personal | ✅ | Statistik hari/minggu/bulan, aktivitas terbaru |

### Role: Admin (HRD)

| Fitur | Status | Keterangan |
|---|---|---|
| Dashboard HRD | ✅ | 4 stat card, tabel karyawan |
| Approve / Reject Pengajuan | ✅ | Modal konfirmasi dengan catatan |
| Cari Karyawan | ✅ | Filter by nama/jabatan |
| Export Data Karyawan | ✅ | CSV download |

## API Endpoints

### Auth

| Method | Endpoint | Deskripsi |
|---|---|---|
| POST | /api/auth/login | Login, return user + token |
| POST | /api/auth/register | Register akun baru (role: karyawan) |

### Users

| Method | Endpoint | Deskripsi |
|---|---|---|
| GET | /users | List semua user |
| GET | /users/:id | Detail user |
| PATCH | /users/:id | Update user (profil, foto) |

### Absensi

| Method | Endpoint | Deskripsi |
|---|---|---|
| GET | /absensi | List absensi (support `_sort`, `_order`, `_page`, `_limit`, `userId`, `tanggal`) |
| GET | /absensi/:id | Detail absensi |
| POST | /absensi | Check-in |
| PATCH | /absensi/:id | Check-out |

### Pengajuan

| Method | Endpoint | Deskripsi |
|---|---|---|
| GET | /pengajuan | List pengajuan (support `userId`, `status`) |
| GET | /pengajuan/:id | Detail pengajuan |
| POST | /pengajuan | Buat pengajuan baru |
| PATCH | /pengajuan/:id | Update status (approve/reject) |
| DELETE | /pengajuan/:id | Hapus pengajuan (pending only) |

## Database Schema

### `users`

| Field | Type | Contoh |
|---|---|---|
| id | number | 1 |
| email | string | andika@stekom.ac.id |
| password | string | password |
| nama | string | Andika |
| jabatan | string | Manager HRD |
| role | "admin" \| "karyawan" | admin |
| foto | string | face descriptor JSON atau URL |
| phone | string | 081234567890 |
| alamat | string | Jl. Merdeka No. 1 |
| createdAt | string (ISO) | 2026-01-01T00:00:00Z |

### `absensi`

| Field | Type | Contoh |
|---|---|---|
| id | number | 1 |
| userId | number | 2 |
| tanggal | string (date) | 2026-07-20 |
| checkIn | string (ISO) \| null | 2026-07-20T08:00:00Z |
| checkOut | string (ISO) \| null | 2026-07-20T17:00:00Z |
| status | "hadir" \| "terlambat" \| "izin" \| "sakit" \| "cuti" | hadir |
| faceVerified | boolean | false |
| keterangan | string | |
| createdAt | string (ISO) | 2026-07-20T08:00:00Z |

### `pengajuan`

| Field | Type | Contoh |
|---|---|---|
| id | number | 1 |
| userId | number | 2 |
| jenis | "cuti" \| "izin" \| "sakit" | cuti |
| tanggalMulai | string (date) | 2026-07-25 |
| tanggalSelesai | string (date) | 2026-07-27 |
| alasan | string | Acara keluarga |
| status | "pending" \| "approved" \| "rejected" | pending |
| catatan | string | Disetujui |
| createdAt | string (ISO) | 2026-07-18T10:00:00Z |

## Struktur Folder

```
on-boarding-trials/
├── frontend/                  # React + Vite app
│   ├── src/
│   │   ├── api/               # Axios service layer
│   │   ├── components/
│   │   │   ├── ui/            # shadcn/ui components
│   │   │   ├── layout/        # Sidebar, MainLayout, AuthLayout
│   │   │   └── shared/        # Reusable: StatsCard, Pagination, etc.
│   │   ├── contexts/          # AuthContext
│   │   ├── hooks/             # TanStack Query hooks
│   │   ├── lib/               # Utils, export, faceDetection
│   │   ├── pages/             # Page components
│   │   └── types/             # TypeScript interfaces
│   ├── public/models/         # face-api.js model files
│   └── .env                   # BACKEND_URL
├── mock-api/                  # json-server
│   ├── db.json                # Seed data
│   └── server.js              # Custom auth routes + CORS
└── docs/                      # Dokumentasi
```

## Catatan Teknis

1. **Base URL di satu tempat** — `BACKEND_URL` di `.env`. Untuk integrasi ke API asli, cukup ganti nilai ini.
2. **Shape data konsisten** — Gunakan TypeScript interfaces di `src/types/index.ts` sebagai single source of truth.
3. **CORS** — Server sudah dilengkapi CORS middleware manual untuk handle semua origin.
4. **Pagination** — json-server native via `_page` & `_limit`. Total count dari header `x-total-count`.
5. **Face Recognition** — Menggunakan `tinyFaceDetector` (189KB, 3-5x lebih cepat dari SSD). Model di-load dari `/public/models/`. Fallback manual tetap tersedia.
6. **Auth** — Masih fake (tanpa JWT sungguhan). User dikirim dalam response login, disimpan di localStorage.
