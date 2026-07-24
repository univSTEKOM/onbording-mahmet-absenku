# Product Tour — Design System, Visual & Motion

## Design System

### Components Reused dari shadcn/ui

| shadcn/ui Component | Used In |
|---|---|
| `Card`, `CardContent` | TourTooltip, TourModal |
| `Button` (variant: default, ghost, outline) | TourNavigation, TourModal |
| `Dialog`, `DialogContent` | TourModal (Welcome & Completion) |
| `Badge` | TourProgress (optional) |
| `Progress` | TourProgress (optional progress bar) |
| `Separator` | Dalam tooltip antara deskripsi & navigasi |
| `Avatar` | Jika spotlight ke NavUser |

Avoid introducing new primitive UI components. Semua visual dibangun dari
komponen existing.

### Icons

- **Library:** Lucide
- **Tooltip icon:** 16px, `text-primary`
- **Modal illustration:** 48-64px, Lucide icon or simple SVG illustration

---

## Visual Hierarchy

### Overlay

- **Warna:** `hsl(var(--background))` dengan opacity 80% (dark mode: 85%)
- **Z-index:** `z-50` (sama dengan dialog overlay)
- **Pointer events:** Overlay menangkap klik, spotlight cutout membiarkan interaksi

### Spotlight

- **Border radius:** 12px (konsisten dengan `rounded-xl`)
- **Padding:** 8px di sekitar elemen target
- **Border:** 2px solid `hsl(var(--primary))` / `hsl(var(--ring))`
- **Shadow:** Tidak perlu — cutout sudah cukup jelas

### Tooltip Card

- **Width:** `max-w-[360px]`
- **Background:** `hsl(var(--card))`
- **Border:** `1px solid hsl(var(--border))`
- **Shadow:** `shadow-lg`
- **Border radius:** `rounded-xl`
- **Padding:** `p-4`
- **Gap antar elemen:** `gap-3`

### Typography

- **Title:** `text-base font-semibold`
- **Description:** `text-sm text-muted-foreground`
- **Progress text:** `text-xs text-muted-foreground`

### Z-Index Strategy

```
Layer         Element              Z-Index
──────────────────────────────────────────
Overlay       TourOverlay          z-50
Spotlight     SVG cutout           z-50
Tooltip       TourTooltip          z-50
Modal         TourModal            z-50
```

Semua tour components di `z-50` — sama dengan dialog overlay. Tour components
merupakan satu-satunya elemen interaktif saat tour aktif.

---

## Motion Design

### Timing & Easing

| Elemen | Durasi | Easing |
|---|---|---|
| Overlay muncul | 200ms | ease-out |
| Overlay hilang | 150ms | ease-in |
| Spotlight pindah | 250ms | cubic-bezier(0.4, 0, 0.2, 1) |
| Tooltip muncul | 200ms | ease-out (fade + translateY(8px → 0)) |
| Tooltip hilang | 150ms | ease-in (fade + translateY(0 → 8px)) |
| Modal (scale) | 250ms | ease-out (scale 0.95 → 1) |
| Page scroll | 300ms | smooth |

### Transitions

- **Spotlight movement:** CSS `transition: all 250ms cubic-bezier(0.4, 0, 0.2, 1)`
  pada SVG mask
- **Tooltip entry:** `data-open` state dengan
  `animate-in fade-in slide-in-from-bottom-2 duration-200`
- **Step change:** Overlay tetap (tidak fade in/out antar step),
  hanya spotlight + tooltip yang bergerak

### Reduced Motion

- Deteksi `prefers-reduced-motion`
- Jika aktif: semua durasi jadi 0ms, skip animasi

---

## UI Improvements dari Dokumen Asli

### Copywriting

| Dokumen Asli | Saran Perbaikan | Alasan |
|---|---|---|
| "We'll show you around in less than one minute" | "Kami akan memandu kamu — kurang dari satu menit" | Bahasa Indonesia, lebih personal |
| "This is your main navigation." | "Ini navigasi utama kamu. Akses absensi, riwayat, pengajuan, dan profil kapan pun." | Lebih informatif |
| "This section gives you a quick overview..." | "Lihat status absensi hari ini, jam kerja, dan jatah cuti — semua di satu tempat." | Copy konkret, relevan |
| "This is where you'll record your attendance." | "Tombol ini untuk merekam kehadiran. Kamu akan diminta verifikasi wajah sebelum check-in." | Menyiapkan mental untuk face verification |
| "Need to review previous attendance?" | "Mau cek riwayat absensi? Semua tersimpan rapi — bisa dicari pakai filter." | Mengurangi kecemasan |
| "Going on leave or feeling unwell?" | "Mau cuti atau izin? Ajukan di sini dan pantau status persetujuan." | Jelas, actionable |
| "Keep your personal information up to date." | "Pastikan data kamu selalu update. Di sini juga bisa daftar ulang verifikasi wajah." | Menyebut fitur penting |
| "Enjoy using AbsenKu" | "Selamat menggunakan AbsenKu!" | Bahasa Indonesia, hangat |

### Completion Experience

Tambahan yang bisa dilakukan setelah dokumen asli:
- **Summary singkat:** "Kamu sudah belajar: navigasi, absensi, riwayat, pengajuan, dan profil"
- **Estimated next action:** "Siap absen hari ini?" — langsung ajak action
- **Tooltip tidak akan muncul lagi** — memberi rasa "selesai"

### Button Labels

| English (dokumen) | Indonesia (saran) |
|---|---|
| Start Tour | Mulai Tur |
| Skip | Lewati |
| Previous | Kembali |
| Next | Lanjut |
| Finish | Selesai |
| Go to Dashboard | Buka Dashboard |
