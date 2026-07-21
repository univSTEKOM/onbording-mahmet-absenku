# Changelog — Sistem Absensi Karyawan

## Ringkasan Perubahan

### Fase 1: Init Project
- Setup React + Vite + TypeScript + Tailwind + shadcn/ui
- TanStack Query, React Router, Axios
- Mock API (json-server) dengan custom auth routes

### Fase 2: Fitur Inti
| Fitur | Detail |
|---|---|
| Auth | Login, Register, fake JWT, role-based routing |
| Absensi | Check-in/out, validasi waktu (06:45-07:45, >=16:00) |
| Riwayat | Filter status, sort, pagination, export CSV |
| Pengajuan | CRUD, approve/reject, delete confirmation |
| Dashboard Personal | Stat cards, chart 7 hari, aktivitas terbaru |
| Dashboard HRD | Overview, tabs, chart tren, approve/reject |
| Profil | Edit info, upload foto (base64), validasi |

### Fase 3: HRD Features
- CRUD Karyawan (create/edit/delete user)
- Riwayat HRD (semua karyawan, filter tanggal/user/status)
- Management Pengajuan HRD (stat + filter + approve/reject)

### Fase 4: UI/UX Redesign
- **Theme**: Twitter-blue dari `docs/shadn-theme.md`
- **Dark Mode**: ThemeToggle + ThemeProvider
- **Layout**: Sheet sidebar (mobile), Navbar dropdown user
- **Dashboard**: Bar chart (recharts), progress bar, stat dengan %
- **Sidebar**: Pure navigation, user info pindah ke navbar
- **Content**: Rata kiri (tidak center), max-w lebih lebar
- **Pengajuan**: Card-based layout, tabs filter, detail dialog

### Fase 5: Reusable Components
| Komponen | Lokasi |
|---|---|
| `StatsCard` | `components/shared/StatsCard.tsx` |
| `LoadingState`, `TableSkeleton` | `components/shared/LoadingState.tsx` |
| `EmptyState` | `components/shared/EmptyState.tsx` |
| `ConfirmDialog` | `components/shared/ConfirmDialog.tsx` |
| `ErrorBoundary` | `components/shared/ErrorBoundary.tsx` |
| `Pagination` | `components/shared/Pagination.tsx` |

### Fase 6: Type System & Constants
- `types/index.ts` — Domain models (User, Absensi, Pengajuan)
- `types/api.ts` — API contracts (ApiResponse, PaginatedResult)
- `lib/constants.ts` — Reusable colors, MAX length constants
- `lib/absensiRules.ts` — Check-in/out time validation
- `lib/faceDetection.ts` — Face detection utilities

### Fase 7: Validasi
| Prioritas | Fix |
|---|---|
| P1 | Email format validation HrdKaryawanPage |
| P1 | Server-side validation (users, pengajuan, delete guard) |
| P2 | Phone validation (digit-only, min 10 digit) |
| P2 | Future-date check PengajuanFormPage |
| P2 | Catatan wajib saat reject |
| P2 | Max-length semua text field |

### Fase 8: Performance & Sync
- `staleTime: 0` — data always fresh
- Server-side dashboard endpoints (`/api/dashboard/recent`, `/api/dashboard/hrd/week`)
- oxlint setup, zero lint warnings
- TypeScript strict mode, zero TS errors

### Fase 9: Face Recognition (Bonus)
- face-api.js dengan TinyFaceDetector (189KB)
- Kamera auto-start, loading progress
- Simpan face descriptor ke user.foto
- Verifikasi saat check-in, fallback manual

## Stack Akhir
| Teknologi | Versi |
|---|---|
| React | 19 |
| Vite | 8 |
| TypeScript | 6 |
| Tailwind CSS | 4 |
| shadcn/ui | 4 (base-ui) |
| TanStack Query | 5 |
| react-router-dom | 7 |
| Axios | 1 |
| recharts | 2 |
| face-api.js | 0.22 |
| oxlint | 1.74 |

## Commit History
Total: 45+ commits
