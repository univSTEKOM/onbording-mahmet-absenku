# Product Tour — Architecture & Components

## Information Architecture

### Tour Structure

```
Tour (root)
├── WelcomeStep (modal, no spotlight)
├── TourStep[] (spotlight + tooltip)
│   ├── sidebar-navigation
│   ├── dashboard-summary
│   ├── attendance-button
│   ├── history-nav
│   ├── leave-nav
│   └── profile-nav
└── CompletionStep (modal, no spotlight)
```

### Step Hierarchy

```typescript
interface TourStep {
  id: string
  type: 'spotlight' | 'welcome' | 'completion'
  targetSelector?: string
  title: string
  description: string
  icon?: LucideIcon
  position?: 'top' | 'bottom' | 'left' | 'right' | 'auto'
  beforeStep?: () => void
  requiredRole?: 'admin' | 'karyawan'
}
```

### Role-Based Steps

| Step | Karyawan | Admin |
|---|---|---|
| 1. Welcome | ✅ | ✅ |
| 2. Sidebar | ✅ | ✅ |
| 3. Dashboard | ✅ | ✅ |
| 4. Absensi | ✅ | ✅ |
| 5. Riwayat | ✅ | ✅ |
| 5a. Admin Dashboard | ❌ | ✅ |
| 6. Pengajuan | ✅ | ✅ |
| 6a. Verifikasi | ❌ | ✅ |
| 7. Profile | ✅ | ✅ |
| 8. Selesai | ✅ | ✅ |

### Progress Management

- Progress disimpan di `localStorage` setelah setiap step selesai
- Key: `absenku-tour-completed` (boolean)
- Jika user skip, `absenku-tour-completed = true`
- Tour tidak muncul lagi jika `absenku-tour-completed = true`

---

## Component Architecture

### Folder Structure

```
src/components/tour/
├── TourProvider.tsx
├── TourStepRegistry.ts
├── TourSpotlight.tsx
├── TourTooltip.tsx
├── TourNavigation.tsx
├── TourProgress.tsx
├── TourModal.tsx
├── hooks/
│   ├── useTour.ts
│   ├── useSpotlight.ts
│   └── useElementTracker.ts
└── utils/
    ├── tour-storage.ts
    └── tour-helpers.ts
```

### Component Responsibilities

#### TourProvider.tsx
- **Role:** Context provider — melingkupi aplikasi di level `_authenticated.tsx`
- **State:** `currentStep`, `isActive`, `isCompleted`, `role`
- **Methods:** `start`, `next`, `prev`, `skip`, `complete`, `reset`
- **Integrasi:** Dirender di dalam `AuthenticatedLayoutContent`, di atas `SidebarProvider`
- **Edge cases:** Route change, element not found, role switching

#### TourStepRegistry.ts
- **Role:** Mendefinisikan semua step beserta metadata-nya
- **Structure:** Array of `TourStep` objects, difilter berdasarkan role
- **Extensibility:** Tinggal tambah objek baru untuk step baru

#### TourSpotlight.tsx
- **Role:** Render overlay SVG dengan cutout
- **Props:** `targetRect` (DOMRect), `padding` (number), `borderRadius`
- **Implementation:** SVG overlay dengan `mask` untuk membuat lubang spotlight
- **Animation:** `position` & `size` animasi via CSS transition (250ms ease)

**Mengapa SVG mask?**
- Performa lebih baik daripada multiple div/box-shadow
- Sudut rounded lebih halus
- Tidak perlu kalkulasi complex untuk border-radius negatif
- Background overlay bisa di-set sebagai CSS variable (konsisten dengan tema)

#### TourTooltip.tsx
- **Role:** Tooltip card di samping spotlight
- **Components reused:** `Card`, `CardContent` dari shadcn/ui
- **Children:** Icon, Title, Description, `TourProgress`, `TourNavigation`
- **Positioning:** Bergerak mengikuti posisi spotlight, tidak overlap
- **Animation:** Fade + slide (200ms ease-out)

#### TourNavigation.tsx
- **Props:** `showPrev`, `showSkip`, `onPrev`, `onNext`, `onSkip`, `isLastStep`
- **Buttons:**
  - "Kembali" (ghost, small)
  - "Next" / "Selesai" (primary)
  - "Lewati" (ghost, small)
- **Accessibility:** Semua button punya `aria-label` deskriptif

#### TourProgress.tsx
- **Role:** Menampilkan "Langkah 3 dari 8"
- **Components reused:** `Badge` atau teks biasa, opsional `Progress` bar
- **Posisi:** Di bagian bawah tooltip, sebelum navigasi

#### TourModal.tsx
- **Role:** Welcome & Completion step
- **Components reused:** `Dialog`, `DialogContent`, `DialogHeader`, `DialogTitle`,
  `DialogDescription`, `Button`
- **Welcome:** Ilustrasi, logo, pesan, [Mulai Tur] [Lewati]
- **Completion:** Ilustrasi berbeda, pesan selamat, [Buka Dashboard]

#### useTour.ts
- **Returns:**
  ```typescript
  {
    currentStep: TourStep
    isActive: boolean
    start: () => void
    next: () => void
    prev: () => void
    skip: () => void
    complete: () => void
    total: number
    isFirst: boolean
    isLast: boolean
  }
  ```
- **Integration:** Digunakan oleh komponen untuk trigger state

#### useSpotlight.ts
- **Input:** CSS selector string
- **Output:** `DOMRect` yang diobservasi
- **Fallback:** Jika element not found, retry 3x dengan delay 500ms, lalu skip step
- **Performance:** Observer hanya aktif saat tour berjalan, cleanup on unmount

#### useElementTracker.ts
- **Role:** Melacak posisi elemen target secara real-time
- **Why:** Elemen bisa berubah posisi karena sidebar collapse/expand,
  responsive layout, atau konten dinamis
- **Implementation:** `ResizeObserver` pada target + parent container

---

## State Management

### Local State (React Context)

```typescript
interface TourState {
  isActive: boolean
  currentIndex: number
  completed: boolean
  role: 'admin' | 'karyawan'
}
```

### Persistence (localStorage)

```typescript
const STORAGE_KEY = 'absenku-tour'

interface TourStorage {
  completed: boolean
  skippedAt?: number
  completedAt?: number
}
```

### State Flow

```
App mount
  → Cek localStorage (absenku-tour)
  → Jika completed === true, jangan mulai
  → Jika pertama login (detect via user.createdAt), auto-start
  → Jika manual restart dari menu, start

Tour berjalan
  → Setiap next/prev update currentIndex
  → Setiap skip → set completed = true, persist

Tour selesai
  → set completed = true, persist completedAt

Reset
  → Hapus localStorage key
```

### Future Backend Sync

- Tambah field `tourCompleted` di tabel users
- Sinkronisasi via PATCH `/api/users/:id` saat tour selesai
- Admin bisa melihat siapa yang belum menyelesaikan onboarding
