# To-Do & Roadmap

## ✅ Selesai

### Core Features
- [x] Auth: register, login, logout (better-auth)
- [x] Role-based access: admin & karyawan
- [x] User verification flow (pending → approved/rejected)
- [x] Check-in / Check-out absensi
- [x] Face recognition untuk verifikasi
- [x] Dashboard karyawan (statistik, chart, kalender)
- [x] Dashboard admin (chart mingguan, pie chart, kalender)
- [x] Pengajuan cuti/izin/sakit (CRUD + approve/reject)
- [x] Manajemen karyawan (admin CRUD)
- [x] Profil (edit, foto, crop)
- [x] Riwayat absensi + filter + export CSV

### UI/UX
- [x] Dark mode
- [x] Responsive layout (mobile sidebar sheet)
- [x] Product Tour onboarding (8 step)
- [x] Verification Tour (5 step)
- [x] Password toggle visibility
- [x] Phone input with country code
- [x] Error boundary di layout
- [x] Filter dialog
- [x] Loading states + skeletons

### Product Tour
- [x] TourProvider + single portal z-[60]
- [x] Spotlight cutout + border primary
- [x] Tooltip dengan navigasi + progress bar
- [x] Pulse animation di spotlight
- [x] Tooltip arrow mengarah ke target
- [x] Step exit animation (150ms)
- [x] Pause/resume saat route change
- [x] Step registry: karyawan, admin, verification
- [x] localStorage persistence (2 key: main + verification)
- [x] Keyboard navigation (ESC, arrows)

### Infrastructure
- [x] Mock API (Express + json-server + better-auth)
- [x] SQLite + Drizzle ORM untuk auth
- [x] Rate limiting login (3 attempts)
- [x] Route guards (authenticated, admin, karyawan)
- [x] Axios 401 interceptor
- [x] Auth context (kurangi duplicate useAuth)
- [x] Bun package manager

---

## 🔄 In Progress

### Documentation
- [x] API.md — endpoint reference lengkap
- [x] SETUP.md — instalasi + troubleshooting
- [x] ARCHITECTURE.md — tech stack + flow
- [x] GUIDE.md — fitur per role
- [x] COLORS.md — design system tokens
- [x] README.md — project overview
- [x] CHANGELOG.md — riwayat rilis

---

## 📋 Planned

### Product Tour
- [ ] Mobile version (adaptive layout)
- [ ] Interactive steps (user harus klik target)
- [ ] Analytics (completion rate, drop-off)
- [ ] Manual restart button (di profil/settings)
- [ ] "What's New" tour for major updates

### Features
- [ ] Notifikasi real-time (approve/reject, absensi)
- [ ] Admin dashboard analytics (tour completion stats)
- [ ] Multiple face registration
- [ ] Weekly/monthly PDF report
- [ ] Clock display in header (real-time)
- [ ] Auto logout on idle
- [ ] Session management (lihat session aktif)
- [ ] Bulk import karyawan (CSV)

### Technical Debt
- [ ] Backend sync tour completion to server
- [ ] Unit tests (vitest)
- [ ] E2E tests (Playwright)
- [ ] Accessibility audit (WCAG 2.2)
- [ ] Route-level beforeLoad auth check
- [ ] Generic type untuk Axios responses
- [ ] Error message helper (selesai — getApiErrorMessage)

### Bugs Known
- [ ] Mobile tour: overlay/sheet z-index competition
- [ ] Edit pengajuan tidak state data (noted in code)
