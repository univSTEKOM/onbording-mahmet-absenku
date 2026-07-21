import { useNavigate } from 'react-router-dom'
import { usePengajuanList, useDeletePengajuan } from '@/hooks/usePengajuan'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { PlusCircle, Trash2 } from 'lucide-react'
import type { PengajuanStatus, PengajuanJenis } from '@/types'

const statusColor: Record<PengajuanStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
}

const jenisLabel: Record<PengajuanJenis, string> = {
  cuti: 'Cuti',
  izin: 'Izin',
  sakit: 'Sakit',
}

export default function PengajuanListPage() {
  const navigate = useNavigate()
  const { data: pengajuan, isLoading } = usePengajuanList()
  const deleteMutation = useDeletePengajuan()

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Pengajuan Izin / Cuti</h1>
          <p className="text-muted-foreground">
            Daftar pengajuan Anda
          </p>
        </div>
        <Button onClick={() => navigate('/pengajuan/baru')} className="gap-2">
          <PlusCircle className="h-4 w-4" />
          Ajukan Baru
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Jenis</TableHead>
            <TableHead>Tanggal Mulai</TableHead>
            <TableHead>Tanggal Selesai</TableHead>
            <TableHead>Alasan</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Catatan</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center">
                Memuat...
              </TableCell>
            </TableRow>
          ) : pengajuan?.length ? (
            pengajuan.map((p) => (
              <TableRow key={p.id}>
                <TableCell className="font-medium">
                  {jenisLabel[p.jenis as PengajuanJenis] || p.jenis}
                </TableCell>
                <TableCell>
                  {new Date(p.tanggalMulai).toLocaleDateString('id-ID')}
                </TableCell>
                <TableCell>
                  {new Date(p.tanggalSelesai).toLocaleDateString('id-ID')}
                </TableCell>
                <TableCell className="max-w-[200px] truncate">
                  {p.alasan}
                </TableCell>
                <TableCell>
                  <Badge
                    variant="secondary"
                    className={statusColor[p.status]}
                  >
                    {p.status === 'pending'
                      ? 'Menunggu'
                      : p.status === 'approved'
                        ? 'Disetujui'
                        : 'Ditolak'}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {p.catatan || '-'}
                </TableCell>
                <TableCell>
                  {p.status === 'pending' && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteMutation.mutate(p.id)}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={7}
                className="text-center text-muted-foreground"
              >
                Belum ada pengajuan
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
