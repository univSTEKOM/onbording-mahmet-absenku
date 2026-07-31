import api from './axios'
import type { Pengajuan, PengajuanStatus, PengajuanFormData, PengajuanFilters } from '@/types'

export async function getPengajuan(filters?: PengajuanFilters): Promise<Pengajuan[]> {
  const res = await api.get('/pengajuan', { params: filters })
  return res.data.data ?? res.data
}

export async function createPengajuan(data: PengajuanFormData): Promise<Pengajuan> {
  const res = await api.post('/pengajuan', {
    ...data,
    status: 'pending',
    catatan: '',
    createdAt: new Date().toISOString(),
  })
  return res.data.data ?? res.data
}

export async function updatePengajuan(id: number, data: Partial<Pengajuan>): Promise<Pengajuan> {
  const res = await api.patch(`/pengajuan/${id}`, data)
  return res.data.data ?? res.data
}

export async function updatePengajuanStatus(id: number, status: PengajuanStatus, catatan?: string): Promise<Pengajuan> {
  const res = await api.patch(`/pengajuan/${id}`, { status, catatan })
  return res.data.data ?? res.data
}

export async function deletePengajuan(id: number): Promise<void> {
  await api.delete(`/pengajuan/${id}`)
}
