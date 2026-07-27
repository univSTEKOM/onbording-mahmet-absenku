# Architecture

## Tech Stack

### Frontend

| Layer | Teknologi |
|-------|-----------|
| Framework | React 19 |
| Language | TypeScript 6 (strict mode) |
| Bundler | Vite 8 |
| Styling | Tailwind CSS 4 + shadcn/ui (Radix) |
| Routing | TanStack Router 1 (auto code-splitting) |
| Server State | TanStack Query 5 |
| HTTP Client | Axios |
| Auth | better-auth (cookie session) |
| Charts | Recharts 3 |
| Face Recognition | face-api.js (tinyFaceDetector) |
| Linter | oxlint — **zero warnings** |

### Mock API

| Layer | Teknologi |
|-------|-----------|
| Server | Express 5 + json-server 0.17 |
| Auth | better-auth + SQLite (better-sqlite3) |
| ORM | Drizzle ORM |

## Struktur Folder

```
on-boarding-trials/
├── frontend/src/
│   ├── api/            # Axios service per domain
│   ├── components/     # ui/(shadcn), shared/, layout/, pengajuan/, tour/
│   ├── hooks/          # TanStack Query hooks per domain
│   ├── lib/            # Utilities, constants, validation (zod)
│   ├── pages/          # Page components (16 pages)
│   ├── routes/         # TanStack Router (nested layouts + role guards)
│   └── types/          # TypeScript interfaces
├── mock-api/           # Express + json-server + SQLite
└── docs/               # Dokumentasi
```

## Alur Data

```
Browser → React → TanStack Query → Axios → localhost:3001 → json-server / better-auth → db.json / SQLite
```

## Role & Route Guards

```
Register (karyawan, status: pending)
  → Admin approve → status: approved → akses penuh
  → Admin reject  → status: rejected → hanya bisa edit profil
```

| Route | Guard | Redirect |
|-------|-------|----------|
| `/login`, `/register` | AuthLayout | Jika sudah login → dashboard |
| `/admin/*` | AdminGuard | Jika bukan admin → `/dashboard` |
| `/absensi/*` | KaryawanGuard | Jika admin → `/admin/dashboard` |

## Attendance Category System

Three main categories, each with sub-categories:

| Main | Sub | Contoh Legacy Status |
|------|-----|---------------------|
| **Kehadiran Fisik** | Standar, Fleksibel (WFH), Dinas, Lembur, Pelanggaran | `hadir`, `terlambat`, `pulang_cepat` |
| **Ketidakhadiran Berizin** | Cuti, Izin Sakit, Izin Personal, Izin Umum | `izin`, `sakit`, `cuti` |
| **Ketidakhadiran Tanpa Izin** | Alfa, Mangkir Parsial, Skorsing | `tidakHadir` |

> Semua absensi menyimpan `mainCategory` + `subCategory` selain `status` legacy untuk backward compatibility.
