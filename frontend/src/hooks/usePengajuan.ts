import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { getPengajuan, createPengajuan, updatePengajuan, updatePengajuanStatus, deletePengajuan } from '@/api/pengajuan'
import type { Pengajuan, PengajuanStatus, PengajuanFormData } from '@/types'
import { useAuth } from './useAuth'

export function usePengajuanList(filters?: { jenis?: string; status?: string }) {
  const { user } = useAuth()
  const params: Record<string, string | undefined> = { userId: user?.id }
  if (filters?.jenis) params.jenis = filters.jenis
  if (filters?.status) params.status = filters.status
  return useQuery({
    queryKey: ['pengajuan', user?.id, filters],
    queryFn: () => getPengajuan(params),
    enabled: !!user,
    staleTime: 20000,
  })
}

export function useAllPengajuan(filters?: { jenis?: string; status?: string }) {
  const params: Record<string, string> = {}
  if (filters?.jenis) params.jenis = filters.jenis
  if (filters?.status) params.status = filters.status
  return useQuery({
    queryKey: ['pengajuan', 'all', filters],
    queryFn: () => getPengajuan(params),
    staleTime: 20000,
  })
}

export function useCreatePengajuan() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: (data: Omit<PengajuanFormData, 'userId'>) =>
      createPengajuan({ ...data, userId: user!.id }),
    onSuccess: () => {
      toast.success('Pengajuan berhasil dikirim')
      queryClient.invalidateQueries({ queryKey: ['pengajuan'] })
    },
  })
}

export function useUpdatePengajuan() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Pengajuan> }) =>
      updatePengajuan(id, data),
    onSuccess: () => {
      toast.success('Pengajuan berhasil diperbarui')
      queryClient.invalidateQueries({ queryKey: ['pengajuan'] })
    },
  })
}

export function useUpdatePengajuanStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      status,
      catatan,
    }: {
      id: number
      status: PengajuanStatus
      catatan?: string
    }) => updatePengajuanStatus(id, status, catatan),
    onSuccess: (_data, variables) => {
      toast.success(`Pengajuan ${variables.status === 'approved' ? 'disetujui' : 'ditolak'}`)
      queryClient.invalidateQueries({ queryKey: ['pengajuan'] })
    },
  })
}

export function useDeletePengajuan() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => deletePengajuan(id),
    onSuccess: () => {
      toast.success('Pengajuan dihapus')
      queryClient.invalidateQueries({ queryKey: ['pengajuan'] })
    },
  })
}
