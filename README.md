# AbsenKu — Sistem Absensi Karyawan

Aplikasi absensi karyawan dengan dua role (**Karyawan** & **Admin**). Meliputi check-in/out, riwayat kehadiran, pengajuan izin/cuti, dashboard personal & admin, serta verifikasi wajah.

## Prerequisites

| Software | Minimal Versi |
|----------|--------------|
| [Node.js](https://nodejs.org/) | ≥ 18.x |
| npm | ≥ 9.x (bawaan Node.js) |
| [Git](https://git-scm.com/) | — |

## 🚀 Quick Start

### 1. Clone & masuk direktori

```bash
git clone <repo-url> on-boarding-trials
cd on-boarding-trials
```

### 2. Setup Mock API

```bash
cd mock-api

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# (Opsional) Seed database — buat demo users + data absensi
node seed.js

# Start server
node server.js
```

> Mock API berjalan di **http://localhost:3001**

**Catatan:** Jika port 3001 sudah dipakai, matikan proses sebelumnya:
```bash
# Windows PowerShell
netstat -ano | Select-String ":3001"
# PID ada di kolom paling kanan
Stop-Process -Id <PID> -Force
```

### 3. Setup Frontend

```bash
cd frontend

# Install dependencies (bisa makan waktu 1-2 menit)
npm install

# Copy environment variables
cp .env.example .env

# Start development server
npm run dev
```

> Frontend berjalan di **http://localhost:5173**

**Catatan:** Proses pertama `npm run dev` akan meng-generate route tree secara otomatis oleh TanStack Router.

### 4. Buka Browser

Buka **http://localhost:5173** untuk mulai menggunakan aplikasi.

---

## 🔐 Akun Demo

### Admin

| Email | Password | Role |
|-------|----------|------|
| andika@stekom.ac.id | password | admin |

### Karyawan

| Email | Password | Role |
|-------|----------|------|
| rudi@stekom.ac.id | password | karyawan (sudah approved) |
| siti@stekom.ac.id | password | karyawan (sudah approved) |
| budi@stekom.ac.id | password | karyawan (pending — perlu diverifikasi admin) |

---

## ⚙️ Available Scripts

### Frontend (`frontend/`)

| Script | Perintah | Deskripsi |
|--------|----------|-----------|
| Dev | `npm run dev` | Start Vite dev server + hot reload |
| Build | `npm run build` | TypeScript check + build production |
| Lint | `npm run lint` | Jalankan oxlint static analysis |
| Preview | `npm run preview` | Preview production build lokal |

### Mock API (`mock-api/`)

| Script | Perintah | Deskripsi |
|--------|----------|-----------|
| Start | `node server.js` | Start mock API server |
| Seed | `node seed.js` | Reset & seed database demo |
| Seed+Start | `node seed.js && node server.js` | Seed lalu start server |

---

## 🧪 Troubleshooting

### 1. Port 3001 / 5173 already in use

```powershell
# Cari PID yang memakai port
netstat -ano | Select-String ":3001"
# Matikan proses
Stop-Process -Id <PID> -Force
```

### 2. Route tree tidak ter-generate

Hapus `routeTree.gen.ts` lalu restart Vite:

```bash
cd frontend
Remove-Item src/routeTree.gen.ts -Force
npm run dev
```

TanStack Router plugin akan auto-generate ulang route tree.

### 3. `bun run lint` error `Cannot find module`

Pastikan dependencies ter-install:

```bash
cd frontend
npm install
```

### 4. Mock API error saat startup

**Error: `Cannot find module 'better-auth/...'`**
```bash
cd mock-api
npm install
```

**Error: `SQLITE_ERROR: table "user" already exists`**
Hapus file database lama:
```bash
cd mock-api
Remove-Item auth.db -Force
node server.js
```

### 5. Face-api models tidak loading

Pastikan folder `frontend/public/models/` berisi file model face-api.js:

```
public/models/
├── tiny_face_detector_model-weights_manifest.json
├── tiny_face_detector_model-shard1
├── face_landmark_68_model-weights_manifest.json
├── face_landmark_68_model-shard1
├── face_recognition_model-weights_manifest.json
└── face_recognition_model-shard1
```

Jika tidak ada, download dari [justadudewhohacks/face-api.js](https://github.com/justadudewhohacks/face-api.js/tree/master/weights).

---

## 📁 Struktur Proyek

```
on-boarding-trials/
├── frontend/                        # React + Vite frontend
│   ├── .env                         # Environment variables
│   ├── .env.example                 # Template .env
│   ├── package.json
│   ├── vite.config.ts
│   ├── public/
│   │   └── models/                  # face-api.js model files
│   └── src/
│       ├── api/                     # Axios API services
│       ├── components/
│       │   ├── ui/                  # shadcn/ui components
│       │   ├── layout/              # Layout components
│       │   ├── pengajuan/           # Pengajuan-specific components
│       │   ├── pengguna/            # User profile components
│       │   └── shared/              # Reusable shared components
│       ├── hooks/                   # TanStack Query hooks
│       ├── lib/                     # Utilities & constants
│       ├── pages/                   # Page components
│       ├── routes/                  # TanStack Router routes
│       └── types/                   # TypeScript interfaces
├── mock-api/                        # json-server + Express mock API
│   ├── .env                         # Environment variables
│   ├── .env.example                 # Template .env
│   ├── package.json
│   ├── server.js                    # Express server with custom routes
│   ├── auth.js                      # better-auth configuration
│   ├── db-schema.js                 # Drizzle ORM schema
│   ├── seed.js                      # Database seeder
│   └── db.json                      # JSON database
├── docs/                            # Project documentation
└── README.md                        # File ini
```

---

## 📚 Tech Stack

### Frontend

| Layer | Teknologi | Versi |
|-------|-----------|-------|
| Framework | React | 19.x |
| Language | TypeScript | 6.x |
| Bundler | Vite | 8.x |
| Styling | Tailwind CSS | 4.x |
| UI Components | shadcn/ui (+ Radix) | latest |
| Routing | TanStack Router | 1.x |
| Server State | TanStack Query | 5.x |
| HTTP Client | Axios | 1.x |
| Authentication | better-auth (client) | 1.x |
| Chart | Recharts | 3.x |
| Face Recognition | face-api.js | 0.x |
| Crop Image | react-easy-crop | 6.x |
| Icons | lucide-react | 1.x |
| Linter | oxlint | 1.x |

### Mock API

| Layer | Teknologi | Versi |
|-------|-----------|-------|
| HTTP Server | Express | 5.x |
| REST API | json-server | 0.17.x |
| Auth Server | better-auth | 1.x |
| Database | SQLite (better-sqlite3) | 12.x |
| ORM | Drizzle ORM | 0.x |
| File Upload | Multer | 2.x |
| CORS | cors | 2.x |

---

## Catatan Teknis

- **Base URL API** dikonfigurasi via `frontend/.env` → `VITE_API_URL`. Untuk integrasi dengan API asli, cukup ubah satu baris ini.
- **Pagination** menggunakan parameter `_page` & `_limit` bawaan json-server.
- **Verifikasi wajah** menggunakan `tinyFaceDetector` dari face-api.js. Fitur ini opsional — ada tombol skip.
- **Route tree** di-generate otomatis oleh `@tanstack/router-plugin` setiap kali Vite start.
- **Database mock** menggunakan `db.json` yang di-load oleh json-server. Untuk reset data, jalankan `node seed.js`.
