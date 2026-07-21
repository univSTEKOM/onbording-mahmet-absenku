import api from './axios'
import type { Absensi } from '@/types'

export interface AbsensiFilters {
  userId?: number
  tanggal?: string
  tanggal_gte?: string
  tanggal_lte?: string
  status?: string
  _sort?: string
  _order?: string
}

export async function getAbsensi(filters?: AbsensiFilters): Promise<Absensi[]> {
  const res = await api.get('/absensi', { params: filters })
  return res.data
}

export async function getAbsensiToday(userId: number): Promise<Absensi | null> {
  const today = new Date().toISOString().split('T')[0]
  const res = await api.get('/absensi', {
    params: { userId, tanggal: today },
  })
  return res.data[0] || null
}

export async function checkIn(data: {
  userId: number
  tanggal: string
  checkIn: string
}): Promise<Absensi> {
  const res = await api.post('/absensi', {
    ...data,
    status: 'hadir',
    faceVerified: false,
    keterangan: '',
    createdAt: new Date().toISOString(),
  })
  return res.data
}

export async function checkOut(id: number): Promise<Absensi> {
  const res = await api.patch(`/absensi/${id}`, {
    checkOut: new Date().toISOString(),
  })
  return res.data
}
