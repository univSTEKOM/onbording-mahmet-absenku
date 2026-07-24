# Product Tour — Product Goals & User Journey

## Product Goals

### Why this Product Tour exists

AbsenKu memiliki dua tipe user (karyawan & admin) dengan kompleksitas fitur yang cukup tinggi:
absensi dengan verifikasi wajah, pengajuan cuti/izin, riwayat, dan dashboard HRD.
User baru — terutama karyawan non-teknis — perlu dipandu menyelesaikan absensi pertama
mereka tanpa kebingungan.

### What success looks like

- **First Attendance Completion Rate** > 90% dalam 24 jam pertama
- **Tour completion rate** > 70%
- **Support tickets** terkait navigasi turun drastis
- User bisa menyelesaikan absensi mandiri tanpa bantuan admin

### What users should accomplish

1. Paham struktur navigasi utama
2. Tahu cara melakukan absensi + verifikasi wajah
3. Tahu cara melihat riwayat absensi
4. Tahu cara mengajukan cuti/izin
5. Tahu cara mengelola profil (termasuk update verifikasi wajah)
6. Admin: paham dashboard HRD, verifikasi karyawan, dan manajemen pengajuan

---

## User Journey

### Karyawan Flow (8 steps)

```
Start (first login after approved)
  │
  ▼
┌─────────────────────────────────────┐
│  Step 1: Welcome Modal              │
│  Ilustrasi + pesan singkat          │
│  [Mulai Tur] [Lewati]               │
└──────────┬──────────────────────────┘
           │
           ▼
┌─────────────────────────────────────┐
│  Step 2: Sidebar Navigation         │
│  Spotlight: seluruh sidebar         │
│  Tooltip di kanan                   │
└──────────┬──────────────────────────┘
           │
           ▼
┌─────────────────────────────────────┐
│  Step 3: Dashboard Summary Cards    │
│  Spotlight: stats cards row         │
│  Tooltip: floating di atas cards    │
└──────────┬──────────────────────────┘
           │
           ▼
┌─────────────────────────────────────┐
│  Step 4: Absen Sekarang Button      │
│  Spotlight: "Absen Sekarang" btn    │
│  Tooltip di samping button          │
└──────────┬──────────────────────────┘
           │
           ▼
┌─────────────────────────────────────┐
│  Step 5: Navigasi ke Riwayat        │
│  Spotlight: "Riwayat" di sidebar    │
│  Tooltip di kanan sidebar           │
└──────────┬──────────────────────────┘
           │
           ▼
┌─────────────────────────────────────┐
│  Step 6: Navigasi ke Pengajuan      │
│  Spotlight: "Pengajuan" di sidebar  │
│  Tooltip di kanan sidebar           │
└──────────┬──────────────────────────┘
           │
           ▼
┌─────────────────────────────────────┐
│  Step 7: User Profile (NavUser)     │
│  Spotlight: avatar footer sidebar   │
│  Tooltip di atas avatar             │
└──────────┬──────────────────────────┘
           │
           ▼
┌─────────────────────────────────────┐
│  Step 8: Completion Modal           │
│  Ilustrasi + pesan motivasi         │
│  [Buka Dashboard]                   │
└─────────────────────────────────────┘
```

### Admin Flow (9 steps)

Sama seperti karyawan, dengan tambahan:

```
Step 5a: Admin Dashboard Overview
  → Spotlight: chart & stats HRD
  → "Pantau kehadiran seluruh tim..."

Step 6a: Verifikasi Karyawan
  → Spotlight: "Verifikasi" di sidebar
  → "Setujui karyawan baru..."
```

### Perubahan dari dokumen asli

| Dokumen Asli | Diubah | Alasan |
|---|---|---|
| Step 2: Sidebar → Jelaskan semua | Step 2: Sidebar → Fokus navigasi utama | Informasi overload. Detail per item dijelaskan di step masing-masing |
| Step 4: Attendance Button | Dipindah setelah dashboard | Urutan natural: lihat ringkasan → absen |
| Step 5: History | Dipindah setelah absen | User harus absen dulu sebelum lihat riwayat |
| Step 6: Leave | Dipindah setelah riwayat | Riwayat lebih relevan setelah absen |
| Step 7: Profile | Profile di akhir | Profile sebagai "closing" natural |

---

## UX Flow

### Welcome Modal (Step 1)

**What users see:** Full-screen centered dialog dengan ilustrasi, logo, pesan
"Selamat datang di AbsenKu 👋" dan deskripsi singkat. Dua tombol: "Mulai Tur"
(primary) dan "Lewati" (ghost).

**Why they see it:** Membangun first impression positif dan menyiapkan user
untuk proses onboarding.

**What they do:** Klik "Mulai Tur" untuk memulai, atau "Lewati" untuk menutup.

**Exit:** Klik "Lewati" atau tekan ESC.

### Spotlight Steps (Step 2-7)

**What users see:** Overlay semi-transparan menutupi seluruh halaman kecuali
sidebar. Elemen target (spotlight) diterangi dengan "cutout" berbentuk
persegi panjang dengan sudut membulat. Tooltip card muncul di posisi optimal.

**Why they see it:** Fokus penuh pada satu elemen. Tidak ada distraksi.

**What they do:**
- Baca tooltip
- Klik "Next" untuk lanjut
- Klik "Kembali" untuk kembali
- Klik "Lewati" untuk keluar

**How they move:** Tooltip menghilang (fade out + scale), overlay menghilang,
spotlight berpindah ke elemen berikutnya dengan animasi smooth, tooltip baru
muncul (fade in + slide).

**Resume:** Tour akan menyesuaikan dengan halaman saat ini. Jika elemen target
tidak ada, tour menunggu atau memberikan petunjuk navigasi.

### Completion Modal (Step 8)

**What users see:** Sama seperti welcome modal tapi dengan pesan selamat dan
ilustrasi berbeda. Tombol "Buka Dashboard" (primary).

**Why they see it:** Memberikan rasa pencapaian dan transisi natural ke
penggunaan aplikasi.

**What they do:** Klik "Buka Dashboard" untuk masuk ke halaman utama.
