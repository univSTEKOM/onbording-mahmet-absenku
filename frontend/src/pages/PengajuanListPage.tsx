import { useState, useId } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePengajuanList, useDeletePengajuan } from '@/hooks/usePengajuan'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { EmptyState } from '@/components/shared/EmptyState'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { FilterDialog, type FilterValues } from '@/components/shared/FilterDialog'
import { pengajuanJenisLabel, pengajuanStatusBadge, pengajuanStatusLabel, pengajuanJenisBadge } from '@/lib/constants'
import { PlusCircle, Trash2, RefreshCw, CalendarDays, Clock, CheckCircle2, XCircle, FileText, ChevronRight, Filter } from 'lucide-react'
import type { Pengajuan } from '@/types'

const statusIcons = {
  pending: Clock,
  approved: CheckCircle2,
  rejected: XCircle,
} as const

export default function PengajuanListPage() {
  const navigate = useNavigate()
  const { data: pengajuan, isLoading, refetch, isFetching } = usePengajuanList()
  const deleteMutation = useDeletePengajuan()
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [detailTarget, setDetailTarget] = useState<Pengajuan | null>(null)
  const [filterOpen, setFilterOpen] = useState(false)
  const [filter, setFilter] = useState<FilterValues>({ search: '', jenis: '', status: '', dateFrom: '', dateTo: '' })
  const skId = useId()

  const filtered = pengajuan?.filter((p) => {
    const matchStatus = !filter.status || p.status === filter.status
    const matchJenis = !filter.jenis || p.jenis === filter.jenis
    const matchDate = (!filter.dateFrom || p.tanggalMulai >= filter.dateFrom) && (!filter.dateTo || p.tanggalMulai <= filter.dateTo)
    const matchSearch = !filter.search || p.alasan.toLowerCase().includes(filter.search.toLowerCase())
    return matchStatus && matchJenis && matchDate && matchSearch
  })

  const total = pengajuan?.length || 0
  const pending = pengajuan?.filter((p) => p.status === 'pending').length || 0
  const approved = pengajuan?.filter((p) => p.status === 'approved').length || 0

  function durasiHari(mulai: string, selesai: string) {
    const ms = new Date(selesai).getTime() - new Date(mulai).getTime()
    return Math.ceil(ms / (1000 * 60 * 60 * 24)) + 1
  }

  function formatTanggal(date: string) {
    return new Date(date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  const hasActiveFilter = filter.search || filter.jenis || filter.status || filter.dateFrom || filter.dateTo

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

      <div className="grid grid-cols-3 gap-3">
        <Card>
          <CardContent className="py-3 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10"><FileText className="h-4 w-4 text-primary" /></div>
            <div>
              <p className="text-xs text-muted-foreground">Total</p>
              <p className="text-lg font-bold">{total}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-3 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-yellow-100 dark:bg-yellow-900/30"><Clock className="h-4 w-4 text-yellow-600" /></div>
            <div>
              <p className="text-xs text-muted-foreground">Pending</p>
              <p className="text-lg font-bold text-yellow-600">{pending}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-3 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30"><CheckCircle2 className="h-4 w-4 text-green-600" /></div>
            <div>
              <p className="text-xs text-muted-foreground">Disetujui</p>
              <p className="text-lg font-bold text-green-600">{approved}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center gap-3">
        <Button
          variant={hasActiveFilter ? 'default' : 'outline'}
          size="sm"
          className="gap-2"
          onClick={() => setFilterOpen(true)}
        >
          <Filter className="h-4 w-4" />
          Filter
          {hasActiveFilter && <span className="ml-1 w-2 h-2 rounded-full bg-primary-foreground" />}
        </Button>
        {hasActiveFilter && (
          <Button variant="ghost" size="sm" onClick={() => setFilter({ search: '', jenis: '', status: '', dateFrom: '', dateTo: '' })}>
            Hapus filter
          </Button>
        )}
        <div className="flex-1" />
        <span className="text-sm text-muted-foreground">{filtered?.length || 0} hasil</span>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }, (_, i) => ({ id: `${skId}-s${i}` })).map((item) => (
            <Skeleton key={item.id} className="h-28 w-full rounded-xl" />
          ))}
        </div>
      ) : filtered?.length ? (
        <div className="space-y-3">
          {filtered.map((p) => {
            const StatusIcon = statusIcons[p.status]
            const hari = durasiHari(p.tanggalMulai, p.tanggalSelesai)
            return (
              <Card key={p.id} className="hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => setDetailTarget(p)}>
                <CardContent className="py-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-2 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="secondary" className={pengajuanJenisBadge[p.jenis]}>{pengajuanJenisLabel[p.jenis]}</Badge>
                        <Badge variant="secondary" className={pengajuanStatusBadge[p.status]}>
                          <StatusIcon className="h-3 w-3 mr-1 inline" /> {pengajuanStatusLabel[p.status]}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <CalendarDays className="h-3.5 w-3.5" />
                        {formatTanggal(p.tanggalMulai)} — {formatTanggal(p.tanggalSelesai)}
                        <span className="text-xs text-muted-foreground/70">({hari} hari)</span>
                      </p>
                      <p className="text-sm leading-snug line-clamp-2">{p.alasan}</p>
                      {p.catatan && p.status !== 'pending' && (
                        <p className="text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded-md inline-block">📋 {p.catatan}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      {p.status === 'pending' && (
                        <Button
                          variant="ghost" size="icon" className="h-8 w-8"
                          onClick={(e) => { e.stopPropagation(); setDeleteId(p.id) }}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      )}
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      ) : (
        <EmptyState
          message={hasActiveFilter ? 'Tidak ditemukan' : 'Belum ada pengajuan'}
          icon={FileText}
        />
      )}

      <FilterDialog
        open={filterOpen}
        onOpenChange={setFilterOpen}
        values={filter}
        onApply={setFilter}
        onReset={() => setFilter({ search: '', jenis: '', status: '', dateFrom: '', dateTo: '' })}
        searchPlaceholder="Cari alasan..."
        statusOptions={[
          { value: 'pending', label: 'Pending' },
          { value: 'approved', label: 'Disetujui' },
          { value: 'rejected', label: 'Ditolak' },
        ]}
      />

      <Dialog open={!!detailTarget} onOpenChange={(o) => { if (!o) setDetailTarget(null) }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Detail Pengajuan</DialogTitle>
            <DialogDescription>Informasi lengkap pengajuan izin / cuti</DialogDescription>
          </DialogHeader>
          {detailTarget && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className={pengajuanJenisBadge[detailTarget.jenis]}>{pengajuanJenisLabel[detailTarget.jenis]}</Badge>
                <Badge variant="secondary" className={pengajuanStatusBadge[detailTarget.status]}>{pengajuanStatusLabel[detailTarget.status]}</Badge>
              </div>
              <Separator />
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><p className="text-muted-foreground text-xs">Tanggal Mulai</p><p className="font-medium">{formatTanggal(detailTarget.tanggalMulai)}</p></div>
                <div><p className="text-muted-foreground text-xs">Tanggal Selesai</p><p className="font-medium">{formatTanggal(detailTarget.tanggalSelesai)}</p></div>
              </div>
              <p className="text-xs text-muted-foreground">Durasi: {durasiHari(detailTarget.tanggalMulai, detailTarget.tanggalSelesai)} hari kerja</p>
              <Separator />
              <div><p className="text-muted-foreground text-xs mb-1">Alasan</p><p className="text-sm">{detailTarget.alasan}</p></div>
              {detailTarget.catatan && (
                <>
                  <Separator />
                  <div><p className="text-muted-foreground text-xs mb-1">Catatan HRD</p><p className="text-sm p-3 rounded-lg bg-muted">{detailTarget.catatan}</p></div>
                </>
              )}
              <Separator />
              <p className="text-xs text-muted-foreground">Diajukan pada {formatTanggal(detailTarget.createdAt)}</p>
              {detailTarget.status === 'pending' && (
                <Button variant="destructive" size="sm" className="w-full gap-2" onClick={() => { setDetailTarget(null); setDeleteId(detailTarget.id) }}>
                  <Trash2 className="h-4 w-4" /> Hapus Pengajuan
                </Button>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deleteId !== null}
        onOpenChange={(o) => { if (!o) setDeleteId(null) }}
        title="Hapus Pengajuan"
        actions={[{ label: 'Hapus', onClick: () => { if (deleteId) deleteMutation.mutate(deleteId); setDeleteId(null) }, variant: 'destructive' as const }]}
      >
        <p className="text-sm">Yakin ingin menghapus pengajuan ini? Tindakan ini tidak dapat dibatalkan.</p>
      </ConfirmDialog>
    </div>
  )
}
