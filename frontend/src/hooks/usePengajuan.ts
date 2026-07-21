import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  getPengajuan,
  createPengajuan,
  updatePengajuanStatus,
  deletePengajuan,
  type PengajuanFormData,
} from '@/api/pengajuan'
import type { PengajuanStatus } from '@/types'
import { useAuth } from './useAuth'

export function usePengajuanList() {
  const { user } = useAuth()
  return useQuery({
    queryKey: ['pengajuan', user?.id],
    queryFn: () => getPengajuan(user?.id),
    enabled: !!user,
  })
}

export function useAllPengajuan() {
  return useQuery({
    queryKey: ['pengajuan'],
    queryFn: () => getPengajuan(),
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
      toast.success(
        `Pengajuan ${variables.status === 'approved' ? 'disetujui' : 'ditolak'}`
      )
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
