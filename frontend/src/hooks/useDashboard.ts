import { useQuery } from '@tanstack/react-query'
import { getRecentAbsensi, getAdminWeek, getMonthAttendance } from '@/api/dashboard'
import { useAuth } from './useAuth'

export function useRecentAbsensi() {
  const { user } = useAuth()
  return useQuery({
    queryKey: ['dashboard', 'recent', user?.id],
    queryFn: () => getRecentAbsensi(user!.id),
    enabled: !!user,
  })
}

export function useAdminWeek() {
  return useQuery({
    queryKey: ['dashboard', 'admin', 'week'],
    queryFn: getAdminWeek,
  })
}

export function useMonthAttendance(tahun: number, bulan: number, userId?: string) {
  return useQuery({
    queryKey: ['dashboard', 'month', tahun, bulan, userId],
    queryFn: () => getMonthAttendance(tahun, bulan, userId),
  })
}
