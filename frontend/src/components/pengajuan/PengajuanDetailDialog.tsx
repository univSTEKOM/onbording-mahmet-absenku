import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { CalendarDays, CheckCircle2, XCircle, Trash2 } from 'lucide-react'
import { pengajuanJenisLabel, pengajuanStatusLabel, pengajuanJenisBadge, pengajuanStatusBadge } from '@/lib/constants'
import type { Pengajuan } from '@/types'
import type { User } from '@/types'

interface PengajuanDetailDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  pengajuan: Pengajuan | null
  variant: 'admin' | 'karyawan'
  pengaju?: User
  onApprove?: (id: number) => void
  onReject?: (id: number) => void
  onDelete?: (id: number) => void
}

function durasiHari(mulai: string, selesai: string) {
  const ms = new Date(selesai).getTime() - new Date(mulai).getTime()
  return Math.ceil(ms / (1000 * 60 * 60 * 24)) + 1
}

function formatTanggal(date: string) {
  return new Date(date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}

export function PengajuanDetailDialog({
  open, onOpenChange, pengajuan: p, variant, pengaju,
  onApprove, onReject, onDelete,
}: PengajuanDetailDialogProps) {
  if (!p) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Detail Pengajuan</DialogTitle>
          <DialogDescription>Informasi lengkap pengajuan izin / cuti</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {variant === 'admin' && pengaju && (
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={pengaju.foto || undefined} />
                <AvatarFallback className="text-sm">{pengaju.nama?.charAt(0)?.toUpperCase() || '?'}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{pengaju.nama}</p>
                <p className="text-xs text-muted-foreground">{pengaju.jabatan}</p>
              </div>
            </div>
          )}

          <div className="flex items-center gap-2">
            <Badge variant="secondary" className={pengajuanJenisBadge[p.jenis]}>{pengajuanJenisLabel[p.jenis]}</Badge>
            <Badge variant="secondary" className={pengajuanStatusBadge[p.status]}>{pengajuanStatusLabel[p.status]}</Badge>
          </div>

          <Separator />

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-muted-foreground text-xs">Tanggal Mulai</p>
              <p className="font-medium">{formatTanggal(p.tanggalMulai)}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Tanggal Selesai</p>
              <p className="font-medium">{formatTanggal(p.tanggalSelesai)}</p>
            </div>
          </div>

          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <CalendarDays className="h-3.5 w-3.5" />
            <span>Durasi: {durasiHari(p.tanggalMulai, p.tanggalSelesai)} hari kerja</span>
          </div>

          <Separator />

          <div>
            <p className="text-muted-foreground text-xs mb-1">Alasan</p>
            <div className="max-h-[200px] overflow-y-auto text-sm whitespace-pre-wrap">{p.alasan}</div>
          </div>

          {p.catatan && (
            <>
              <Separator />
              <div>
                <p className="text-muted-foreground text-xs mb-1">Catatan Admin</p>
                <div className="max-h-[200px] overflow-y-auto text-sm p-3 rounded-lg bg-muted whitespace-pre-wrap">{p.catatan}</div>
              </div>
            </>
          )}

          <Separator />

          <p className="text-xs text-muted-foreground">Diajukan pada {formatTanggal(p.createdAt)}</p>

          {variant === 'admin' && p.status === 'pending' && (
            <div className="flex gap-2">
              <Button
                size="sm"
                className="flex-1 gap-1.5"
                onClick={() => { onOpenChange(false); onApprove?.(p.id) }}
              >
                <CheckCircle2 className="h-4 w-4" /> Setujui
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="flex-1 gap-1.5 text-destructive hover:text-destructive"
                onClick={() => { onOpenChange(false); onReject?.(p.id) }}
              >
                <XCircle className="h-4 w-4" /> Tolak
              </Button>
            </div>
          )}

          {variant === 'karyawan' && p.status === 'pending' && (
            <Button
              variant="destructive"
              size="sm"
              className="w-full gap-2"
              onClick={() => { onOpenChange(false); onDelete?.(p.id) }}
            >
              <Trash2 className="h-4 w-4" /> Hapus Pengajuan
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

