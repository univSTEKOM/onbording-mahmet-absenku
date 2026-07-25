# Color System

## CSS Variables

Semua warna didefinisikan sebagai CSS variables di `frontend/src/index.css`. Menggunakan format **OKLCH** untuk gamut yang lebih luas.

### Base Colors

| Token | Light | Dark | Kegunaan |
|-------|-------|------|----------|
| `--background` | `oklch(0.983 0.002 289)` | `oklch(0 0 0)` | Latar halaman |
| `--foreground` | `oklch(0.188 0.013 249)` | `oklch(0.933 0.003 229)` | Teks utama |
| `--card` | `oklch(1 0 0)` | `oklch(0.210 0.008 275)` | Kartu, modal |
| `--card-foreground` | `oklch(0.188 0.013 249)` | `oklch(0.885 0 0)` | Teks di dalam kartu |
| `--popover` | `oklch(1 0 0)` | `oklch(0 0 0)` | Dropdown, popup |
| `--primary` | `oklch(0.546 0.208 264)` | `oklch(0.669 0.161 245)` | Tombol utama, link |
| `--primary-foreground` | `oklch(1 0 0)` | `oklch(1 0 0)` | Teks di tombol primary |
| `--secondary` | `oklch(0.546 0.208 264)` | `oklch(0.962 0.004 220)` | Aksen sekunder |
| `--muted` | `oklch(0.922 0.001 286)` | `oklch(0.209 0 0)` | Latar elemen non-aktif |
| `--muted-foreground` | `oklch(0.435 0.021 265)` | `oklch(0.564 0.008 248)` | Teks secondary |
| `--accent` | `oklch(0.939 0.017 251)` | `oklch(0.193 0.033 243)` | Hover, highlight |
| `--destructive` | `oklch(0.619 0.238 26)` | `oklch(0.619 0.238 26)` | Error, hapus |
| `--border` | `oklch(0.861 0.013 274)` | `oklch(0.267 0.005 248)` | Border elemen |
| `--input` | `oklch(0.861 0.013 274)` | `oklch(0.302 0.029 245)` | Border input |
| `--ring` | `oklch(0.232 0.016 254)` | `oklch(0.682 0.158 243)` | Focus ring |

### Sidebar Colors

| Token | Light | Dark | Kegunaan |
|-------|-------|------|----------|
| `--sidebar` | `oklch(1 0 0)` | `oklch(0.210 0.008 275)` | Latar sidebar |
| `--sidebar-foreground` | `oklch(0.188 0.013 249)` | `oklch(0.885 0 0)` | Teks sidebar |
| `--sidebar-primary` | `oklch(0.546 0.208 264)` | `oklch(0.682 0.158 243)` | Item aktif |
| `--sidebar-accent` | `oklch(0.939 0.017 251)` | `oklch(0.193 0.033 243)` | Hover item |
| `--sidebar-border` | `oklch(0.861 0.013 274)` | `oklch(0.380 0.022 241)` | Border sidebar |
| `--sidebar-ring` | `oklch(0.232 0.016 254)` | `oklch(0.682 0.158 243)` | Focus ring sidebar |

### Chart Colors

| Token | Light | Dark | Kegunaan |
|-------|-------|------|----------|
| `--chart-1` | `oklch(0.619 0.238 26)` | `oklch(0.638 0.208 29)` | Data series 1 (alfa) |
| `--chart-2` | `oklch(0.628 0.195 149)` | `oklch(0.682 0.158 243)` | Data series 2 (hadir) |
| `--chart-3` | `oklch(0.546 0.208 264)` | `oklch(0.682 0.158 243)` | Data series 3 (izin/terlambat) |
| `--chart-4` | `oklch(0.821 0.160 83)` | `oklch(0.821 0.160 83)` | Data series 4 |
| `--chart-5` | `oklch(0.559 0.181 304)` | `oklch(0.608 0.146 308)` | Data series 5 |
| `--chart-6` | `oklch(0.551 0.027 264)` | `oklch(0.551 0.027 264)` | Data series 6 (cuti) |

### Status Colors (Absensi)

| Status | Hex | CSS Variable | Tampilan |
|--------|-----|-------------|----------|
| Hadir | `#10B981` | `--color-status-hadir` | Hijau (badge, kalender) |
| Terlambat | `#F59E0B` | `--color-status-terlambat` | Kuning |
| Pulang Cepat | `#F97316` | `--color-status-pulang-cepat` | Oranye |
| Izin | `#3B82F6` | `--color-status-izin` | Biru |
| Sakit | `#8B5CF6` | `--color-status-sakit` | Ungu |
| Cuti | `#64748B` | `--color-status-cuti` | Abu-abu |
| Tidak Hadir (Alfa) | `#EF4444` | `--color-status-tidakHadir` | Merah |

### Tournament Overlay

| Token | Light | Dark | Kegunaan |
|-------|-------|------|----------|
| `--tour-overlay` | `rgba(0,0,0,0.5)` | `rgba(0,0,0,0.7)` | Latar belakang product tour |

---

## Tailwind Theme

Semua CSS variables di atas diikat ke Tailwind melalui `@theme inline {}` di `index.css`:

```css
@theme inline {
  --color-background: var(--background);
  --color-primary: var(--primary);
  --color-sidebar: var(--sidebar);
  --color-status-hadir: #10b981;
  /* ... dan seterusnya */
}
```

Sehingga bisa digunakan di komponen sebagai:

```tsx
<div className="bg-background text-foreground" />
<div className="bg-primary text-primary-foreground" />
<span className="text-status-hadir" />
<Badge className="bg-status-terlambat" />
```

---

## Radius

| Token | Value | Kegunaan |
|-------|-------|----------|
| `--radius` | `0.75rem` (12px) | Default |
| `--radius-sm` | `0.5rem` (8px) | Button kecil |
| `--radius-md` | `0.625rem` (10px) | Card sedang |
| `--radius-lg` | `0.75rem` (12px) | Card besar |
| `--radius-xl` | `1rem` (16px) | Modal, dialog |
