# Product Tour — Edge Cases, Performance & Implementation

## Edge Cases

### Missing Element

- **Problem:** Elemen target belum di-render (lazy loading, conditional rendering)
- **Solution:** `useElementTracker` melakukan retry 3x dengan interval 500ms
- **Fallback:** Jika tidak ditemukan, skip step dan lanjut ke step berikutnya
- **User feedback:** Tooltip menampilkan "Memuat..." selama pencarian

### Hidden Element (CSS display:none / visibility:hidden)

- **Problem:** Sidebar item tersembunyi karena role mismatch
- **Solution:** Sebelum step dimulai, `beforeStep()` memastikan elemen terlihat
- **Example:** Step 5 (Riwayat) — pastikan sidebar tidak collapsed

### Conditional Rendering

- **Problem:** "Absen Sekarang" button hanya muncul jika user belum absen hari ini
- **Solution:** Step 4 mendeteksi apakah button ada. Jika tidak (user sudah absen),
  step menjelaskan: "Kamu sudah absen hari ini. Besok, gunakan tombol yang sama
  untuk merekam kehadiran."

### Lazy Loading Components

- **Problem:** Dashboard page mungkin belum di-mount saat tour mencapai step 3
- **Solution:** `beforeStep()` memastikan halaman yang tepat sudah di-mount
  sebelum spotlight muncul

### Route Changes

- **Problem:** Beberapa step (admin) perlu navigasi ke halaman berbeda
- **Solution:** Step dengan `beforeStep()` melakukan:
  1. Navigasi ke route yang benar menggunakan `router.navigate()`
  2. Tunggu sampai komponen ter-mount
  3. Baru cari elemen target

**Catatan:** Untuk tour karyawan standar, semua step berada di halaman yang
sama (dashboard) — tidak perlu route change. Ini bagus untuk UX dan performance.

### Slow Rendering

- Fallback: Timeout 5 detik per pencarian elemen
- Jika timeout, log warning dan skip step

### Network Delays

- Tidak relevan — tour sepenuhnya client-side

---

## Error Recovery

### Element Not Found

```
1. Cari selektor
2. Tunggu 500ms
3. Retry (max 3x)
4. Jika masih gagal:
   a. Log error (console.warn) untuk debugging
   b. Lanjut ke step berikutnya
   c. User tidak perlu tahu — transisi mulus
```

### Route Navigation Failure

```
1. beforeStep() trigger navigate
2. Tunggu route change (via TanStack Router router.state)
3. Timeout 5 detik
4. Jika gagal: log error, skip step
```

### Runtime Error

- Try-catch di setiap handler step
- Jika error: reset tour, persist sebagai "tidak selesai", log error
- User diarahkan ke halaman sebelumnya tanpa notifikasi error

---

## Performance

### Minimize Re-render

- TourState di-context, hanya komponen yang consume `useTour()` yang re-render
- Spotlight dan Tooltip adalah komponen terpisah, hanya muncul saat tour aktif
- Gunakan `useMemo` untuk step definitions (hitung sekali)

### Minimize Layout Shifts

- Spotlight menggunakan SVG overlay (`position: fixed`) — tidak mempengaruhi flow
- Tooltip menggunakan `position: fixed` — tidak mempengaruhi layout
- Overlay menggunakan `position: fixed` — tidak mempengaruhi scroll

### Minimize DOM Observation

- `ResizeObserver` dan `MutationObserver` hanya aktif saat `isActive === true`
- Cleanup observers di `useEffect` cleanup
- Batasi observasi ke elemen target saja, bukan seluruh dokumen

### Animation Cost

- Hanya CSS transitions/animations — no JS-driven animation
  (kecuali spotlight SVG mask)
- SVG mask transition via CSS — GPU accelerated
- Debounce resize handler (100ms)

### Memory

- Tour components unmount saat `isActive === false`
- Zero memory footprint saat tidak aktif

---

## Developer Experience

### Naming Conventions

- **Components:** PascalCase, `Tour` prefix
- **Hooks:** camelCase, `use` prefix
- **Files:** kebab-case

### Integration Points

- `TourProvider` menyelubungi `AuthenticatedLayoutContent` di `_authenticated.tsx`
- Tour dimulai otomatis saat user pertama login (detect via `user.createdAt`)
- Atau manual dari menu settings/help (future feature)

### Future Extensibility

- `TourStepRegistry` adalah array — tinggal push step baru
- Untuk "What's New" tour, cukup definisikan array step berbeda
- Untuk admin-specific tours, filter steps berdasarkan role
- Step bisa memiliki `condition: () => boolean` untuk conditional show/hide

---

## Future Features

### Phase 2 (Post-MVP)

1. **Interactive Tasks** — "Coba absen sekarang" dengan simulasi
2. **Contextual Tips** — Tooltip kecil di elemen tertentu (non-intrusive)
3. **Feature Discovery** — Sorot fitur baru setelah update
4. **What's New Modal** — Setelah major update, tampilkan perubahan

### Phase 3

5. **Admin-specific Tours** — Onboarding untuk admin
6. **Role-based Step Variations** — Step berbeda untuk role berbeda
7. **Help Center Integration** — Link ke dokumentasi di setiap step
8. **Search-based Tours** — Ketik "how to..." di search, muncul tour spesifik

### Phase 4

9. **Achievements** — Badge "Onboarding Complete"
10. **Analytics** — Track tour completion, drop-off points, step duration
11. **A/B Testing** — Coba berbagai copy/flow untuk optimasi completion rate

---

## Final Recommendations

### What Should Stay

- **Spotlight concept** — Best practice untuk product tour
- **8-step structure** — Cukup pendek, tidak overwhelming
- **Skip + ESC support** — User autonomy
- **localStorage persistence** — Sederhana, efektif
- **shadcn/ui components** — Konsisten dengan design system

### What Should Change

- **Step order** — Dashboard → Absensi → Riwayat → Pengajuan
  (bukan Sidebar → Dashboard → History)
- **Copywriting** — Bahasa Indonesia, lebih personal dan actionable
- **Tidak perlu ilustrasi kompleks** — Cukup icon Lucide + tipografi bersih
- **Auto-expand sidebar** — Saat tour aktif, sidebar harus visible

### Potential Risks

| Risk | Mitigation |
|---|---|
| Sidebar collapsed → step element tidak visible | Auto-expand via `useSidebar().open()` |
| Elemen belum di-mount (lazy) | Retry + timeout |
| User refresh di tengah tour | `currentIndex` perlu di-persist (opsional) |
| Responsive layout → posisi spotlight berubah | `ResizeObserver` pada target |
| Performance overhead observers | Hanya aktif saat `isActive === true` |

### Implementation Priority

1. **TourProvider + useTour** — Foundation (state management)
2. **TourSpotlight** — Overlay + SVG mask
3. **TourTooltip + TourNavigation** — Tooltip card
4. **TourStepRegistry** — Step definitions
5. **TourModal** — Welcome & Completion
6. **useElementTracker + useSpotlight** — Element observation
7. **Integration** — Hubungkan ke `_authenticated.tsx`
8. **Persistence** — localStorage
9. **Animations & Polish**
10. **Testing** — Keyboard, screen reader, responsive, edge cases

### Complexity: Medium-High

### Estimated Implementation Order

| Urutan | Component | Complexity | Dependencies |
|---|---|---|---|
| 1 | `tour-helpers.ts` + `tour-storage.ts` | Low | None |
| 2 | `useTour.ts` + `TourProvider.tsx` | Medium | 1 |
| 3 | `TourSpotlight.tsx` + `useSpotlight.ts` | High | 2 |
| 4 | `useElementTracker.ts` | Medium | 3 |
| 5 | `TourTooltip.tsx` + `TourNavigation.tsx` + `TourProgress.tsx` | Medium | 2 |
| 6 | `TourModal.tsx` | Low | 2 |
| 7 | `TourStepRegistry.ts` | Low | 2, 5, 6 |
| 8 | Integration ke `_authenticated.tsx` | Medium | 3-7 |
| 9 | Animasi + Polish | Medium | 8 |
| 10 | Accessibility pass | Low | 9 |
