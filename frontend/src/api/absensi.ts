import api from './axios'
import type { Absensi, AbsensiFilters, CheckInData, CheckOutData, PaginatedResult } from '@/types'

export async function getAbsensi(filters?: AbsensiFilters): Promise<Absensi[]> {
  const res = await api.get('/absensi', { params: filters })
  return res.data.data ?? res.data
}

export async function getAbsensiPaginated(filters?: AbsensiFilters): Promise<PaginatedResult<Absensi>> {
  const res = await api.get('/absensi', { params: filters })
  const body = res.data
  if (body.meta) {
    return { data: body.data, total: body.meta.total, page: body.meta.page, totalPages: body.meta.totalPages }
  }
  /* Fallback: baca dari header (mock-api compat) */
  const total = parseInt(res.headers['x-total-count'] || '0', 10)
  const limit = filters?._limit || 10
  return { data: body.data ?? body, total, page: filters?._page || 1, totalPages: Math.ceil(total / limit) }
}

export async function searchAbsensi(params: Record<string, string | number | string[] | undefined>): Promise<PaginatedResult<Absensi>> {
  const res = await api.get('/api/absensi/search', { params })
  const body = res.data
  if (body.meta) {
    return { data: body.data, total: body.meta.total, page: body.meta.page, totalPages: body.meta.totalPages }
  }
  const total = parseInt(res.headers['x-total-count'] || '0', 10)
  const limit = Number(params._limit) || 15
  return { data: body.data ?? body, total, page: Number(params._page) || 1, totalPages: Math.ceil(total / limit) }
}

export async function getAbsensiToday(userId: string): Promise<Absensi | null> {
  const today = new Date().toISOString().split('T')[0]
  const res = await api.get('/absensi', { params: { userId, tanggal: today } })
  const list = res.data.data ?? res.data
  return list[0] || null
}

export async function checkIn(data: CheckInData): Promise<Absensi> {
  const body: Record<string, unknown> = {
    userId: data.userId,
    tanggal: data.tanggal,
    checkIn: data.checkIn,
    mainCategory: 'physical_present',
    subCategory: 'physical_standard',
    faceVerified: false,
    photos: data.photos || [],
    keterangan: '',
    createdAt: new Date().toISOString(),
  }
  const res = await api.post('/absensi', body)
  return res.data.data ?? res.data
}

export async function checkOut(id: number, data?: CheckOutData): Promise<Absensi> {
  const existing = await api.get(`/absensi/${id}`)
  const existingData = existing.data.data ?? existing.data
  const currentPhotos = existingData?.photos || []
  const photos = data?.photos?.length ? [...currentPhotos, ...data.photos] : currentPhotos
  const res = await api.patch(`/absensi/${id}`, {
    checkOut: data?.checkOut || new Date().toISOString(),
    photos,
  })
  return res.data.data ?? res.data
}
