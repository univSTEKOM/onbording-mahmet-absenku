import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePengajuanList, useDeletePengajuan } from '@/hooks/usePengajuan'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { EmptyState } from '@/components/shared/EmptyState'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { PlusCircle, Trash2, RefreshCw } from 'lucide-react'
import type { PengajuanJenis } from '@/types'

const jenisLabel: Record<PengajuanJenis, string> = { cuti: 'Cuti', izin: 'Izin', sakit: 'Sakit' }

const statusBadge: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  approved: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  rejected: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
}

const statusLabel: Record<string, string> = {
  pending: 'Menunggu', approved: 'Disetujui', rejected: 'Ditolak',
}

export default function PengajuanListPage() {
  const navigate = useNavigate()
  const { data: pengajuan, isLoading, refetch, isFetching } = usePengajuanList()
  const deleteMutation = useDeletePengajuan()
  const [deleteId, setDeleteId] = useState<number | null>(null)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Pengajuan</h1>
          <p className="text-muted-foreground">Izin & cuti karyawan</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={() => refetch()} disabled={isFetching}>
            <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
          </Button>
          <Button className="gap-2" onClick={() => navigate('/pengajuan/baru')}>
            <PlusCircle className="h-4 w-4" /> Ajukan Baru
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-12 w-full rounded-lg" />)}
        </div>
      ) : pengajuan?.length ? (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Jenis</TableHead>
                <TableHead>Mulai</TableHead>
                <TableHead>Selesai</TableHead>
                <TableHead>Alasan</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Catatan</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pengajuan.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{jenisLabel[p.jenis as PengajuanJenis] || p.jenis}</TableCell>
                  <TableCell className="text-muted-foreground">{new Date(p.tanggalMulai).toLocaleDateString('id-ID')}</TableCell>
                  <TableCell className="text-muted-foreground">{new Date(p.tanggalSelesai).toLocaleDateString('id-ID')}</TableCell>
                  <TableCell className="max-w-[200px] truncate">{p.alasan}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={`${statusBadge[p.status]} border-0`}>{statusLabel[p.status]}</Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{p.catatan || '-'}</TableCell>
                  <TableCell>
                    {p.status === 'pending' && (
                      <Button variant="ghost" size="icon" onClick={() => setDeleteId(p.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <EmptyState message="Belum ada pengajuan" />
      )}

      <ConfirmDialog
        open={deleteId !== null}
        onOpenChange={(o) => { if (!o) setDeleteId(null) }}
        title="Hapus Pengajuan"
        actions={[{ label: 'Hapus', onClick: () => { if (deleteId) deleteMutation.mutate(deleteId); setDeleteId(null) }, variant: 'destructive' as const }]}
      >
        <p className="text-sm">Yakin ingin menghapus pengajuan ini?</p>
      </ConfirmDialog>
    </div>
  )
}
