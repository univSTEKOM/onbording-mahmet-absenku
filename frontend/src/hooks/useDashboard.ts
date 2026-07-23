import { useQuery } from '@tanstack/react-query'
import { getRecentAbsensi, getHrdWeek, getMonthAttendance } from '@/api/dashboard'
import { useAuth } from './useAuth'

export function useRecentAbsensi() {
  const { user } = useAuth()
  return useQuery({
    queryKey: ['dashboard', 'recent', user?.id],
    queryFn: () => getRecentAbsensi(user!.id),
    enabled: !!user,
  })
}

export function useHrdWeek() {
  return useQuery({
    queryKey: ['dashboard', 'hrd', 'week'],
    queryFn: getHrdWeek,
  })
}

export function useMonthAttendance(tahun: number, bulan: number, userId?: string) {
  return useQuery({
    queryKey: ['dashboard', 'month', tahun, bulan, userId],
    queryFn: () => getMonthAttendance(tahun, bulan, userId),
  })
}
