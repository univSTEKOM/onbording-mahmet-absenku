# API Reference untuk Frontend-v2

Dokumentasi ini berisi panduan implementasi API di frontend-v2. Referensi endpoint lengkap ada di `docs/mock-api/endpoints.md`.

## Setup Axios

```ts
// src/lib/axios.ts
import axios from 'axios'

export const api = axios.create({
  baseURL: 'http://localhost:3001',
  withCredentials: true,
})
```

## Setup TanStack Query

```ts
// src/lib/query-client.ts
import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 0, refetchOnWindowFocus: true },
  },
})
```

## Tipe Data

```ts
// src/types/index.ts

export interface User {
  id: string
  email: string
  nama: string
  jabatan: string
  role: 'admin' | 'karyawan'
  status: 'pending' | 'approved' | 'rejected'
  rejectionNotes: RejectionNote[]
  foto: string
  phone: string
  alamat: string
  createdAt: string
}

export interface RejectionNote {
  note: string
  createdAt: string
}

export interface Absensi {
  id: number
  userId: string
  tanggal: string        // YYYY-MM-DD
  checkIn: string | null // ISO datetime
  checkOut: string | null
  status: AbsensiStatus
  faceVerified: boolean
  photos: string[]
  keterangan: string
  createdAt: string
}

export type AbsensiStatus =
  | 'hadir' | 'terlambat' | 'pulang_cepat'
  | 'izin' | 'sakit' | 'cuti' | 'tanpa_keterangan'

export interface Pengajuan {
  id: number
  userId: string
  jenis: 'cuti' | 'izin' | 'sakit'
  tanggalMulai: string   // YYYY-MM-DD
  tanggalSelesai: string
  alasan: string
  status: 'pending' | 'approved' | 'rejected'
  catatan: string
  createdAt: string
}
```

## Auth Hooks

```ts
// src/hooks/useAuth.ts
import { createAuthClient } from 'better-auth/react'

const authClient = createAuthClient({
  baseURL: 'http://localhost:3001',
  fetchOptions: { credentials: 'include' },
})

export function useAuth() {
  const { data: session, isPending, refetch } = authClient.useSession()

  const login = async (email: string, password: string) => {
    const { data, error } = await authClient.signIn.email({ email, password })
    if (error) throw error
    await refetch()
    return data
  }

  const register = async (data: RegisterInput) => {
    return api.post('/api/register', data)
  }

  const logout = async () => {
    await authClient.signOut()
    navigate({ to: '/login' })
  }

  return {
    user: session?.user ?? null,
    isLoading: isPending,
    login, register, logout,
    isAdmin: session?.user?.role === 'admin',
  }
}
```

## TanStack Query Hooks

### Users

```ts
// src/hooks/useUsers.ts
export function useUser(id: string) {
  return useQuery({
    queryKey: ['user', id],
    queryFn: () => api.get(`/users/${id}`).then(r => r.data),
  })
}

export function useUpdateUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<User> }) =>
      api.patch(`/users/${id}`, data),
    onSuccess: (_, { id }) => queryClient.invalidateQueries({ queryKey: ['user', id] }),
  })
}

// Admin only
export function useAllUsers() {
  return useQuery({
    queryKey: ['users', 'all'],
    queryFn: () => api.get('/api/users/all').then(r => r.data),
  })
}

export function usePendingUsers() {
  return useQuery({
    queryKey: ['users', 'pending'],
    queryFn: () => api.get('/api/users/pending').then(r => r.data),
  })
}

export function useUpdateUserStatus() {
  return useMutation({
    mutationFn: ({ id, status, note }: { id: string; status: string; note?: string }) =>
      api.patch(`/api/users/${id}/status`, { status, note }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })
}

export function useDeleteUser() {
  return useMutation({
    mutationFn: (id: string) => api.delete(`/api/users/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
  })
}
```

### Absensi

```ts
// src/hooks/useAbsensi.ts
export function useAbsensiList(userId?: string) {
  return useQuery({
    queryKey: ['absensi', userId],
    queryFn: () => api.get('/absensi', { params: userId ? { userId } : {} }).then(r => r.data),
  })
}

export function useCheckIn() {
  return useMutation({
    mutationFn: (data: { userId: string; tanggal: string; checkIn: string }) =>
      api.post('/absensi', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['absensi'] }),
  })
}

export function useCheckOut() {
  return useMutation({
    mutationFn: ({ id, checkOut }: { id: number; checkOut: string }) =>
      api.patch(`/absensi/${id}`, { checkOut }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['absensi'] }),
  })
}
```

### Pengajuan

```ts
// src/hooks/usePengajuan.ts
export function usePengajuanList(userId?: string) {
  return useQuery({
    queryKey: ['pengajuan', userId],
    queryFn: () => api.get('/pengajuan', { params: userId ? { userId } : {} }).then(r => r.data),
  })
}

export function useCreatePengajuan() {
  return useMutation({
    mutationFn: (data: CreatePengajuanInput) => api.post('/pengajuan', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['pengajuan'] }),
  })
}

export function useUpdatePengajuanStatus() {
  return useMutation({
    mutationFn: ({ id, status, catatan }: { id: number; status: string; catatan?: string }) =>
      api.patch(`/pengajuan/${id}`, { status, catatan }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['pengajuan'] }),
  })
}
```

### Dashboard

```ts
// src/hooks/useDashboard.ts
export function useRecentAbsensi(userId?: string) {
  return useQuery({
    queryKey: ['dashboard', 'recent', userId],
    queryFn: () => api.get('/api/dashboard/recent', { params: { userId } }).then(r => r.data),
  })
}

export function useHrdDashboard() {
  return useQuery({
    queryKey: ['dashboard', 'hrd'],
    queryFn: () => api.get('/api/dashboard/hrd/week').then(r => r.data),
  })
}
```

## Route Guards Pattern

Semua guard menggunakan component-level check (bukan beforeLoad) agar bisa pakai `useAuth()` hook langsung tanpa context injection.

```tsx
// src/routes/_authenticated.tsx
export const Route = createFileRoute('/_authenticated')({
  component: AuthenticatedLayout,
})

function AuthenticatedLayout() {
  const { user, isLoading } = useAuth()
  if (isLoading) return null
  if (!user) return <Navigate to="/login" replace />
  if (user.status === 'pending' || user.status === 'rejected')
    return <Navigate to="/status" replace />
  return <Outlet />
}
```

## Error Handling

```ts
// Tambahkan di main.tsx atau queryClient setup
const queryClient = new QueryClient({
  defaultOptions: {
    mutations: {
      onError: (error) => {
        const msg = (error as any)?.response?.data?.message
          || (error instanceof Error ? error.message : 'Terjadi kesalahan')
        toast.error(msg)
      },
    },
  },
})
```

## Best Practices

1. **Import path**: Gunakan `@/` alias untuk semua import dari `src/`
2. **File naming**: Gunakan kebab-case untuk file, PascalCase untuk komponen
3. **API calls**: Semua via TanStack Query hooks, jangan panggil axios langsung di komponen
4. **Error handling**: Toast notification untuk semua error mutation
5. **Type safety**: Manfaatkan tipe dari TanStack Router (params, search params)
6. **Loading state**: Gunakan `isPending` dari TanStack Query untuk skeleton/spinner
7. **Empty state**: Tampilkan pesan "Belum ada data" saat array kosong
8. **Code splitting**: TanStack Router handle otomatis, letakkan page di route files
