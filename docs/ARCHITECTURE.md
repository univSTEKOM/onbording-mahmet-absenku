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
| Excel Export | ExcelJS 4.4 (dinonaktifkan sementara) |
| Face Recognition | face-api.js (tinyFaceDetector) |
| Linter | oxlint — **zero errors** |

### Backend

| Layer | Teknologi |
|-------|-----------|
| Framework | NestJS 11 |
| Database | PostgreSQL 17 |
| ORM | Drizzle ORM |
| Auth | better-auth (cookie session, Drizzle adapter) |
| Validation | Zod 4 |
| File Storage | MinIO (S3-compatible) |
| Rate Limiting | In-memory Map |
| Testing | Jest (unit) + Supertest (E2E) |
| Linter | ESLint — **zero errors** |

## Struktur Folder

```
absenku/
├── frontend/src/
│   ├── api/            # Axios service per domain
│   ├── components/     # ui/(shadcn), shared/, layout/, pengajuan/, tour/
│   ├── hooks/          # TanStack Query hooks per domain
│   ├── lib/            # Utilities, constants, chart config, validation
│   ├── pages/          # Page components
│   ├── routes/         # TanStack Router (nested layouts + role guards)
│   └── types/          # TypeScript interfaces
├── backend/
│   ├── src/            # NestJS modules (auth, users, absensi, pengajuan, dashboard, storage, seed)
│   ├── drizzle/        # Migration files
│   └── docs/           # PRD + API reference
└── docs/               # Dokumentasi project
```

## Alur Data

```
Browser → React → TanStack Query → Axios → localhost:9090 → NestJS Controller
    → Service (Drizzle ORM) → PostgreSQL
    → File upload → MinIO
    → Auth → better-auth (cookie session)
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

## Dashboard Charts

### Admin — "Kehadiran Bulan Ini" (Pie Chart)

3 slice menggunakan `attendanceCategoryConfig`:

| Slice | Key | Rumus |
|-------|-----|-------|
| Hadir | `present` | hadir + pulangCepat + terlambat |
| Izin/Sakit | `absentPermit` | izin + sakit + cuti |
| Alfa | `absentUnpermit` | tidakHadir |

- Legend hanya label + tooltip hover (tanpa angka tambahan)
- Berbeda dengan `absensiChartConfig` (7 slice) yang dipakai untuk stacked bar "Tren Kehadiran 7 Hari"

### Admin — "Tren Kehadiran 7 Hari" (Stacked Bar)

- Range: **7 hari kalender penuh sebelum hari ini** `(today-7)` sampai `(today-1)`
- Bukan Monday-based week (semua hari sudah lewat, data lengkap)
- Data dari `GET /api/dashboard/admin/week`

### Stat Cards (Admin Dashboard)

| Card | Sumber Data |
|------|-------------|
| Total Karyawan | `summary.totalKaryawan` |
| Hadir Hari Ini | `summary.hadirHariIni` |
| Alfa Hari Ini | `summary.alfaHariIni` |
| Verifikasi | `pendingUsers.length` |

## Export XLSX

> **Status:** Fitur selesai, tapi **dinonaktifkan sementara** (`className="hidden"` di AdminRiwayatPage + RiwayatPage).

| File | Peran |
|------|-------|
| `lib/export-xlsx.ts` | Core ExcelJS builder + chart generator (Canvas → PNG) |
| `lib/export-templates.ts` | Template 3 sheet (Data Absensi, Ringkasan, Statistik) |
| `components/shared/ExportDialog.tsx` | Dialog filter + export (XLSX only) |

Aktifkan kembali: hapus `className="hidden"` dari `<div>` pembungkus Export button + ExportDialog di kedua page.

## In-App Tour

- Tour onboarding untuk role `karyawan` dan `admin`
- State disimpan di `localStorage` (per-user via `userId` key)
- **Reset:** Tour dihapus saat logout melalui confirm modal (fungsi `clearTourStorage` + `clearVerificationTourStorage` di `nav-user.tsx`)
