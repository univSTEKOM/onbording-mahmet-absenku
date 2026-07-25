# Setup & Instalasi

## Prerequisites

| Software | Minimal Versi | Cek |
|----------|--------------|-----|
| [Node.js](https://nodejs.org/) | >= 18.x | `node -v` |
| [Bun](https://bun.sh/) | >= 1.x | `bun --version` |
| [Git](https://git-scm.com/) | — | `git --version` |

> **Mengapa Bun?** Proyek ini menggunakan Bun sebagai package manager dan runtime. Bun lebih cepat dari npm dan kompatibel penuh.

### Install Bun

```powershell
powershell -c "irm bun.sh/install.ps1 | iex"
```

Atau via npm:
```bash
npm install -g bun
```

---

## Quick Start (5 Menit)

### 1. Clone & Masuk Direktori

```bash
git clone <repo-url> on-boarding-trials
cd on-boarding-trials
```

### 2. Setup Mock API

```bash
cd mock-api

# Install dependencies
bun install

# Copy environment variables
copy .env.example .env

# (Opsional) Seed database demo
bun run seed

# Start server
bun run start
```

Mock API berjalan di **http://localhost:3001**.

### 3. Setup Frontend

```bash
cd frontend

# Install dependencies
bun install

# Copy environment variables
copy .env.example .env

# Start development server
bun run dev
```

Frontend berjalan di **http://localhost:5173**.

### 4. Buka Browser

Buka **http://localhost:5173** dan login dengan akun demo.

---

## Akun Demo

| Email | Password | Role | Status |
|-------|----------|------|--------|
| andika@stekom.ac.id | password | admin | approved |
| rudi@stekom.ac.id | password | karyawan | approved |
| siti@stekom.ac.id | password | karyawan | approved |
| budi@stekom.ac.id | password | karyawan | pending (perlu diverifikasi) |

---

## Environment Variables

### `frontend/.env`

```env
VITE_API_URL=http://localhost:3001
VITE_APP_RELEASE_DATE=2026-07-13
```

**Keterangan:**
| Variable | Default | Deskripsi |
|----------|---------|-----------|
| `VITE_API_URL` | `http://localhost:3001` | Base URL mock API |
| `VITE_APP_RELEASE_DATE` | `2026-07-13` | Tanggal rilis aplikasi (data sebelum ini dianggap kosong di dashboard) |

### `mock-api/.env`

```env
BETTER_AUTH_SECRET=your-secret-key-min-32-chars-long-here
BETTER_AUTH_URL=http://localhost:3001
APP_RELEASE_DATE=2026-07-13
```

**Keterangan:**
| Variable | Default | Deskripsi |
|----------|---------|-----------|
| `BETTER_AUTH_SECRET` | — | Secret key untuk better-auth (min 32 karakter) |
| `BETTER_AUTH_URL` | `http://localhost:3001` | Base URL auth server |
| `APP_RELEASE_DATE` | `2026-07-13` | Cutoff date untuk dashboard admin |

---

## Available Scripts

### Frontend

| Script | Perintah | Deskripsi |
|--------|----------|-----------|
| Dev | `bun run dev` | Start Vite dev server (port 5173) |
| Build | `bun run build` | TypeScript check + build production |
| Lint | `bun run lint` | Jalankan oxlint |
| Preview | `bun run preview` | Preview production build |

### Mock API

| Script | Perintah | Deskripsi |
|--------|----------|-----------|
| Start | `bun run start` | Start server (port 3001) |
| Seed | `bun run seed` | Reset & seed database |
| Seed+Start | `bun run seed && bun run start` | Seed lalu start |

---

## Troubleshooting

### Port 3001 / 5173 already in use

```powershell
# Cari PID yang menggunakan port
netstat -ano | Select-String ":3001"

# Matikan proses
Stop-Process -Id <PID> -Force
```

### Route tree tidak ter-generate

```bash
cd frontend
Remove-Item src/routeTree.gen.ts -Force
bun run dev
```

> Vite + TanStack Router plugin akan meng-generate ulang route tree secara otomatis.

### Error `table "user" already exists`

Hapus file database lama:

```bash
cd mock-api
Remove-Item auth.db -Force
bun run start
```

Server akan meregenerasi `auth.db` otomatis saat startup.

### Face-api models tidak loading

Pastikan folder `frontend/public/models/` berisi file weight face-api.js:

```
frontend/public/models/
├── tiny_face_detector_model-shard1
├── tiny_face_detector_model-weights_manifest.json
├── face_landmark_68_model-shard1
├── face_landmark_68_model-weights_manifest.json
├── face_recognition_model-shard1
├── face_recognition_model-weights_manifest.json
├── face_recognition_model-shard2
└── face_recognition_model-weights_manifest.json
```

Jika kosong, download dari: https://github.com/justadudewhohacks/face-api.js/tree/master/weights

### Module not found

```bash
cd frontend  # atau cd mock-api
bun install
```

### Reset Product Tour

Buka console browser (F12) lalu jalankan:

```js
// Reset tour utama
localStorage.removeItem('absenku-tour')

// Reset verification tour
localStorage.removeItem('absenku-verification-tour')

// Refresh halaman
location.reload()
```
