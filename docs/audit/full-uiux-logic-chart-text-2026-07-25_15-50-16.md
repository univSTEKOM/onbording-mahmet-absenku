# Full Frontend Audit — UI/UX, Form, Badge, Chart, Logic, Text

**Date:** 2026-07-25 15:50:16
**Scope:** frontend/src/ — 139 files

---

## ?? HIGH PRIORITY

### 1. checkInGate useMemo dengan [] — Stale selamanya
**File:** pages/AbsensiPage.tsx:49
**Issue:** const checkInGate = useMemo(() => canCheckIn(), []) — canCheckIn() panggil 
ew Date() tapi dependensi [], jadi hasilnya di-compute sekali saat mount dan TIDAK PERNAH update. User yang buka halaman jam 06:30 akan lihat "Belum waktunya absen" selamanya.
**Fix:** Ganti dependensi ke state clock yang di-update tiap menit via setInterval.

### 2. Admin route eforeLoad — catch swallows redirect
**File:** Semua 6 admin route files (dmin.dashboard.tsx, dmin.karyawan.tsx, dmin.pengajuan.tsx, dmin.verifikasi.tsx, dmin.riwayat.tsx, dmin.profile.tsx) — lines 7-12
**Issue:** catch { throw redirect({ to: '/login' }) } — ketika es.data?.user?.role !== 'admin', 	hrow redirect(...) di-trigger, tapi langsung tertangkap catch yang kemudian throw redirect ke /login. Non-admin user dikirim ke /login bukan /dashboard.
**Fix:** catch (e) { if (e instanceof redirect) throw e; throw redirect({ to: '/login' }) }

### 3. 	idakHadir missing dari bsensiStatusBadge & bsensiStatusLabel
**File:** lib/constants.ts:13-20,60-67
**Issue:** AbsensiStatus type mencakup 'tidakHadir' tapi bsensiStatusBadge dan bsensiStatusLabel tidak punya entry untuknya. Beberapa konsumen (AdminDetailKaryawanPage, AbsensiPage) tidak punya fallback.
**Fix:** Tambah 	idakHadir: 'bg-[var(--color-status-tidakHadir)] text-white border-0' dan 	idakHadir: 'Alfa'.

### 4. 11 icon-only buttons tanpa ria-label
**Files:** AdminVerifikasiPage (3), KaryawanUserCard (2), PengajuanFormPage (1), DashboardPage (1), AdminRiwayatPage (1), 6 refresh buttons
**Issue:** Button dengan icon saja tanpa teks — screen reader tidak bisa membaca fungsinya.
**Fix:** Tambah ria-label pada setiap icon-only button.

### 5. 5 <Label> tanpa htmlFor di ProfilPage
**File:** pages/ProfilPage.tsx:138,143,147,152,162
**Issue:** Label Nama, Email, Jabatan, Telepon, Alamat tidak punya htmlFor. Input terkait juga tidak punya id. Screen reader tidak bisa associate label dengan input.
**Fix:** Tambah htmlFor={...} dan id={...}.

---

## ?? MEDIUM PRIORITY

### Badge Contrast
- pulang_cepat (#4ECDC4) + text-black ? contrast ~3.1:1 ? WCAG AA
- izin (#4FC3F7) + text-black ? contrast ~3.8:1 ?
- cuti (#90A4AE) + text-black ? contrast ~3.5:1 ?
- sakit (#BA68C8) + text-white ? contrast ~4.0:1 ? (barely)
**Fix:** Darken or lighten colors, or adjust text color.

### Chart Accessibility
- AttendancePieChart.tsx — SVG tanpa ria-label atau ole="img"
- WeekAttendanceChart.tsx — Sama, meski ada ccessibilityLayer
- Pie legend: charAt(0).toUpperCase() + slice(1) ? pulang_cepat jadi Pulang_cepat (underscore)
**Fix:** Pakai config[label].name untuk legend. Tambah ria-label di SVG.

### Admin redirect bug (detail)
6 admin route files — catch block tidak handle edirect instance.
**Fix code:**
`	s
catch (e) {
  if (e instanceof redirect) throw e
  throw redirect({ to: '/login' })
}
`

### i18n — Mixed Language
- "Check In" / "Check Out" vs "Absensi" (Indonesian) — inkonsisten
- "Edit Profil" — Edit (English) + Profil (Indonesian)
- "Timeline" — English
**Fix:** Standardisasi ke Indonesian: "Absen Masuk", "Absen Keluar", "Linimasa", "Ubah Profil".

### useCheckIn pakai user!.id non-null assertion
**File:** hooks/useAbsensi.ts:47,48
**Issue:** useCheckIn dan useCheckOut pakai user!.id — jika user null saat dipanggil, throw runtime error.
**Fix:** Tambah guard: if (!user) return atau throw error dengan pesan yang jelas.

### #999 fallback hardcoded
**File:** DashboardPage.tsx:315, RiwayatPage.tsx:301
**Fix:** Ganti ke ar(--color-status-tidakHadir).

### Hardcoded monthNames array
**File:** CalendarCard.tsx:15, AttendanceCalendar.tsx:19, AdminDashboardPage.tsx:22
**Fix:** Ganti ke 
ew Date(year, month).toLocaleDateString('id-ID', { month: 'long' }).

---

## ?? LOW PRIORITY

| # | Item | File |
|---|------|------|
| 1 | Double-submit guard lemah di handler (Login, Register, ProfilPage) | LoginPage, RegisterPage, ProfilPage |
| 2 | style={{ display: 'inline-block' }} ? className="inline-block" | AdminKaryawanPage.v3, AdminVerifikasiPage |
| 3 | canCheckIn/canCheckOut — 	oMinutes() tidak validasi range jam | lib/absensiRules.ts |
| 4 | mergeUserData unsafe s casts | hooks/useAuth.ts |
| 5 | etchProfile timeout 8s mungkin terlalu pendek | hooks/useAuth.ts |
| 6 | login catch swallow error details (kehilangan stack trace) | hooks/useAuth.ts |
| 7 | Duplikasi ormatJam/hitungJam di 5 file | DashboardPage, AbsensiPage, dll |
| 8 | Pie center label text overflow tidak di-handle | AttendancePieChart.tsx |
| 9 | ar label masih ada 1 | chart-config.ts:34 |
| 10 | setTimeout tanpa cleanup di TourProvider | TourProvider.tsx:76 |
| 11 | ../ import instead of @/ | useTour.ts:2 |

---

## ? Status Positif

| Area | Status |
|------|--------|
| Lint errors | 0 |
| TypeScript strict | ? Enabled |
| Zod validation | ? Active |
| Tests | 48/48 passing ? |
| Semua <img> ada lt | ? |
| Page spacing konsisten | ? (space-y-5 md:space-y-6) |
| Submit button disabled saat pending | ? Semua form |
| Setiap interval/setTimeout | ? Cleanup proper |
| Hardcoded hex colors di .tsx | ? 0 |
