import { useState, useId } from 'react'
import { useUsers } from '@/hooks/useUsers'
import { useAllPengajuan, useUpdatePengajuanStatus } from '@/hooks/usePengajuan'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/shared/EmptyState'
import { Pagination } from '@/components/shared/Pagination'
import { PengajuanCard } from '@/components/pengajuan/PengajuanCard'
import { PengajuanDetailDialog } from '@/components/pengajuan/PengajuanDetailDialog'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { RefreshCw, CheckCircle2, XCircle, FileText, Clock, X } from 'lucide-react'
import type { Pengajuan, PengajuanStatus } from '@/types'

var ITEMS_PER_PAGE = 10

export default function AdminPengajuanPage() {
  var { data: users } = useUsers()
  var { data: allPengajuan, isLoading, refetch, isFetching } = useAllPengajuan()
  var updateStatus = useUpdatePengajuanStatus()
  var skId = useId()
  var [filterJenis, setFilterJenis] = useState('')
  var [filterStatus, setFilterStatus] = useState('')
  var [detailTarget, setDetailTarget] = useState<Pengajuan | null>(null)
  var [confirmTarget, setConfirmTarget] = useState<Pengajuan | null>(null)
  var [confirmAction, setConfirmAction] = useState<PengajuanStatus | null>(null)
  var [rejectNote, setRejectNote] = useState('')
  var [page, setPage] = useState(1)

  var monthStart = new Date(); monthStart.setDate(1)
  var monthStr = monthStart.toISOString().split('T')[0]
  var monthData = allPengajuan?.filter(function(p) { return p.createdAt >= monthStr }) || []

  var totalMonth = monthData.length
  var pendingMonth = monthData.filter(function(p) { return p.status === 'pending' }).length
  var approvedMonth = monthData.filter(function(p) { return p.status === 'approved' }).length
  var rejectedMonth = monthData.filter(function(p) { return p.status === 'rejected' }).length

  var filtered = allPengajuan?.filter(function(p) {
    var matchStatus = !filterStatus || p.status === filterStatus
    var matchJenis = !filterJenis || p.jenis === filterJenis
    return matchStatus && matchJenis
  }) || []

  var sorted = [...filtered].sort(function(a, b) {
    if (a.status === 'pending' && b.status !== 'pending') return -1
    if (a.status !== 'pending' && b.status === 'pending') return 1
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })

  var totalPages = Math.max(1, Math.ceil(sorted.length / ITEMS_PER_PAGE))
  var paginated = sorted.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)

  function openConfirm(p: Pengajuan, status: PengajuanStatus) {
    setConfirmTarget(p)
    setConfirmAction(status)
    setRejectNote('')
  }

  function handleConfirm() {
    if (!confirmTarget || !confirmAction) return
    if (confirmAction === 'rejected' && !rejectNote.trim()) {
      toast.error('Catatan wajib diisi saat menolak pengajuan')
      return
    }
    updateStatus.mutate(
      { id: confirmTarget.id, status: confirmAction, catatan: rejectNote },
      { onSettled: function() { setConfirmTarget(null); setConfirmAction(null); setRejectNote('') } }
    )
  }

  var hasActiveFilter = filterJenis || filterStatus

  function clearFilters() {
    setFilterJenis('')
    setFilterStatus('')
    setPage(1)
  }

  var jenisOptions = [
    { value: 'cuti', label: 'Cuti' },
    { value: 'izin', label: 'Izin' },
    { value: 'sakit', label: 'Sakit' },
  ]

  var statusOptions = [
    { value: 'pending', label: 'Pending' },
    { value: 'approved', label: 'Disetujui' },
    { value: 'rejected', label: 'Ditolak' },
  ]

  return (
    <div className="space-y-5 md:space-y-6">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight">Pengajuan</h1>
          <p className="text-xs md:text-sm text-muted-foreground">Kelola pengajuan izin & cuti karyawan</p>
        </div>
        <Button variant="outline" size="sm" className="gap-2 shrink-0" onClick={function() { refetch() }} disabled={isFetching}>
          <RefreshCw className={'h-4 w-4 ' + (isFetching ? 'animate-spin' : '')} />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Total Bulan Ini', value: totalMonth, icon: FileText, color: 'text-primary', bg: 'bg-primary/5 border-primary/20' },
          { label: 'Pending', value: pendingMonth, icon: Clock, color: 'text-amber-600', bg: '' },
          { label: 'Disetujui', value: approvedMonth, icon: CheckCircle2, color: 'text-emerald-600', bg: '' },
          { label: 'Ditolak', value: rejectedMonth, icon: XCircle, color: 'text-red-600', bg: '' },
        ].map(function(stat) {
          var Icon = stat.icon
          return (
            <Card key={stat.label} className={stat.bg}>
              <CardContent className="py-3 md:py-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] md:text-xs font-medium text-muted-foreground">{stat.label}</span>
                  <Icon className={'h-4 w-4 ' + stat.color} />
                </div>
                <p className={'text-lg md:text-2xl font-bold ' + stat.color}>{stat.value}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="flex flex-wrap gap-1.5">
          {jenisOptions.map(function(opt) {
            return (
              <button
                key={opt.value}
                type="button"
                onClick={function() { setFilterJenis(filterJenis === opt.value ? '' : opt.value); setPage(1) }}
                className={'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ' + (
                  filterJenis === opt.value
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'border-border text-muted-foreground hover:text-foreground hover:bg-muted'
                )}
              >
                {opt.label}
                {filterJenis === opt.value && <X className="h-3 w-3" />}
              </button>
            )
          })}
        </div>
        <span className="text-muted-foreground/40 text-xs">|</span>
        <div className="flex flex-wrap gap-1.5">
          {statusOptions.map(function(opt) {
            return (
              <button
                key={opt.value}
                type="button"
                onClick={function() { setFilterStatus(filterStatus === opt.value ? '' : opt.value); setPage(1) }}
                className={'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ' + (
                  filterStatus === opt.value
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'border-border text-muted-foreground hover:text-foreground hover:bg-muted'
                )}
              >
                {opt.label}
                {filterStatus === opt.value && <X className="h-3 w-3" />}
              </button>
            )
          })}
        </div>
        {hasActiveFilter && (
          <button
            type="button"
            onClick={clearFilters}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors underline underline-offset-4"
          >
            Hapus filter ({sorted.length})
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {Array.from({ length: 6 }, function(_, i) { return { id: skId + '-s' + i } }).map(function(item) {
            return <Skeleton key={item.id} className="h-36 w-full rounded-xl" />
          })}
        </div>
      ) : paginated.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {paginated.map(function(p) {
            var pengaju = users?.find(function(u) { return u.id === p.userId })
            return (
              <PengajuanCard
                key={p.id}
                pengajuan={p}
                variant="admin"
                pengaju={pengaju}
                onApprove={function(id) {
                  var target = sorted.find(function(x) { return x.id === id })
                  if (target) openConfirm(target, 'approved')
                }}
                onReject={function(id) {
                  var target = sorted.find(function(x) { return x.id === id })
                  if (target) openConfirm(target, 'rejected')
                }}
                onClick={function(p) { setDetailTarget(p) }}
              />
            )
          })}
        </div>
      ) : (
        <EmptyState message={hasActiveFilter ? 'Tidak ditemukan' : 'Belum ada pengajuan'} />
      )}

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />

      <PengajuanDetailDialog
        open={!!detailTarget}
        onOpenChange={function(o) { if (!o) setDetailTarget(null) }}
        pengajuan={detailTarget}
        variant="admin"
        pengaju={detailTarget ? users?.find(function(u) { return u.id === detailTarget.userId }) : undefined}
        onApprove={function(id) {
          var target = sorted.find(function(x) { return x.id === id })
          if (target) openConfirm(target, 'approved')
        }}
        onReject={function(id) {
          var target = sorted.find(function(x) { return x.id === id })
          if (target) openConfirm(target, 'rejected')
        }}
      />

      <Dialog open={confirmAction === 'approved'} onOpenChange={function(o) { if (!o) { setConfirmTarget(null); setConfirmAction(null) } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Setujui Pengajuan</DialogTitle>
            <DialogDescription>
              {confirmTarget && (users?.find(function(u) { return u.id === confirmTarget.userId })?.nama || 'Unknown')}
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[120px] overflow-y-auto text-sm text-muted-foreground whitespace-pre-wrap mb-2">{confirmTarget?.alasan}</div>
          <p className="text-sm">Yakin ingin menyetujui pengajuan ini?</p>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={function() { setConfirmTarget(null); setConfirmAction(null) }}>Batal</Button>
            <Button size="sm" className="gap-1.5" onClick={handleConfirm} disabled={updateStatus.isPending}>
              <CheckCircle2 className="h-4 w-4" /> Setujui
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={confirmAction === 'rejected'} onOpenChange={function(o) { if (!o) { setConfirmTarget(null); setConfirmAction(null); setRejectNote('') } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tolak Pengajuan</DialogTitle>
            <DialogDescription>
              {confirmTarget && (users?.find(function(u) { return u.id === confirmTarget.userId })?.nama || 'Unknown')}
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[120px] overflow-y-auto text-sm text-muted-foreground whitespace-pre-wrap mb-3">{confirmTarget?.alasan}</div>
          <div className="space-y-3">
            <Label>Catatan <span className="text-destructive">*</span></Label>
            <Textarea
              value={rejectNote}
              onChange={function(e) { setRejectNote(e.target.value) }}
              placeholder="Catatan alasan penolakan (wajib diisi)"
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={function() { setConfirmTarget(null); setConfirmAction(null); setRejectNote('') }}>Batal</Button>
            <Button size="sm" variant="outline" className="gap-1.5 text-destructive hover:text-destructive" onClick={handleConfirm} disabled={updateStatus.isPending}>
              <XCircle className="h-4 w-4" /> Tolak
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
