# Arsitektur

## Tech Stack

### Frontend

| Layer | Teknologi | Versi |
|-------|-----------|-------|
| Framework | React | 19.x |
| Language | TypeScript | 6.x |
| Bundler | Vite | 8.x |
| Styling | Tailwind CSS | 4.x |
| UI Components | shadcn/ui (@base-ui/react, @radix-ui) | latest |
| Routing | TanStack Router | 1.x (file-based) |
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

---

## Struktur Folder

```
on-boarding-trials/
├── frontend/                        # React + Vite
│   ├── .env                         # VITE_API_URL=http://localhost:3001
│   ├── public/models/               # face-api.js weight files
│   ├── src/
│   │   ├── api/                     # Axios API services
│   │   ├── components/
│   │   │   ├── ui/                  # shadcn/ui primitives (22 komponen)
│   │   │   ├── layout/              # AuthLayout
│   │   │   ├── pengajuan/           # PengajuanCard, dialog
│   │   │   ├── pengguna/            # UserLink, ProfileInfoCard
│   │   │   ├── shared/              # 13 reusable components
│   │   │   ├── tour/                # Product Tour (8 files)
│   │   │   └── (root)               # AppSidebar, NavMain, NavUser, dll
│   │   ├── hooks/                   # Custom hooks
│   │   ├── lib/                     # Utilities, constants, auth, validation
│   │   ├── pages/                   # 16 page components
│   │   ├── routes/                  # TanStack Router (auto-generated tree)
│   │   └── types/                   # TypeScript interfaces
├── mock-api/                        # json-server + Express
│   ├── .env                         # BETTER_AUTH_SECRET, BETTER_AUTH_URL
│   ├── db.json                      # Seed data (users, absensi, pengajuan)
│   ├── auth.db                      # SQLite (better-auth sessions)
│   ├── server.js                    # Express server + custom routes
│   ├── auth.js                      # better-auth config
│   └── db-schema.js                 # Drizzle schema
├── docs/                            # Dokumentasi (9 file)
└── README.md
```

---

## Alur Data

```
Browser → React → TanStack Query → Axios → http://localhost:3001 → Express
                                                                    ├── json-server → db.json
                                                                    └── better-auth → SQLite (auth.db)
```

1. **Login:** better-auth client → `POST /api/auth/sign-in/email` → cookie session
2. **CRUD Data:** Axios GET/POST/PATCH/DELETE → json-server baca/tulis `db.json`
3. **Session Check:** Setiap request ke `/api/*` dicek via Express middleware → 401 jika tidak valid
4. **Realtime Refresh:** TanStack Query auto-refetch saat window focus atau query invalidation
5. **Dashboard Aggregasi:** Express compute dari raw `db.json` → response terformat (chart, summary)

---

## Auth Flow

```
User → Login → better-auth buat session → cookie disimpan browser
         │
         ├── useAuth().user = merge(sessionUser, dbJsonProfile)
         │
         ├── Setiap request: cookie dikirim otomatis → server validasi session
         │
         └── Session check periodik setiap 30 detik → deteksi jika admin hapus user
```

### Auth Components

| Component | Lokasi | Fungsi |
|-----------|--------|--------|
| `useAuth()` | `hooks/useAuth.ts` | Hook utama: user, login, register, logout, updateUser |
| `getAuthClient()` | `lib/auth-client.ts` | Singleton better-auth client, fallback stub |
| `AuthContextProvider` | `lib/auth-context.tsx` | Context provider untuk shared user data |
| `FilterProvider` | `lib/filter-context.tsx` | Global state untuk blur background saat dialog |
| `AuthLayout` | `components/layout/AuthLayout.tsx` | Wrapper login/register, redirect jika sudah login |

---

## Role & Access Flow

```
Register (tanpa login)
  → role: karyawan, status: pending
      → Admin approve → status: approved → akses penuh + Main Product Tour
      → Admin reject  → status: rejected → hanya bisa edit profil
          → User edit profil → status: pending lagi
              → Verification Tour (di /status dan /profil)
```

### Route Guards

| Route Pattern | Guard Component | Redirect |
|---------------|----------------|----------|
| `/login`, `/register` | `AuthLayout` | Jika sudah login → dashboard/status |
| `/status`, `/profil` | `_authenticated.tsx` | Jika tidak login → `/login` |
| `/dashboard`, `/absensi/*` | `_authenticated.tsx` | Jika pending/rejected → `/status` |
| `/admin/*` | `_admin.tsx` (AdminGuard) | Jika bukan admin → `/dashboard` |
| `/absensi/*`, `/pengajuan/*` | `_karyawan.tsx` (KaryawanGuard) | Jika admin → `/admin/dashboard` |
| Semua route lain | Catch-all (`$.tsx`) | Redirect sesuai role & status |

---

## Context Provider Hierarchy

```
main.tsx
└── QueryClientProvider
    └── RouterProvider
        └── __root.tsx
            ├── ThemeProvider (light/dark/system)
            ├── TooltipProvider
            └── ErrorBoundary
                └── _authenticated.tsx
                    ├── ErrorBoundary
                    ├── FilterProvider
                    ├── AuthContextProvider
                    │   └── SidebarProvider
                    │       └── TourProvider (role + status based)
                    │           ├── AppSidebar
                    │           └── SidebarInset → <Outlet />
```

---

## Product Tour Architecture

```
components/tour/
├── TourProvider.tsx        ← State, single portal z-[60]
├── TourSpotlight.tsx       ← SVG cutout + pulse animation
├── TourTooltip.tsx         ← Card + arrow positioning
├── TourNavigation.tsx      ← Prev/Next/Skip buttons
├── TourProgress.tsx        ← Progress bar + text
├── TourModal.tsx           ← Welcome & Completion dialog
├── TourPaused.tsx          ← Badge saat pindah halaman
├── TourStepRegistry.ts     ← 3 set steps (karyawan, admin, verification)
├── hooks/
│   ├── useTour.ts          ← Context consumer
│   ├── useSpotlight.ts     ← Position tracker (used by TourSpotlight)
│   └── useElementTracker.ts ← MutationObserver tracker (used by TourProvider)
└── utils/
    ├── tour-storage.ts     ← localStorage (2 keys: main + verification)
    └── tour-helpers.ts     ← Types + helpers
```

**Fitur:**
- Role-based steps (karyawan 8 step, admin 8 step, verification 5 step)
- Pause/resume saat route change
- Auto-expand sidebar di desktop
- Single portal z-[60] (di atas sheet z-50)
- CSS pulse animation di spotlight
- Tooltip arrow mengarah ke target
- Exit animation 150ms antar step
- Mobile disabled (modal only, no overlay)

---

## Face Recognition Flow

```
AbsensiPage
  → FaceVerification dialog
    → WebcamCapture (live camera)
      → face-api.js: detect wajah + landmark + descriptor
        → First time: simpan descriptor ke user.foto
        → Next time: bandingkan descriptor dengan yang tersimpan (threshold)
          → Match → check-in/out berhasil
          → No match → retry / skip verifikasi
```

| File | Fungsi |
|------|--------|
| `components/shared/FaceVerification.tsx` | Dialog verifikasi wajah |
| `components/shared/WebcamCapture.tsx` | Kamera + face overlay |
| `lib/faceDetection.ts` | Wrapper face-api.js (loadModels, detectFace, isMatch) |

---

## Key Design Patterns

| Pattern | Implementasi |
|---------|-------------|
| Component reusability | `shared/` components + shadcn/ui primitives |
| Server state | TanStack Query (queries + mutations) |
| File-based routing | TanStack Router (auto-generated route tree) |
| Error boundary | `ErrorBoundary` wrapping setiap layout |
| Auth guard | Layered: `_authenticated.tsx` → `_karyawan.tsx` / `_admin.tsx` |
| Tour onboarding | Context + portal + step registry (3 sets) |
| Filter/blur | `FilterContext` + conditional `blur-sm` CSS |
