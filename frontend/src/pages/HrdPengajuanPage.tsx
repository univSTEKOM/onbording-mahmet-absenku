import { useState, useId } from 'react'
import { useUsers } from '@/hooks/useUsers'
import { useAllPengajuan, useUpdatePengajuanStatus } from '@/hooks/usePengajuan'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { EmptyState } from '@/components/shared/EmptyState'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { FilterDialog, type FilterValues } from '@/components/shared/FilterDialog'
import { pengajuanJenisLabel, pengajuanStatusBadge, pengajuanStatusLabel, pengajuanJenisBadge } from '@/lib/constants'
import { toast } from 'sonner'
import { Filter, RefreshCw, CheckCircle2, XCircle, FileText, Clock, ChevronRight, CalendarDays } from 'lucide-react'
import type { Pengajuan, PengajuanStatus } from '@/types'

const datePresets = [
  { label: 'Hari Ini', get: () => new Date().toISOString().split('T')[0] },
  { label: '7 Hari', get: () => { const d = new Date(); d.setDate(d.getDate() - 7); return d.toISOString().split('T')[0] } },
  { label: 'Bulan Ini', get: () => { const d = new Date(); d.setDate(1); return d.toISOString().split('T')[0] } },
]

export default function HrdPengajuanPage() {
  const { data: users } = useUsers()
  const { data: allPengajuan, isLoading, refetch, isFetching } = useAllPengajuan()
  const updateStatus = useUpdatePengajuanStatus()
  const skId = useId()
  const [filterOpen, setFilterOpen] = useState(false)
  const [filter, setFilter] = useState<FilterValues>({ search: '', jenis: '', status: '', dateFrom: '', dateTo: '' })
  const [selectedPengajuan, setSelectedPengajuan] = useState<Pengajuan | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [confirmPengajuan, setConfirmPengajuan] = useState<Pengajuan | null>(null)
  const [catatan, setCatatan] = useState('')
  const [actionType, setActionType] = useState<PengajuanStatus | null>(null)

  const monthStart = new Date(); monthStart.setDate(1)
  const monthStr = monthStart.toISOString().split('T')[0]
  const monthData = allPengajuan?.filter((p) => p.createdAt >= monthStr) || []

  const totalMonth = monthData.length
  const pendingMonth = monthData.filter((p) => p.status === 'pending').length
  const approvedMonth = monthData.filter((p) => p.status === 'approved').length
  const rejectedMonth = monthData.filter((p) => p.status === 'rejected').length

  const filtered = allPengajuan?.filter((p) => {
    const pengaju = users?.find((u) => u.id === p.userId)
    const matchSearch = !filter.search || (pengaju?.nama || '').toLowerCase().includes(filter.search.toLowerCase()) || p.alasan.toLowerCase().includes(filter.search.toLowerCase())
    const matchStatus = !filter.status || p.status === filter.status
    const matchJenis = !filter.jenis || p.jenis === filter.jenis
    const matchDate = (!filter.dateFrom || p.tanggalMulai >= filter.dateFrom) && (!filter.dateTo || p.tanggalMulai <= filter.dateTo)
    return matchSearch && matchStatus && matchJenis && matchDate
  })

  function openDetail(p: Pengajuan) {
    setSelectedPengajuan(p)
    setDetailOpen(true)
  }

  function openConfirm(p: Pengajuan, status: PengajuanStatus) {
    setConfirmPengajuan(p)
    setActionType(status)
    setCatatan('')
  }

  function handleConfirm() {
    if (!confirmPengajuan || !actionType) return
    if (actionType === 'rejected' && !catatan.trim()) {
      toast.error('Catatan wajib diisi saat menolak pengajuan')
      return
    }
    updateStatus.mutate(
      { id: confirmPengajuan.id, status: actionType, catatan },
      { onSettled: () => { setConfirmPengajuan(null); setCatatan(''); setActionType(null) } }
    )
  }

  function formatTanggal(date: string) {
    return new Date(date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  function durasiHari(mulai: string, selesai: string) {
    const ms = new Date(selesai).getTime() - new Date(mulai).getTime()
    return Math.ceil(ms / (1000 * 60 * 60 * 24)) + 1
  }

  const hasActiveFilter = filter.search || filter.jenis || filter.status || filter.dateFrom || filter.dateTo

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Pengajuan</h1>
          <p className="text-muted-foreground">Kelola pengajuan izin & cuti karyawan</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isFetching ? 'animate-spin' : ''}`} /> Refresh
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="py-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-muted-foreground">Total Bulan Ini</span>
              <FileText className="h-4 w-4 text-primary" />
            </div>
            <p className="text-2xl font-bold">{totalMonth}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-muted-foreground">Pending</span>
              <Clock className="h-4 w-4 text-yellow-600" />
            </div>
            <p className="text-2xl font-bold text-yellow-600">{pendingMonth}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-muted-foreground">Disetujui</span>
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            </div>
            <p className="text-2xl font-bold text-green-600">{approvedMonth}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-muted-foreground">Ditolak</span>
              <XCircle className="h-4 w-4 text-red-600" />
            </div>
            <p className="text-2xl font-bold text-red-600">{rejectedMonth}</p>
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
          {Array.from({ length: 4 }, (_, i) => ({ id: `${skId}-s${i}` })).map((item) => (
            <Skeleton key={item.id} className="h-24 w-full rounded-xl" />
          ))}
        </div>
      ) : filtered?.length ? (
        <div className="space-y-3">
          {filtered.map((p) => {
            const pengaju = users?.find((u) => u.id === p.userId)
            const hari = durasiHari(p.tanggalMulai, p.tanggalSelesai)
            const initials = pengaju?.nama?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
            return (
              <Card key={p.id} className="hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => openDetail(p)}>
                <CardContent className="py-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <Avatar className="h-9 w-9 shrink-0">
                        <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                      </Avatar>
                      <div className="space-y-1.5 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-medium">{pengaju?.nama || '-'}</span>
                          <Badge variant="secondary" className={pengajuanJenisBadge[p.jenis]}>{pengajuanJenisLabel[p.jenis]}</Badge>
                          <Badge variant="secondary" className={pengajuanStatusBadge[p.status]}>{pengajuanStatusLabel[p.status]}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <CalendarDays className="h-3 w-3" />
                          {formatTanggal(p.tanggalMulai)} — {formatTanggal(p.tanggalSelesai)}
                          <span className="text-xs text-muted-foreground/70">({hari} hari)</span>
                        </p>
                        <p className="text-sm line-clamp-1">{p.alasan}</p>
                        {p.catatan && (
                          <p className="text-xs text-muted-foreground bg-muted/50 px-2 py-0.5 rounded inline-block">📋 {p.catatan}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      {p.status === 'pending' && (
                        <>
                          <Button size="sm" variant="ghost" className="text-green-600 h-8 w-8 p-0" onClick={(e) => { e.stopPropagation(); openConfirm(p, 'approved') }}>
                            <CheckCircle2 className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost" className="text-red-600 h-8 w-8 p-0" onClick={(e) => { e.stopPropagation(); openConfirm(p, 'rejected') }}>
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </>
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
        <EmptyState message={hasActiveFilter ? 'Tidak ditemukan' : 'Belum ada pengajuan'} />
      )}

      <FilterDialog
        open={filterOpen}
        onOpenChange={setFilterOpen}
        values={filter}
        onApply={setFilter}
        onReset={() => setFilter({ search: '', jenis: '', status: '', dateFrom: '', dateTo: '' })}
        searchPlaceholder="Cari karyawan atau alasan..."
        datePresets={datePresets}
      />

      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Detail Pengajuan</DialogTitle>
            <DialogDescription>Informasi lengkap pengajuan</DialogDescription>
          </DialogHeader>
          {selectedPengajuan && (() => {
            const pengaju = users?.find((u) => u.id === selectedPengajuan.userId)
            return (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback>{pengaju?.nama?.charAt(0) || '?'}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{pengaju?.nama || '-'}</p>
                    <p className="text-xs text-muted-foreground">{pengaju?.jabatan || '-'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className={pengajuanJenisBadge[selectedPengajuan.jenis]}>{pengajuanJenisLabel[selectedPengajuan.jenis]}</Badge>
                  <Badge variant="secondary" className={pengajuanStatusBadge[selectedPengajuan.status]}>{pengajuanStatusLabel[selectedPengajuan.status]}</Badge>
                </div>
                <Separator />
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><p className="text-muted-foreground text-xs">Mulai</p><p className="font-medium">{formatTanggal(selectedPengajuan.tanggalMulai)}</p></div>
                  <div><p className="text-muted-foreground text-xs">Selesai</p><p className="font-medium">{formatTanggal(selectedPengajuan.tanggalSelesai)}</p></div>
                </div>
                <p className="text-xs text-muted-foreground">Durasi: {durasiHari(selectedPengajuan.tanggalMulai, selectedPengajuan.tanggalSelesai)} hari</p>
                <Separator />
                <div><p className="text-muted-foreground text-xs mb-1">Alasan</p><p className="text-sm">{selectedPengajuan.alasan}</p></div>
                {selectedPengajuan.catatan && (
                  <>
                    <Separator />
                    <div><p className="text-muted-foreground text-xs mb-1">Catatan HRD</p><p className="text-sm p-3 rounded-lg bg-muted">{selectedPengajuan.catatan}</p></div>
                  </>
                )}
                <p className="text-xs text-muted-foreground">Diajukan pada {formatTanggal(selectedPengajuan.createdAt)}</p>
              </div>
            )
          })()}
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!confirmPengajuan}
        onOpenChange={(o) => { if (!o) { setConfirmPengajuan(null); setActionType(null); setCatatan('') } }}
        title={actionType === 'approved' ? 'Setujui Pengajuan' : 'Tolak Pengajuan'}
        actions={[{
          label: actionType === 'approved' ? 'Setujui' : 'Tolak',
          onClick: handleConfirm,
          className: actionType === 'approved' ? 'text-green-600 border-green-600' : 'text-red-600 border-red-600',
          variant: 'outline' as const,
          disabled: updateStatus.isPending,
        }]}
      >
        <div className="space-y-3">
          <p className="text-sm">{confirmPengajuan?.jenis} — {users?.find((u) => u.id === confirmPengajuan?.userId)?.nama || 'Unknown'}</p>
          <p className="text-sm text-muted-foreground">{confirmPengajuan?.alasan}</p>
          <div className="space-y-2">
            <label className="text-sm font-medium">Catatan</label>
            <textarea className="flex min-h-[60px] w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm"
              value={catatan} onChange={(e) => setCatatan(e.target.value)} placeholder="Catatan (opsional)" />
          </div>
        </div>
      </ConfirmDialog>
    </div>
  )
}
