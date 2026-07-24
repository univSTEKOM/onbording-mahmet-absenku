# Arsitektur

## Tech Stack

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

## Struktur Folder

```
on-boarding-trials/
├── frontend/                        # React + Vite
│   ├── .env                         # VITE_API_URL=http://localhost:3001
│   ├── public/models/               # face-api.js weight files
│   └── src/
│       ├── api/                     # Axios API services (absensi.ts, dashboard.ts, dll)
│       ├── components/
│       │   ├── ui/                  # shadcn/ui primitives (button, card, dialog, dll)
│       │   ├── layout/              # AuthLayout, sidebar
│       │   ├── pengajuan/           # PengajuanCard, PengajuanDetailDialog
│       │   ├── pengguna/            # UserLink, ProfileInfoCard
│       │   └── shared/              # EmptyState, Pagination, FilterDialog, StatsCard, dll
│       ├── hooks/                   # TanStack Query hooks (useAuth, useAbsensi, dll)
│       ├── lib/                     # Utilities (cn, formatDate), constants
│       ├── pages/                   # Page components (DashboardPage, LoginPage, dll)
│       ├── routes/                  # TanStack Router route definitions
│       └── types/                   # TypeScript interfaces (User, Absensi, Pengajuan)
├── mock-api/                        # json-server + Express
│   ├── .env                         # BETTER_AUTH_SECRET, BETTER_AUTH_URL
│   ├── db.json                      # Seed data (users, absensi, pengajuan)
│   ├── auth.db                      # SQLite (better-auth sessions)
│   ├── server.js                    # Express server + custom routes
│   ├── auth.js                      # better-auth config
│   └── db-schema.js                 # Drizzle schema
└── docs/                            # Dokumentasi (file ini)
```

## Alur Data

```
Browser → React → TanStack Query → Axios → http://localhost:3001 → Express → json-server / better-auth
                                                                          ↓
                                                                     db.json / SQLite
```

1. **Login:** better-auth client → `POST /api/auth/sign-in/email` → cookie session disimpan
2. **CRUD Data:** Axios GET/POST/PATCH/DELETE → json-server membaca/menulis `db.json`
3. **Session Check:** Setiap request ke `/api/*` dicek via middleware → 401 jika tidak valid
4. **Realtime Refresh:** TanStack Query auto-refetch saat window focus atau query invalidation

## Role & Access Flow

```
Register (tanpa login)
  → role: karyawan, status: pending
     → Admin approve → status: approved → akses penuh
     → Admin reject  → status: rejected → hanya bisa edit profil
        → User edit profil → status: pending lagi
```

### Route Guards

| Route Pattern | Guard | Redirect |
|---------------|-------|----------|
| `/login`, `/register` | `AuthLayout` | Jika sudah login → dashboard/status |
| `/status`, `/profil` | `AuthenticatedLayout` | Jika tidak login → `/login` |
| `/admin/*` | `AdminGuard` (`_admin.tsx`) | Jika bukan admin → `/dashboard` |
| `/absensi/*`, `/pengajuan/*` | `KaryawanGuard` (`_karyawan.tsx`) | Jika admin → `/admin/dashboard` |
| Semua route lain | Catch-all (`$.tsx`) | Redirect sesuai role & status |
