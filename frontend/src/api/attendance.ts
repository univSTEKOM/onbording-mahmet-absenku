import api from './axios'
import type { AttendanceCategory } from '@/types'

let cachedCategories: AttendanceCategory[] | null = null

export async function getAttendanceCategories(): Promise<AttendanceCategory[]> {
  if (cachedCategories) return cachedCategories
  const res = await api.get('/api/attendance-categories')
  cachedCategories = res.data
  return res.data
}

export function clearCategoryCache() {
  cachedCategories = null
}
