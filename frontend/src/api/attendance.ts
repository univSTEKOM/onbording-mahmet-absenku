import api from './axios'
import type { AttendanceCategory } from '@/types'

export async function getAttendanceCategories(): Promise<AttendanceCategory[]> {
  const res = await api.get('/api/attendance-categories')
  return res.data
}
