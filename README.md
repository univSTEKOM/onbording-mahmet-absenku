# Sistem Absensi Karyawan

Frontend client untuk sistem absensi karyawan dengan dua role (**Karyawan** & **HRD**). Meliputi check-in/out, riwayat kehadiran, pengajuan izin/cuti, dashboard personal & HRD, serta verifikasi wajah.

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
| Mock API | json-server |
| Face Recognition | face-api.js |

## Environment Variables

Buat file `frontend/.env`:

```env
VITE_API_URL=http://localhost:3001
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

| Email | Password |
|---|---|
| andika@stekom.ac.id | password |

### Karyawan

| Email | Password |
|---|---|
| rudi@stekom.ac.id | password |
| siti@stekom.ac.id | password |

## Fitur

### Karyawan

- Registrasi & Login akun
- Edit profil dengan upload foto
- Check-in / Check-out dengan verifikasi wajah (face-api.js)
- Riwayat kehadiran dengan filter, sort, pagination, dan export CSV
- Pengajuan izin / cuti / sakit (ajukan, lihat status, hapus)
- Dashboard personal (statistik hari/minggu/bulan)

### Admin (HRD)

- Dashboard overview (total karyawan, hadir hari ini, pending pengajuan, terlambat)
- Tabel data karyawan dengan search dan export CSV
- Approve / Reject pengajuan dengan catatan

## API Endpoints

### Auth

| Method | Endpoint | Deskripsi |
|---|---|---|
| POST | /api/auth/login | Login |
| POST | /api/auth/register | Register |

### Users

| Method | Endpoint | Deskripsi |
|---|---|---|
| GET | /users | List user |
| GET | /users/:id | Detail user |
| PATCH | /users/:id | Update user |

### Absensi

| Method | Endpoint | Deskripsi |
|---|---|---|
| GET | /absensi | List absensi (`_sort`, `_page`, `userId`, `tanggal`) |
| POST | /absensi | Check-in |
| PATCH | /absensi/:id | Check-out |

### Pengajuan

| Method | Endpoint | Deskripsi |
|---|---|---|
| GET | /pengajuan | List pengajuan |
| POST | /pengajuan | Buat pengajuan |
| PATCH | /pengajuan/:id | Approve/reject |
| DELETE | /pengajuan/:id | Hapus (pending only) |

## Struktur Folder

```
on-boarding-trials/
├── frontend/
│   ├── src/
│   │   ├── api/              # Axios services
│   │   ├── components/
│   │   │   ├── ui/           # shadcn/ui
│   │   │   ├── layout/       # Sidebar, layouts
│   │   │   └── shared/       # Reusable components
│   │   ├── contexts/         # AuthContext
│   │   ├── hooks/            # TanStack Query hooks
│   │   ├── lib/              # Utils
│   │   ├── pages/            # Page components
│   │   └── types/            # TypeScript interfaces
│   ├── public/models/        # face-api.js models
│   └── .env                  # BACKEND_URL
├── mock-api/
│   ├── db.json               # Seed data
│   └── server.js             # json-server + custom auth
└── docs/
    └── README.md             # Tugas/arahan proyek
```

## Catatan Teknis

- **Base URL** ada di `frontend/.env` — integrasi ke API asli tinggal ganti satu baris.
- **Shape data** menggunakan TypeScript interfaces di `src/types/index.ts`.
- **Pagination** memanfaatkan parameter `_page` & `_limit` bawaan json-server.
- **Face Recognition** menggunakan `tinyFaceDetector` dari face-api.js. Model file ada di `public/models/`. Verifikasi bersifat opsional — ada tombol skip.
- **CORS** sudah ditangani oleh middleware manual di `mock-api/server.js`.
