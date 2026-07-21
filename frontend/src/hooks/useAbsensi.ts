import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  getAbsensi,
  getAbsensiToday,
  checkIn,
  checkOut,
  type AbsensiFilters,
} from '@/api/absensi'
import { useAuth } from './useAuth'

export function useAbsensiList(filters?: AbsensiFilters) {
  return useQuery({
    queryKey: ['absensi', filters],
    queryFn: () => getAbsensi(filters),
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
    mutationFn: () =>
      checkIn({
        userId: user!.id,
        tanggal: new Date().toISOString().split('T')[0],
        checkIn: new Date().toISOString(),
      }),
    onSuccess: () => {
      toast.success('Check-in berhasil')
      queryClient.invalidateQueries({ queryKey: ['absensi'] })
    },
  })
}

export function useCheckOut() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => checkOut(id),
    onSuccess: () => {
      toast.success('Check-out berhasil')
      queryClient.invalidateQueries({ queryKey: ['absensi'] })
    },
  })
}
