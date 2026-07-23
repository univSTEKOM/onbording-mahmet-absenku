# Session: Build Frontend-v2 (AbsenKu)

## Objective
Bangun frontend baru (`frontend-v2/`) untuk aplikasi AbsenKu menggunakan **better-t-stack** dengan TanStack Router, TanStack Query, dan Axios. Frontend ini adalah rewrite dari `frontend/` yang sudah ada — kode harus lebih bersih, lebih reusable, lebih ringan, dan performa lebih cepat.

## Setup

```bash
cd on-boarding-trials
bun create better-t-stack@latest frontend-v2 \
  --frontend tanstack-router \
  --backend none --runtime none --api none \
  --auth none --payments none --database none \
  --orm none --db-setup none \
  --package-manager bun --git \
  --web-deploy none --server-deploy none \
  --install \
  --addons lefthook mcp oxlint skills \
  --examples none
```

## Tech Stack

| Komponen | Pilihan |
|---|---|
| Framework | React 19 + Vite 8 |
| Routing | TanStack Router (file-based, autoCodeSplitting) |
| Data Fetching | TanStack Query v5 |
| HTTP Client | Axios |
| Styling | Tailwind CSS v4 |
| UI Kit | shadcn/ui (base-ui) |
| Auth | better-auth (cookie session) |
| Package Manager | bun |
| Linter | oxlint |
| Language | TypeScript ~6.0 |

## Mock API

Server API palsu di `../mock-api/` (port 3001):

```bash
cd ../mock-api
bun start
```

Dokumentasi lengkap ada di `docs/mock-api/endpoints.md` dan `docs/mock-api/data-models.md`.

### Demo Akun

| Email | Password | Role |
|---|---|---|
| andika@stekom.ac.id | password | Admin |
| rudi@stekom.ac.id | password | Karyawan |
| siti@stekom.ac.id | password | Karyawan |
| budi@stekom.ac.id | password | Karyawan (pending) |

## Arsitektur Route

Gunakan file-based routing TanStack Router dengan struktur berikut:

```
src/routes/
├── __root.tsx                    # ThemeProvider + UserProvider + Outlet + Toaster
├── index.tsx                     # / → WelcomePage
├── login.tsx                     # /login
├── register.tsx                  # /register
├── _authenticated.tsx            # guard: cek login + onboarding + sidebar layout
├── _authenticated/
│   ├── dashboard.tsx             # /dashboard → RoleDashboard
│   ├── status.tsx                # /status → StatusAkunPage
│   ├── profil.tsx                # /profil → ProfilPage
│   ├── _karyawan.tsx             # guard: redirect admin ke /hrd/dashboard
│   ├── _karyawan/
│   │   ├── absensi/
│   │   │   ├── index.tsx         # /absensi
│   │   │   └── riwayat.tsx       # /absensi/riwayat
│   │   └── pengajuan/
│   │       ├── index.tsx         # /pengajuan
│   │       └── baru.tsx          # /pengajuan/baru
│   ├── _admin.tsx                # guard: cek admin role
│   └── _admin/
│       ├── hrd.dashboard.tsx     # /hrd/dashboard
│       ├── hrd.riwayat.tsx       # /hrd/riwayat
│       ├── hrd.pengajuan.tsx     # /hrd/pengajuan
│       ├── hrd.karyawan.tsx      # /hrd/karyawan
│       └── hrd.verifikasi.tsx    # /hrd/verifikasi
└── $.tsx                         # catch-all → redirect by role
```

### Guard Pattern
Gunakan component-level guard dengan `useAuth()` hook (bukan `beforeLoad`):

```tsx
function AuthenticatedLayout() {
  const { user, isLoading } = useAuth()
  if (isLoading) return null
  if (!user) return <Navigate to="/login" replace />
  if (['pending', 'rejected'].includes(user.status))
    return <Navigate to="/status" replace />
  return <Outlet />
}
```

## Fitur yang Harus Dibangun

Lihat `docs/frontend/features.md` untuk detail lengkap.

### Prioritas 1 (Wajib)
1. **Auth** — Login, Register, Logout, session check via better-auth
2. **Dashboard Personal** — Stats cards, kalender 7 hari, quick action
3. **Absensi** — Check-in/out dengan face verification (face-api.js)
4. **Riwayat Kehadiran** — Filter tanggal + status, card layout
5. **Pengajuan** — List, form baru, approve/reject (admin)
6. **Dashboard HRD** — Statistik, grafik, pending users
7. **Profil** — View + edit mode
8. **Manajemen Karyawan (Admin)** — CRUD, verifikasi pending

### Prioritas 2 (Penting)
9. **Filter reusable** — FilterBar/FilterDialog komponen
10. **Empty State & Loading Skeleton** — Semua halaman
11. **Status Badge** — Warna konsisten per status
12. **Toast notification** — Success/error pada mutation

### Prioritas 3 (Bonus)
13. **Face Recognition** — Auto capture + manual capture
14. **Export data** — Riwayat kehadiran
15. **Rate limiting UI** — Tampilkan sisa blokir

## Struktur Direktori

```
src/
├── api/               # Axios instance + type-safe fetch wrappers
├── components/
│   ├── ui/            # shadcn/ui components
│   └── shared/        # Reusable: StatusBadge, EmptyState, FilterBar, etc.
├── hooks/             # TanStack Query hooks + useAuth
├── lib/               # Router config, query client, constants
├── routes/            # TanStack Router file-based routes
├── pages/             # Halaman (di-import oleh route files)
├── types/             # TypeScript interfaces
└── providers/         # React context providers (ThemeProvider, UserProvider)
```

## API Layer Pattern

```ts
// src/api/axios.ts
import axios from 'axios'
export const api = axios.create({
  baseURL: 'http://localhost:3001',
  withCredentials: true,
})

// src/hooks/useUsers.ts
export function useAllUsers() {
  return useQuery({
    queryKey: ['users', 'all'],
    queryFn: () => api.get('/api/users/all').then(r => r.data),
  })
}
```

Referensi lengkap TanStack Query hooks ada di `docs/migration/api-reference.md`.

## Aturan Ngoding

1. **Clean code** — Tidak ada komentar, kode self-documenting.
2. **Reusable** — Extract komponen yang dipakai >1 kali.
3. **Type-safe** — Manfaatkan tipe dari TanStack Router untuk params/search.
4. **No lazy()** — TanStack Router handle auto code-split.
5. **No any** — Kecuali benar-benar terpaksa.
6. **Consistent naming** — File: kebab-case, Komponen: PascalCase, fungsi: camelCase.
7. **Zero lint error** — Jalankan `oxlint` sebelum selesai.

## Checklist

- [ ] Init project dengan better-t-stack
- [ ] Install shadcn/ui components (button, card, input, dialog, select, table, badge, avatar, skeleton, toast, dropdown, sidebar)
- [ ] Setup Axios + TanStack Query
- [ ] Setup better-auth client
- [ ] Setup TanStack Router (vite plugin + routeTree.gen)
- [ ] Root layout (__root.tsx)
- [ ] Auth layout (login/register)
- [ ] Authenticated guard + sidebar layout
- [ ] Admin guard
- [ ] Karyawan guard
- [ ] Catch-all redirect
- [ ] All route files (16 route files)
- [ ] Semua pages (12 pages)
- [ ] `tsc -b` → 0 error
- [ ] `oxlint` → 0 error
- [ ] `bun run build` → success
- [ ] Testing dengan mock API (login, absensi, semua fitur)
