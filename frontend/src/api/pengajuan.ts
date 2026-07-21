import api from './axios'
import type { Pengajuan, PengajuanStatus } from '@/types'

export interface PengajuanFormData {
  userId: number
  jenis: string
  tanggalMulai: string
  tanggalSelesai: string
  alasan: string
}

export async function getPengajuan(userId?: number): Promise<Pengajuan[]> {
  const params = userId ? { userId } : {}
  const res = await api.get('/pengajuan', { params })
  return res.data
}

export async function createPengajuan(data: PengajuanFormData): Promise<Pengajuan> {
  const res = await api.post('/pengajuan', {
    ...data,
    status: 'pending',
    catatan: '',
    createdAt: new Date().toISOString(),
  })
  return res.data
}

export async function updatePengajuanStatus(
  id: number,
  status: PengajuanStatus,
  catatan?: string
): Promise<Pengajuan> {
  const res = await api.patch(`/pengajuan/${id}`, { status, catatan })
  return res.data
}

export async function deletePengajuan(id: number): Promise<void> {
  await api.delete(`/pengajuan/${id}`)
}
