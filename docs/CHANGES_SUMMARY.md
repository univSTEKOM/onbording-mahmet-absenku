# Ringkasan Perubahan — Migrasi Auth ke Better Auth

## Root Cause Bug
`AuthContext.tsx` percaya buta sama localStorage — user fiktif tetap bisa akses karena gak divalidasi ke server.

## Arsitektur Baru
```
Sebelum: localStorage fake token → After: HTTP-only cookie session via Better Auth
```

## Backend (mock-api/)

| # | Perubahan |
|---|-----------|
| 1 | **auth.js** (baru) — Better Auth instance pakai SQLite, email/password auth, custom fields: `role`, `jabatan`, `phone`, `alamat` |
| 2 | **server.js** — di-rewrite ke ESM. Better Auth handle `/api/auth/*` (sign-in, sign-out, session). Custom `/api/register` untuk daftar (create di Better Auth + json-server). Hapus middleware fake auth lama. Tambah `/api/me` endpoint. CORS pake credentials |
| 3 | **seed.js** (baru) — hapus `auth.db` lama, migrasi otomatis, create 3 user demo (andika, rudi, siti) di Better Auth + `db.json`, update relasi absensi/pengajuan |
| 4 | **db.json** — `users` pake UUID string dari Better Auth (bukan auto-increment number) |
| 5 | **package.json** — `"type": "module"`, deps: `better-auth`, `better-sqlite3`, `express`, `cors` |

## Frontend (src/)

| # | Perubahan |
|---|-----------|
| 1 | **lib/auth-client.ts** (baru) — `createAuthClient` dengan base URL `localhost:3001` + credentials cookie |
| 2 | **hooks/useAuth.ts** — rewrite total. Gak pake context/localStorage. Source of truth: `authClient.useSession()`. Interface tetap sama (`user`, `login`, `register`, `logout`, `updateUser`, `isAdmin`) |
| 3 | **contexts/AuthContext.tsx** — dihapus (file dikosongkan) |
| 4 | **App.tsx** — hapus `<AuthProvider>` wrapper |
| 5 | **api/axios.ts** — hapus interceptor localStorage token, tambah `withCredentials: true` |
| 6 | **api/auth.ts** — masih ada (tapi gak di-import siapapun) |
| 7 | **types/index.ts + api.ts** — `User.id` → `string`, `userId` di Absensi/Pengajuan → `string`, hapus `LoginResponse` |
| 8 | **api/dashboard.ts, absensi.ts, users.ts** — parameter `userId`/`id` → `string` |
| 9 | **hooks/useUsers.ts** — tipe `id` → `string` |
| 10 | **pages/HrdKaryawanPage.tsx** — `/api/auth/register` → `/api/register` |
| 11 | **pages/HrdRiwayatPage.tsx** — `Number(selectedUserId)` → langsung string |

## File yang Tidak Berubah (hanya ganti source of truth user)

`LoginPage`, `RegisterPage`, `ProtectedRoute`, `AdminRoute`, `AuthLayout`, `Navbar`, `Sidebar`, `DashboardPage`, `RiwayatPage`, `ProfilPage`, `FaceVerification`, `HrdPengajuanPage`, `HrdDashboardPage` — tetap pakai `useAuth()` yang sama interfacenya.

## Verifikasi

- `tsc -b --noEmit` ✅ (0 error)
- `oxlint` ✅ (0 error)
