<h1 align="center">AbsenKu Frontend</h1>

<p align="center">
  <strong>Frontend Application</strong><br>
  <em>React SPA with Face Recognition & Role-Based Routing</em>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black" alt="React">
  <img src="https://img.shields.io/badge/TypeScript-6-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/Vite-8-646CFF?style=flat-square&logo=vite&logoColor=white" alt="Vite">
  <img src="https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white" alt="Tailwind CSS">
  <img src="https://img.shields.io/badge/Bun-1-FBF0DF?style=flat-square&logo=bun&logoColor=black" alt="Bun">
</p>

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | React 19 |
| Language | TypeScript 6 (strict) |
| Bundler | Vite 8 |
| Styling | Tailwind CSS 4 + shadcn/ui (Radix) |
| Routing | TanStack Router (auto code-splitting, role guards) |
| Server State | TanStack Query 5 |
| HTTP Client | Axios |
| Auth | Better Auth (cookie session) |
| Face Recognition | face-api.js (tinyFaceDetector) |
| Charts | Recharts 3 |
| Export | ExcelJS 4.4 (XLSX) |
| Linter | Oxlint (zero errors) |
| Testing | Vitest + Testing Library |

---

## Quick Start

```bash
# 1. Install dependencies
bun install

# 2. Setup environment
cp .env.example .env

# 3. Start dev server
bun dev
```

Frontend running at `http://localhost:5173`.

---

## Project Structure

```
frontend/src/
├── api/                # Axios service per domain
│   ├── axios.ts        # Axios instance + interceptors
│   ├── absensi.ts      # Attendance API calls
│   ├── dashboard.ts    # Dashboard API calls
│   ├── pengajuan.ts    # Submission API calls
│   └── users.ts        # User management API calls
├── components/
│   ├── ui/             # shadcn/ui components
│   ├── shared/         # Reusable components (ExportDialog, etc.)
│   ├── layout/         # Layout components (sidebar, nav)
│   ├── absensi/        # Attendance-specific components
│   ├── pengajuan/      # Submission-specific components
│   └── tour/           # Onboarding tour components
├── hooks/              # TanStack Query hooks per domain
│   ├── useAbsensi.ts
│   ├── useDashboard.ts
│   ├── usePengajuan.ts
│   └── useUsers.ts
├── lib/                # Utilities & configuration
│   ├── router.ts       # TanStack Router setup
│   ├── routes.ts       # Route definitions
│   ├── auth-client.ts  # Better Auth client
│   ├── constants.ts    # App constants
│   ├── validation.ts   # Zod schemas
│   ├── export.ts       # Export helpers
│   ├── export-xlsx.ts  # ExcelJS builder
│   └── faceDetection.ts # Face recognition utils
├── pages/              # Page components
├── routes/             # TanStack Router (nested layouts + guards)
├── types/              # TypeScript interfaces
└── test/               # Test files
```

---

## Key Features / Fitur Utama

### Face Verification / Verifikasi Wajah
- Check-in/out dengan foto wajah
- Client-side face matching via face-api.js
- TinyFaceDetector untuk performa

### Role-Based Routing
```
/login, /register    → AuthRedirect (sudah login → dashboard)
/admin/*             → AdminGuard (karyawan → /dashboard)
/absensi/*           → KaryawanGuard (admin → /admin/dashboard)
```

### Real-Time Data Sync
- TanStack Query dengan `staleTime: 5 menit`
- Auto-refetch on window focus
- Optimistic updates pada mutations

### XLSX Export
- 3 sheet: Data Absensi, Ringkasan, Statistik
- Embedded chart (Canvas → PNG)
- Filter by date range & status

### Onboarding Tour
- Tour untuk karyawan dan admin
- State disimpan di localStorage (per-user)
- Reset saat logout

---

## Scripts

| Command | Description |
|---------|-------------|
| `bun dev` | Development server (HMR) |
| `bun build` | Production build → `dist/` |
| `bun preview` | Preview production build |
| `bun lint` | Oxlint |
| `bun test` | Vitest (run once) |
| `bun test:watch` | Vitest (watch mode) |

---

## Environment Variables

| Variable | Required | Default | Description |
|----------|:--------:|---------|-------------|
| `VITE_API_URL` | ✅ | `http://localhost:9090` | Backend API URL |
| `VITE_APP_NAME` | — | `AbsenKu` | Application name |
| `VITE_APP_RELEASE_DATE` | — | `2026-07-13` | Release date |

---

## Build for Production

```bash
bun build
```

Output: `dist/` directory — static files served by Nginx in Docker.

```dockerfile
# Dockerfile (multi-stage)
FROM oven/bun:latest AS builder
RUN bun install && bun build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
```

---

## Testing

```bash
# Run all tests
bun test

# Watch mode
bun test:watch

# Specific file
bun test -- src/test/absensi.test.ts
```

**Test files:**
- `absensi.test.ts` — Attendance logic
- `absensiRules.test.ts` — Check-in/out rules
- `attendance-categories.test.ts` — Category mapping
- `faceDetection.test.ts` — Face recognition utils
- `utils.test.ts` — Utility functions
