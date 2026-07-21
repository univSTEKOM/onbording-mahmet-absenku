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
  _page?: number
  _limit?: number
}

export interface PaginatedResult<T> {
  data: T[]
  total: number
  page: number
  totalPages: number
}

export async function getAbsensi(filters?: AbsensiFilters): Promise<Absensi[]> {
  const res = await api.get('/absensi', { params: filters })
  return res.data
}

export async function getAllAbsensiForExport(
  filters?: Omit<AbsensiFilters, '_page' | '_limit'>
): Promise<Absensi[]> {
  const res = await api.get('/absensi', {
    params: { ...filters, _sort: 'tanggal', _order: 'desc' },
  })
  return res.data
}

export async function getAbsensiPaginated(
  filters?: AbsensiFilters
): Promise<PaginatedResult<Absensi>> {
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
