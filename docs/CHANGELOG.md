# Changelog

## [Unreleased]

### Added
- Product Tour onboarding interaktif (8 step karyawan, 8 step admin, 5 step verification)
- Tour spotlight dengan pulse animation
- Tooltip arrow mengarah ke target
- Progress bar visual
- Step exit animation (fade-out 150ms)
- Verification Tour untuk user pending/rejected
- PasswordInput reusable dengan eye toggle + match indicator
- Single tour portal z-[60] (mobile/desktop)
- Route-based pause/resume tour
- ErrorBoundary di setiap layout

### Fixed
- Drizzle ORM delete tanpa `.run()` — user benar-benar terhapus dari auth.db
- Chart height infinite growth — ganti aspect-square dengan fixed height
- Login redirect loop — catch-all route prioritas
- Sidebar spotlight scroll issue — selector ke sidebar-container
- Dashboard telepon input cramped — full width layout
- Browser native password reveal double icon — CSS hide
- Chart styling — strokeWidth, dark mode border
- Admin routes — sidebar items konsisten dengan route prefix

### Changed
- `npm` → `bun` sebagai package manager
- Auth context terpusat — kurangi duplicate `useAuth()` calls
- Single portal untuk tour components (z-index terjamin)
- Phone input country code selector width: 90px → 70px

## [0.1.0] - 2026-07-13

### Added
- Sistem absensi dengan check-in/check-out
- Verifikasi wajah via face-api.js
- Dashboard karyawan & admin (chart, kalender, statistik)
- Pengajuan cuti/izin/sakit dengan approval workflow
- Manajemen karyawan (CRUD + verifikasi)
- Autentikasi better-auth (email/password, cookie session)
- Mock API dengan json-server + Express + SQLite
- Dark mode (light/dark/system)
- Responsive layout (desktop + mobile sheet sidebar)
- Role-based route guards (admin/karyawan/pending)
- Filter dialog untuk riwayat & pengajuan
- Export CSV riwayat absensi
- Image cropper untuk foto profil
- 16 halaman aplikasi
- 22 shadcn/ui komponen
- 13 shared komponen reusable
- Dokumentasi awal (6 file)
