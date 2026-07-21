import { useQuery } from '@tanstack/react-query'
import { getRecentAbsensi, getHrdWeek } from '@/api/dashboard'
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
