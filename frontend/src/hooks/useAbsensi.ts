import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { getAbsensi, getAbsensiPaginated, searchAbsensi, getAbsensiToday, checkIn, checkOut } from '@/api/absensi'
import type { AbsensiFilters } from '@/types'
import { useAuth } from './useAuth'

export function useAbsensiList(filters?: AbsensiFilters) {
  return useQuery({
    queryKey: ['absensi', filters],
    queryFn: () => getAbsensi(filters),
    staleTime: 15000,
  })
}

export function useAbsensiListPaginated(filters?: AbsensiFilters) {
  return useQuery({
    queryKey: ['absensi', 'paginated', filters],
    queryFn: () => getAbsensiPaginated(filters),
    staleTime: 15000,
  })
}

export function useSearchAbsensi(params: Record<string, string | number | string[] | undefined>) {
  return useQuery({
    queryKey: ['absensi', 'search', params],
    queryFn: () => searchAbsensi(params),
    staleTime: params?.q ? 10000 : 15000,
  })
}

export function useAbsensiToday() {
  const { user } = useAuth()
  return useQuery({
    queryKey: ['absensi', 'today', user?.id],
    queryFn: () => getAbsensiToday(user!.id),
    enabled: !!user,
  })
}

export function useCheckIn() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: (extra?: { photoUrl?: string }) => {
      if (!user) throw new Error('Anda harus login untuk absen')
      return checkIn({
        userId: user.id,
        tanggal: new Date().toISOString().split('T')[0],
        checkIn: new Date().toISOString(),
        photos: extra?.photoUrl ? [{ type: 'check_in', url: extra.photoUrl, capturedAt: new Date().toISOString() }] : [],
      })
    },
    onSuccess: () => {
      toast.success('Check-in berhasil')
      queryClient.invalidateQueries({ queryKey: ['absensi'] })
    },
  })
}

export function useCheckOut() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: { id: number; photoUrl?: string }) =>
      checkOut(data.id, {
        checkOut: new Date().toISOString(),
        photos: data.photoUrl ? [{ type: 'check_out', url: data.photoUrl, capturedAt: new Date().toISOString() }] : [],
      }),
    onSuccess: () => {
      toast.success('Check-out berhasil')
      queryClient.invalidateQueries({ queryKey: ['absensi'] })
    },
  })
}
