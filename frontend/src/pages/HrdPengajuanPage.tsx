import { useState, useId } from 'react'
import { useUsers } from '@/hooks/useUsers'
import { useAllPengajuan, useUpdatePengajuanStatus } from '@/hooks/usePengajuan'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/shared/EmptyState'
import { Pagination } from '@/components/shared/Pagination'
import { FilterDialog, type FilterValues } from '@/components/shared/FilterDialog'
import { PengajuanCard } from '@/components/pengajuan/PengajuanCard'
import { PengajuanDetailDialog } from '@/components/pengajuan/PengajuanDetailDialog'
import { toast } from 'sonner'
import { Filter, RefreshCw, CheckCircle2, XCircle, FileText, Clock } from 'lucide-react'
import type { Pengajuan, PengajuanStatus } from '@/types'

const ITEMS_PER_PAGE = 10

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
  const [detailTarget, setDetailTarget] = useState<Pengajuan | null>(null)
  const [confirmTarget, setConfirmTarget] = useState<Pengajuan | null>(null)
  const [confirmAction, setConfirmAction] = useState<PengajuanStatus | null>(null)
  const [rejectNote, setRejectNote] = useState('')
  const [page, setPage] = useState(1)

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
  }) || []

  const sorted = [...filtered].sort((a, b) => {
    if (a.status === 'pending' && b.status !== 'pending') return -1
    if (a.status !== 'pending' && b.status === 'pending') return 1
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })

  const totalPages = Math.max(1, Math.ceil(sorted.length / ITEMS_PER_PAGE))
  const paginated = sorted.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)

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
      { onSettled: () => { setConfirmTarget(null); setConfirmAction(null); setRejectNote('') } }
    )
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
          <Button variant="ghost" size="sm" onClick={() => { setFilter({ search: '', jenis: '', status: '', dateFrom: '', dateTo: '' }); setPage(1) }}>
            Hapus filter
          </Button>
        )}
        <div className="flex-1" />
        <span className="text-sm text-muted-foreground">{sorted.length} hasil</span>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {Array.from({ length: 6 }, (_, i) => ({ id: `${skId}-s${i}` })).map((item) => (
            <Skeleton key={item.id} className="h-40 w-full rounded-xl" />
          ))}
        </div>
      ) : paginated.length ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {paginated.map((p) => {
            const pengaju = users?.find((u) => u.id === p.userId)
            return (
              <PengajuanCard
                key={p.id}
                pengajuan={p}
                variant="admin"
                pengaju={pengaju}
                onApprove={(id) => {
                  const target = sorted.find((x) => x.id === id)
                  if (target) openConfirm(target, 'approved')
                }}
                onReject={(id) => {
                  const target = sorted.find((x) => x.id === id)
                  if (target) openConfirm(target, 'rejected')
                }}
                onClick={(p) => setDetailTarget(p)}
              />
            )
          })}
        </div>
      ) : (
        <EmptyState message={hasActiveFilter ? 'Tidak ditemukan' : 'Belum ada pengajuan'} />
      )}

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />

      <FilterDialog
        open={filterOpen}
        onOpenChange={setFilterOpen}
        values={filter}
        onApply={setFilter}
        onReset={() => setFilter({ search: '', jenis: '', status: '', dateFrom: '', dateTo: '' })}
        searchPlaceholder="Cari karyawan atau alasan..."
        datePresets={datePresets}
      />

      <PengajuanDetailDialog
        open={!!detailTarget}
        onOpenChange={(o) => { if (!o) setDetailTarget(null) }}
        pengajuan={detailTarget}
        variant="admin"
        pengaju={detailTarget ? users?.find((u) => u.id === detailTarget.userId) : undefined}
        onApprove={(id) => {
          const target = sorted.find((x) => x.id === id)
          if (target) openConfirm(target, 'approved')
        }}
        onReject={(id) => {
          const target = sorted.find((x) => x.id === id)
          if (target) openConfirm(target, 'rejected')
        }}
      />

      {confirmAction === 'approved' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => { setConfirmTarget(null); setConfirmAction(null) }}>
          <div className="bg-background rounded-lg p-6 max-w-sm w-full mx-4 shadow-lg" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-semibold mb-2">Setujui Pengajuan</h2>
            <p className="text-sm text-muted-foreground mb-1">
              {confirmTarget && `${users?.find((u) => u.id === confirmTarget.userId)?.nama || 'Unknown'}`}
            </p>
            <div className="max-h-[120px] overflow-y-auto text-sm text-muted-foreground whitespace-pre-wrap mb-4">{confirmTarget?.alasan}</div>
            <p className="text-sm mb-4">Yakin ingin menyetujui pengajuan ini?</p>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" size="sm" onClick={() => { setConfirmTarget(null); setConfirmAction(null) }}>Batal</Button>
              <Button size="sm" className="gap-1.5" onClick={handleConfirm} disabled={updateStatus.isPending}>
                <CheckCircle2 className="h-4 w-4" /> Setujui
              </Button>
            </div>
          </div>
        </div>
      )}

      {confirmAction === 'rejected' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => { setConfirmTarget(null); setConfirmAction(null); setRejectNote('') }}>
          <div className="bg-background rounded-lg p-6 max-w-sm w-full mx-4 shadow-lg" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-semibold mb-2">Tolak Pengajuan</h2>
            <p className="text-sm text-muted-foreground mb-1">
              {confirmTarget && `${users?.find((u) => u.id === confirmTarget.userId)?.nama || 'Unknown'}`}
            </p>
            <div className="max-h-[120px] overflow-y-auto text-sm text-muted-foreground whitespace-pre-wrap mb-4">{confirmTarget?.alasan}</div>
            <div className="space-y-3">
              <div className="space-y-2">
                <label className="text-sm font-medium">Catatan <span className="text-destructive">*</span></label>
                <textarea
                  className="flex min-h-[80px] max-h-[200px] w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  value={rejectNote}
                  onChange={(e) => setRejectNote(e.target.value)}
                  placeholder="Catatan alasan penolakan (wajib diisi)"
                />
              </div>
            </div>
            <div className="flex gap-2 justify-end mt-4">
              <Button variant="outline" size="sm" onClick={() => { setConfirmTarget(null); setConfirmAction(null); setRejectNote('') }}>Batal</Button>
              <Button size="sm" variant="outline" className="gap-1.5 text-destructive hover:text-destructive" onClick={handleConfirm} disabled={updateStatus.isPending}>
                <XCircle className="h-4 w-4" /> Tolak
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
