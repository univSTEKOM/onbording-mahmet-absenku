<p align="center">
  <picture>
    <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white" alt="React 19" />
    <img src="https://img.shields.io/badge/TypeScript-6-3178C6?logo=typescript&logoColor=white" alt="TypeScript 6" />
    <img src="https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white" alt="Vite 8" />
    <img src="https://img.shields.io/badge/Tailwind-4-06B6D4?logo=tailwindcss&logoColor=white" alt="Tailwind 4" />
    <img src="https://img.shields.io/badge/Bun-1-000?logo=bun&logoColor=white" alt="Bun 1" />
    <img src="https://img.shields.io/badge/Express-5-000?logo=express&logoColor=white" alt="Express 5" />
    <img src="https://img.shields.io/badge/SQLite-3-003B57?logo=sqlite&logoColor=white" alt="SQLite" />
    <img src="https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white" alt="Docker Compose" />
  </picture>
</p>

<h1 align="center">AbsenKu — Sistem Absensi Karyawan</h1>

<p align="center">
  Aplikasi absensi dengan dua peran (<b>Karyawan</b> & <b>Admin</b>), fitur check-in/out, verifikasi wajah, riwayat kehadiran, pengajuan cuti/izin, dashboard analitik, dan ekspor data.
</p>

---

## 🐳 Cara 1: Jalankan dengan Docker (recommended)

> Butuh: [Docker](https://docker.com) ≥ 24.x + [Docker Compose](https://docs.docker.com/compose/) ≥ 2.x

```bash
docker compose up -d
```

| Akses | URL |
|-------|-----|
| Aplikasi | http://localhost:5173 |
| API | http://localhost:3001 |

---

## 🖥 Cara 2: Jalankan Manual

> Butuh: [Bun](https://bun.sh) ≥ 1.x, [Node.js](https://nodejs.org) ≥ 18.x

```bash
# Terminal 1 — Backend (mock API)
cd mock-api
bun install
bun run seed.js
bun run server.js  # http://localhost:3001

# Terminal 2 — Frontend
cd frontend
bun install
bun run dev        # http://localhost:5173
```

---

## 🔐 Akun Demo

| Email | Password | Role | Status |
|-------|----------|------|--------|
| andika@stekom.ac.id | password | **admin** | approved |
| rudi@stekom.ac.id | password | karyawan | approved |
| siti@stekom.ac.id | password | karyawan | approved |
| budi@stekom.ac.id | password | karyawan | pending |
| dewi@stekom.ac.id | password | karyawan | approved |
| ani@stekom.ac.id | password | karyawan | approved |
| tono@stekom.ac.id | password | karyawan | approved |
| ferry@stekom.ac.id | password | karyawan | pending |

Password bisa diubah via env `DEMO_PASSWORD`.

---

## 🧰 Tech Stack

**Frontend:** React 19 · TypeScript 6 · Vite 8 · Tailwind 4 · shadcn/ui · TanStack Router · TanStack Query · Recharts 3

**Backend (mock):** Express 5 · json-server · better-auth · SQLite · Drizzle ORM

**Tools:** Bun · Docker Compose · oxlint · face-api.js · ExcelJS

---

## 📖 Dokumentasi

| Dokumen | Untuk |
|---------|-------|
| [SETUP.md](docs/SETUP.md) | Instalasi detail, env, troubleshooting |
| [ARCHITECTURE.md](docs/ARCHITECTURE.md) | Tech stack, struktur, alur data, chart system |
| [API.md](docs/API.md) | Semua endpoint + validasi + TypeScript types |
| [PRD.md](docs/PRD.md) | Visi produk, fitur, roadmap |
| [DOCKER.md](docs/DOCKER.md) | Panduan Docker lengkap |

---

<p align="center">
  <sub>© 2026 AbsenKu by <a href="https://github.com/MAHMETT">github.com/MAHMETT</a></sub>
</p>
