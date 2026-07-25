import { useQuery } from '@tanstack/react-query'
import { getAttendanceCategories } from '@/api/attendance'

export function useAttendanceCategories() {
  return useQuery({
    queryKey: ['attendance-categories'],
    queryFn: getAttendanceCategories,
    staleTime: 60000,
  })
}
