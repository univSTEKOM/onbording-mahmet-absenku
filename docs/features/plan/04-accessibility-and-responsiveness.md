# Product Tour — Accessibility & Responsiveness

## Accessibility

### Keyboard Navigation

| Key | Action |
|---|---|
| `Tab` | Pindah fokus ke tombol dalam tooltip (Prev → Next → Skip) |
| `Shift+Tab` | Mundur fokus |
| `Enter / Space` | Aktifkan tombol fokus |
| `Escape` | Skip/tutup tour |
| `ArrowLeft` | Prev step |
| `ArrowRight` | Next step |

### Screen Readers

- Overlay punya `role="dialog"` dan `aria-label="Panduan Aplikasi"`
- Tooltip description punya `aria-live="polite"`
- Setiap tombol punya `aria-label` deskriptif
- Progress diumumkan: "Langkah 3 dari 8: [judul step]"
- Spotlight element punya `aria-current="step"`

### Focus Management

- **Saat modal welcome/completion:** Focus trap di dalam modal
- **Saat spotlight step:** Focus trap di dalam tooltip
- **Saat tour selesai:** Kembalikan fokus ke trigger elemen (jika ada)
- **Saat skip:** Kembalikan fokus ke elemen yang terakhir aktif

### Contrast

- Teks: `text-foreground` / `text-muted-foreground` (mengikuti tema, sudah accessible)
- Overlay: cukup gelap sehingga kontras dengan tooltip/spotlight terjaga
- Focus ring: gunakan `ring-2 ring-primary` default shadcn

### ARIA Attributes

```html
<div role="dialog" aria-label="Panduan Aplikasi" aria-modal="true">
  <div role="region" aria-label="Tooltip panduan">
    <p aria-live="polite">Langkah 3 dari 8: Ringkasan Dashboard</p>
    <button aria-label="Langkah sebelumnya">Kembali</button>
    <button aria-label="Lanjut ke langkah berikutnya">Lanjut</button>
    <button aria-label="Lewati panduan">Lewati</button>
  </div>
</div>
```

---

## Responsiveness

### Desktop (>1024px)

- Tooltip diposisikan secara intelligent: menghindari overlap dengan spotlight
- Prioritas posisi: `right` → `left` → `bottom` → `top`
- Tooltip max-width: 360px

### Tablet (768-1024px)

- Tooltip max-width: 300px
- Spotlight padding: 6px
- Prioritas posisi: `bottom` → `top`

### Mobile (<768px)

- Tooltip: full width (`w-[calc(100vw-32px)]`), diposisikan di bawah spotlight
- Spotlight padding: 4px
- Sidebar: collapsed (hamburger menu)
- Prioritas posisi: `bottom`

### Collapsed Sidebar

**Tantangan:** Step yang menargetkan item di sidebar tidak terlihat saat
sidebar collapsed.

**Solusi:**
1. Deteksi state sidebar via `useSidebar()`
2. Jika sidebar collapsed, auto-expand saat tour aktif
3. Setelah tour selesai, kembalikan ke state semula

**Fallback:** Jika auto-expand tidak memungkinkan, tooltip menjelaskan:
"Klik ikon menu di pojok kiri atas untuk membuka navigasi."

### Small Screens / Scrollable Content

- Step dengan elemen di luar viewport:
  1. `scrollIntoView({ behavior: 'smooth', block: 'center' })`
  2. Tooltip muncul setelah scroll selesai (tunggu 300ms)
- Mobile: tooltip full width di bawah spotlight, tidak overlap

### Responsive Layout Changes

- `useElementTracker` menggunakan `ResizeObserver` untuk mendeteksi
  perubahan layout (sidebar toggle, window resize, dll)
- Spotlight dan tooltip otomatis mengikuti posisi baru
- Jika elemen menjadi hidden, tampilkan fallback message
