import { useQuery } from '@tanstack/react-query'
import { getAttendanceCategories, clearCategoryCache } from '@/api/attendance'

export function useAttendanceCategories() {
  return useQuery({
    queryKey: ['attendance-categories'],
    queryFn: getAttendanceCategories,
    staleTime: 60000,
  })
}

export { clearCategoryCache }
