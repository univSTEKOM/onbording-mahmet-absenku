import { useState, useId } from 'react'
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
import { pengajuanJenisLabel, pengajuanStatusBadge, pengajuanStatusLabel } from '@/lib/constants'

export default function PengajuanListPage() {
  const navigate = useNavigate()
  const { data: pengajuan, isLoading, refetch, isFetching } = usePengajuanList()
  const deleteMutation = useDeletePengajuan()
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const skId = useId()

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
          {Array.from({ length: 3 }, (_, i) => ({ id: `${skId}-s${i}` })).map((item) => <Skeleton key={item.id} className="h-12 w-full rounded-lg" />)}
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
                  <TableCell className="font-medium">{pengajuanJenisLabel[p.jenis] || p.jenis}</TableCell>
                  <TableCell className="text-muted-foreground">{new Date(p.tanggalMulai).toLocaleDateString('id-ID')}</TableCell>
                  <TableCell className="text-muted-foreground">{new Date(p.tanggalSelesai).toLocaleDateString('id-ID')}</TableCell>
                  <TableCell className="max-w-[200px] truncate">{p.alasan}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={pengajuanStatusBadge[p.status]}>{pengajuanStatusLabel[p.status]}</Badge>
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
