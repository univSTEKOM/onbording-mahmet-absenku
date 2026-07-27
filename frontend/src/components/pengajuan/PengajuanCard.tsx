import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CalendarDays, CheckCircle2, XCircle, Trash2, Pencil } from 'lucide-react'
import { pengajuanJenisLabel, pengajuanStatusLabel, pengajuanJenisBadge, pengajuanStatusBadge } from '@/lib/constants'
import { UserLink } from '@/components/pengguna/UserLink'
import type { Pengajuan } from '@/types'
import type { User } from '@/types'

interface PengajuanCardProps {
  pengajuan: Pengajuan
  variant: 'admin' | 'karyawan'
  pengaju?: User
  onApprove?: (id: number) => void
  onReject?: (id: number) => void
  onEdit?: (id: number) => void
  onDelete?: (id: number) => void
  onClick?: (p: Pengajuan) => void
}

function durasiHari(mulai: string, selesai: string) {
  const ms = new Date(selesai).getTime() - new Date(mulai).getTime()
  return Math.ceil(ms / (1000 * 60 * 60 * 24)) + 1
}

function formatTanggal(date: string) {
  return new Date(date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}

export function PengajuanCard({ pengajuan: p, variant, pengaju, onApprove, onReject, onEdit, onDelete, onClick }: PengajuanCardProps) {
  const hari = durasiHari(p.tanggalMulai, p.tanggalSelesai)

  return (
    <Card
      className="hover:bg-muted/50 transition-colors cursor-pointer h-full"
      onClick={() => onClick?.(p)}
    >
      <CardContent className="p-4 flex flex-col h-full">
        <div className="flex flex-col gap-3 flex-1 min-w-0">
          {variant === 'admin' && pengaju && (
            <UserLink user={pengaju} />
          )}
          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="secondary" className={pengajuanJenisBadge[p.jenis]}>
                {pengajuanJenisLabel[p.jenis]}
              </Badge>
              <Badge variant="secondary" className={pengajuanStatusBadge[p.status]}>
                {pengajuanStatusLabel[p.status]}
              </Badge>
            </div>

            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <CalendarDays className="h-3.5 w-3.5 shrink-0" />
              <span>{formatTanggal(p.tanggalMulai)} — {formatTanggal(p.tanggalSelesai)}</span>
              <span className="text-xs text-muted-foreground/70">({hari} hari)</span>
            </div>

            <p className="text-sm leading-snug line-clamp-2">{p.alasan}</p>

            {p.catatan && p.status !== 'pending' && (
              <p className="text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded-md line-clamp-2">
                {p.catatan}
              </p>
            )}
          </div>
        </div>

        {variant === 'admin' && p.status === 'pending' && (
          <div className="flex gap-2 mt-3 pt-3 border-t">
            <Button
              size="sm"
              className="flex-1 gap-1.5"
              onClick={(e) => { e.stopPropagation(); onApprove?.(p.id) }}
            >
              <CheckCircle2 className="h-4 w-4" /> Setujui
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="flex-1 gap-1.5 text-destructive hover:text-destructive"
              onClick={(e) => { e.stopPropagation(); onReject?.(p.id) }}
            >
              <XCircle className="h-4 w-4" /> Tolak
            </Button>
          </div>
        )}

        {variant === 'karyawan' && p.status === 'pending' && (
          <div className="flex gap-2 mt-3 pt-3 border-t">
            <Button
              size="sm"
              variant="outline"
              className="flex-1 gap-1.5"
              onClick={(e) => { e.stopPropagation(); onEdit?.(p.id) }}
            >
              <Pencil className="h-4 w-4" /> Edit
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="flex-1 gap-1.5 text-destructive hover:text-destructive"
              onClick={(e) => { e.stopPropagation(); onDelete?.(p.id) }}
            >
              <Trash2 className="h-4 w-4" /> Hapus
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
