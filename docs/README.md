# AbsenKu — Sistem Absensi Karyawan

Sistem manajemen kehadiran dan HRD berbasis web dengan verifikasi wajah, role-based access, dan onboarding tour interaktif.

**Stack:** React 19 · TypeScript 6 · Vite 8 · Tailwind 4 · shadcn/ui · TanStack Router · TanStack Query

---

## Daftar Dokumen

| Dokumen | Deskripsi | Estimasi Baca |
|---------|-----------|---------------|
| [ARCHITECTURE.md](ARCHITECTURE.md) | Tech stack, struktur folder, alur data, role flow, auth, tour, face rec | 5 menit |
| [SETUP.md](SETUP.md) | Instalasi, konfigurasi, menjalankan project, troubleshooting | 5 menit |
| [API.md](API.md) | Dokumentasi lengkap endpoint API, request/response, error codes | 10 menit |
| [GUIDE.md](GUIDE.md) | Fitur aplikasi per role, alur navigasi, workflow, status colors | 5 menit |
| [COLORS.md](COLORS.md) | Design system — CSS variables, chart colors, status colors, radius | 3 menit |

## Quick Start

```bash
git clone <repo-url>
cd on-boarding-trials/mock-api && bun install && bun run start
cd ../frontend && bun install && bun run dev
```

Buka **http://localhost:5173** — login: `andika@stekom.ac.id` / `password`

## Fitur Utama

- **Absensi** — Check-in/out dengan verifikasi wajah (face-api.js)
- **Dashboard** — Statistik real-time + chart kehadiran (7 hari & bulan)
- **Pengajuan** — Cuti/izin/sakit dengan approval workflow
- **Manajemen Karyawan** — CRUD, verifikasi, role management (admin)
- **Product Tour** — Onboarding interaktif (8 step karyawan, 8 step admin)
- **Role-Based** — Karyawan & admin dengan route guard terpisah
- **Dark Mode** — Tema light/dark/system
- **Responsive** — Desktop-first dengan mobile sidebar sheet
- **Export CSV** — Riwayat absensi (format Indonesia)

## Akun Demo

| Email | Password | Role |
|-------|----------|------|
| andika@stekom.ac.id | password | admin |
| rudi@stekom.ac.id | password | karyawan |
| siti@stekom.ac.id | password | karyawan |
| budi@stekom.ac.id | password | karyawan (pending) |
