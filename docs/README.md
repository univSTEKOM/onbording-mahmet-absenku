# AbsenKu — Sistem Absensi Karyawan

Aplikasi absensi karyawan modern dengan dua peran: **Karyawan** dan **Admin**.

> Cocok untuk perusahaan kecil-menengah yang ingin digitalisasi absensi dengan fitur verifikasi wajah, manajemen cuti/izin, dan dashboard analitik.

---

## ✨ Fitur Utama

| Fitur | Karyawan | Admin |
|-------|----------|-------|
| Check-in / Check-out dengan verifikasi wajah | ✅ | — |
| Dashboard personal (statistik kehadiran) | ✅ | — |
| Riwayat absensi dengan filter & kalender | ✅ | ✅ (semua karyawan) |
| Pengajuan cuti, izin, sakit | ✅ | ✅ (approve/reject) |
| Dashboard admin (tren, rekap, verifikasi) | — | ✅ |
| Kelola & verifikasi karyawan | — | ✅ |
| Ekspor data ke CSV | ✅ | ✅ |

---

## 🚀 Mulai Cepat

```bash
# 1. Setup mock API
cd mock-api
npm install
node server.js          # → http://localhost:3001

# 2. Setup frontend
cd frontend
npm install
npm run dev             # → http://localhost:5173
```

### Akun Demo

| Email | Password | Role |
|-------|----------|------|
| `andika@stekom.ac.id` | `password` | Admin |
| `rudi@stekom.ac.id` | `password` | Karyawan |
| `siti@stekom.ac.id` | `password` | Karyawan |
| `budi@stekom.ac.id` | `password` | Karyawan (pending) |

---

## 📖 Dokumentasi

| Dokumen | Untuk | Isi |
|---------|-------|-----|
| [SETUP.md](SETUP.md) | Developer | Instalasi, konfigurasi, troubleshooting |
| [ARCHITECTURE.md](ARCHITECTURE.md) | Developer Senior | Tech stack, struktur, alur data |
| [API.md](API.md) | Developer + Backend | Semua endpoint, request/response, tipe data |
| [PRD.md](PRD.md) | Stakeholder | Visi produk, fitur, roadmap |

---

## 🛠 Tech Stack

- **Frontend**: React 19, TypeScript 6, Vite 8, Tailwind CSS 4
- **UI**: shadcn/ui, TanStack Router, TanStack Query
- **Auth**: better-auth (cookie-based session)
- **Charts**: Recharts 3
- **Mock API**: json-server 0.17 + Express 5 + SQLite
- **Linter**: oxlint (zero warnings)
