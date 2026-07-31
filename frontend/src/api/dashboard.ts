import api from './axios'

export interface RecentAbsensiItem {
  tanggal: string
  checkIn: string | null
  checkOut: string | null
  status: string | null
}

export interface AdminWeekChartItem {
  name: string
  hadir: number
  pulangCepat: number
  terlambat: number
  izin: number
  sakit: number
  cuti: number
  tidakHadir: number
  present: number
  absentPermit: number
  absentUnpermit: number
  persen: number
}

export interface AdminWeekSummary {
  totalKaryawan: number
  hadirHariIni: number
  terlambatHariIni: number
  izinHariIni: number
  alfaHariIni: number
  belumAbsen: number
  totalAbsensiBulanIni: number
  weekAvg: number
  bestDay: { name: string; persen: number } | null
  presentMonth: number
  permitMonth: number
  unpermitMonth: number
}

export interface AdminWeekData {
  chart: AdminWeekChartItem[]
  summary: AdminWeekSummary
}

export async function getRecentAbsensi(userId: string): Promise<RecentAbsensiItem[]> {
  const res = await api.get('/api/dashboard/recent', { params: { userId } })
  return res.data.data
}

export async function getAdminWeek(): Promise<AdminWeekData> {
  const res = await api.get('/api/dashboard/admin/week')
  return { chart: res.data.chart, summary: res.data.summary }
}

export interface DayAttendanceData {
  tanggal: string
  hadir: number
  pulangCepat: number
  terlambat: number
  checkInOnly: number
  izin: number
  sakit: number
  cuti: number
  tidakHadir: number
  present?: number
  absentPermit?: number
  absentUnpermit?: number
}

export interface MonthAttendanceData {
  data: DayAttendanceData[]
  totalKaryawan: number
}

export async function getMonthAttendance(tahun: number, bulan: number, userId?: string): Promise<MonthAttendanceData> {
  const res = await api.get('/api/dashboard/month', { params: { tahun, bulan, ...(userId ? { userId } : {}) } })
  return { data: res.data.data, totalKaryawan: res.data.totalKaryawan }
}
