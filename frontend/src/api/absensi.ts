import api from './axios'
import type { Absensi, AbsensiFilters, CheckInData, CheckOutData, PaginatedResult } from '@/types'

export async function getAbsensi(filters?: AbsensiFilters): Promise<Absensi[]> {
  const res = await api.get('/absensi', { params: filters })
  return res.data
}

export async function getAbsensiPaginated(filters?: AbsensiFilters): Promise<PaginatedResult<Absensi>> {
  const res = await api.get('/absensi', { params: filters })
  const total = parseInt(res.headers['x-total-count'] || '0', 10)
  const limit = filters?._limit || 10
  return {
    data: res.data,
    total,
    page: filters?._page || 1,
    totalPages: Math.ceil(total / limit),
  }
}

export async function getAbsensiToday(userId: string): Promise<Absensi | null> {
  const today = new Date().toISOString().split('T')[0]
  const res = await api.get('/absensi', { params: { userId, tanggal: today } })
  return res.data[0] || null
}

export async function checkIn(data: CheckInData): Promise<Absensi> {
  const body: Record<string, unknown> = {
    userId: data.userId,
    tanggal: data.tanggal,
    checkIn: data.checkIn,
    status: 'hadir',
    faceVerified: false,
    photos: data.photos || [],
    keterangan: '',
    createdAt: new Date().toISOString(),
  }
  const res = await api.post('/absensi', body)
  return res.data
}

export async function checkOut(id: number, data?: CheckOutData): Promise<Absensi> {
  const body: Record<string, unknown> = { checkOut: new Date().toISOString() }
  if (data?.photos?.length) body.photos = data.photos
  const res = await api.patch(`/absensi/${id}`, body)
  return res.data
}
