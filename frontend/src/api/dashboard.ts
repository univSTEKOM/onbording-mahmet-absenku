import api from './axios'

export interface RecentAbsensiItem {
  tanggal: string
  checkIn: string | null
  checkOut: string | null
  status: string | null
}

export interface HrdWeekChartItem {
  name: string
  hadir: number
  terlambat: number
  persen: number
}

export interface HrdWeekSummary {
  totalKaryawan: number
  hadirHariIni: number
  terlambatHariIni: number
  izinHariIni: number
  belumAbsen: number
  totalAbsensiBulanIni: number
  weekAvg: number
  bestDay: { name: string; persen: number } | null
}

export interface HrdWeekData {
  chart: HrdWeekChartItem[]
  summary: HrdWeekSummary
}

export async function getRecentAbsensi(userId: number): Promise<RecentAbsensiItem[]> {
  const res = await api.get('/api/dashboard/recent', { params: { userId } })
  return res.data.data
}

export async function getHrdWeek(): Promise<HrdWeekData> {
  const res = await api.get('/api/dashboard/hrd/week')
  return res.data
}
