# Product Requirements Document — AbsenKu

**Versi:** 2.1 | **Status:** Development | **Updated:** 2026-07-27

---

## 1. Visi

Sistem absensi karyawan modern yang mudah digunakan, aman, dan memberikan insight kehadiran secara real-time. AbsenKu dirancang untuk perusahaan kecil-menengah yang ingin beralih dari absensi manual ke digital.

---

## 2. Target Pengguna

| Persona | Kebutuhan |
|---------|-----------|
| **Karyawan** | Check-in/out cepat, lihat riwayat sendiri, ajukan cuti/izin |
| **Admin HR** | Pantau kehadiran, verifikasi pendaftaran, kelola pengajuan, lihat rekap |

---

## 3. Fitur per Role

### 3.1 Karyawan

| Fitur | Prioritas | Status |
|-------|-----------|--------|
| Login / Register | P0 | ✅ |
| Check-in / Check-out dengan verifikasi wajah | P0 | ✅ |
| Dashboard personal (statistik hari ini + bulan) | P0 | ✅ |
| Riwayat absensi dengan filter (tanggal, status, kategori) | P0 | ✅ |
| Kalender absensi (lihat status per hari) | P0 | ✅ |
| Pengajuan cuti/izin/sakit | P0 | ✅ |
| Edit profil + foto | P1 | ✅ |
| Status akun (pending/approved/rejected) | P0 | ✅ |
| Aktivitas 7 hari terakhir | P1 | ✅ |

### 3.2 Admin

| Fitur | Prioritas | Status |
|-------|-----------|--------|
| Dashboard admin (tren 7 hari, statistik) | P0 | ✅ |
| Verifikasi pendaftaran karyawan (approve/reject) | P0 | ✅ |
| Kelola karyawan (CRUD) | P0 | ✅ |
| Lihat detail karyawan + riwayat absensi | P0 | ✅ |
| Approve/reject pengajuan cuti/izin | P0 | ✅ |
| Riwayat seluruh karyawan (filter + search) | P0 | ✅ |
| Ekspor data XLSX (sementara dinonaktifkan) | P1 | ✅ |
| Kategori kehadiran (fisik, izin, tanpa izin) | P1 | ✅ |
| Logout confirm + reset tour | P1 | ✅ |

---

## 4. Alur Utama

### 4.1 Onboarding Karyawan

```
Register → Pending → Admin Approve → Approved → Akses penuh
                          ↓ Reject
                    Edit Profil → Pending lagi
```

### 4.2 Check-in Harian

```
Buka halaman Absensi → Klik "Absen Sekarang" → Verifikasi Wajah (wajib) → Check-in berhasil
                                                                   ↓ Gagal
                                                            Coba lagi
```

### 4.3 Pengajuan Cuti

```
Karyawan: Ajukan → Pending → Admin Approve/Reject
                              ↓ Approve
                         Status: Disetujui
```

---

## 5. Non-Functional Requirements

| Aspek | Target |
|-------|--------|
| **Mobile-first** | Semua halaman responsif (320px - 1920px) |
| **Accessibility** | WCAG AA (contrast, keyboard nav, aria-label, tooltips) |
| **Type Safety** | TypeScript strict mode, zod validation |
| **Performance** | TanStack Query caching, debounce filter (300-400ms) |
| **Security** | Rate limiting login, session cookie, tidak ada password di response |
| **Lint** | oxlint — **zero errors** (beberapa warning non-kritis) |
| **Tests** | 48 unit tests (vitest) |

---

## 6. Tech Stack

| Layer | Teknologi |
|-------|-----------|
| Frontend | React 19, TypeScript 6, Vite 8, Tailwind CSS 4 |
| UI | shadcn/ui (Radix), TanStack Router, TanStack Query |
| Charts | Recharts 3 |
| Auth | better-auth (cookie session) |
| Validation | Zod 4 |
| Face Recognition | face-api.js |
| Linter | oxlint |

---

## 7. Roadmap

| Phase | Fitur | Status |
|-------|-------|--------|
| **Phase 1** | Auth, Check-in/out, Dashboard Karyawan | ✅ |
| **Phase 2** | Admin Dashboard, Verifikasi, Kelola Karyawan | ✅ |
| **Phase 3** | Pengajuan, Riwayat, Filter | ✅ |
| **Phase 4** | Attendance Category System (main/sub category) | ✅ |
| **Phase 5** | Security audit, tooltips, accessibility | ✅ |
| **Phase 6** | Export XLSX, logout confirm + tour reset | ✅ |
| **Phase 7** | Backend integration API | 📅 Next |
| **Phase 8** | Real backend (non mock-api) | 📅 Future |

---

## 8. API Contract Status

Semua endpoint sudah didokumentasikan di [API.md](API.md) dengan format request/response yang detail. Backend baru tinggal mengimplementasikan sesuai kontrak yang sudah ditentukan.
