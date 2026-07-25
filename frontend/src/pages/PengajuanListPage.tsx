import { useState, useId } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { usePengajuanList, useDeletePengajuan } from '@/hooks/usePengajuan'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/shared/EmptyState'
import { Pagination } from '@/components/shared/Pagination'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { PengajuanCard } from '@/components/pengajuan/PengajuanCard'
import { PengajuanDetailDialog } from '@/components/pengajuan/PengajuanDetailDialog'
import { PlusCircle, RefreshCw, FileText, X } from 'lucide-react'
import type { Pengajuan } from '@/types'

const ITEMS_PER_PAGE = 10

export default function PengajuanListPage() {
  const navigate = useNavigate()
  const [filterJenis, setFilterJenis] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [page, setPage] = useState(1)
  const skId = useId()

  const { data: pengajuan, isLoading, refetch, isFetching } = usePengajuanList({
    jenis: filterJenis || undefined,
    status: filterStatus || undefined,
  })
  const deleteMutation = useDeletePengajuan()
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null)
  const [detailTarget, setDetailTarget] = useState<Pengajuan | null>(null)

  var total = pengajuan?.length || 0
  var pending = pengajuan?.filter(function(p) { return p.status === 'pending' }).length || 0
  var approved = pengajuan?.filter(function(p) { return p.status === 'approved' }).length || 0
  var totalPages = Math.max(1, Math.ceil(total / ITEMS_PER_PAGE))
  var paginated = pengajuan?.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE) || []

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
          <p className="text-xs md:text-sm text-muted-foreground">Izin & cuti karyawan</p>
        </div>
        <div className="flex gap-2 shrink-0">
          <Button variant="outline" size="icon" onClick={function() { refetch() }} disabled={isFetching}>
            <RefreshCw className={'h-4 w-4 ' + (isFetching ? 'animate-spin' : '')} />
          </Button>
          <Button className="gap-2" onClick={function() { navigate({ to: '/pengajuan/baru' }) }}>
            <PlusCircle className="h-4 w-4" /> Ajukan
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Total', value: total, icon: FileText, color: 'text-primary', bg: 'bg-primary/10' },
          { label: 'Pending', value: pending, icon: FileText, color: 'text-amber-600', bg: 'bg-amber-100 dark:bg-amber-900/30' },
          { label: 'Disetujui', value: approved, icon: FileText, color: 'text-emerald-600', bg: 'bg-emerald-100 dark:bg-emerald-900/30' },
        ].map(function(stat) {
          var Icon = stat.icon
          return (
            <Card key={stat.label}>
              <CardContent className="py-3 px-3 md:py-4 md:px-4 flex items-center gap-3">
                <div className={'p-2 rounded-lg shrink-0 ' + stat.bg}>
                  <Icon className={'h-4 w-4 ' + stat.color} />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] md:text-xs text-muted-foreground truncate">{stat.label}</p>
                  <p className={'text-base md:text-lg font-bold ' + stat.color}>{stat.value}</p>
                </div>
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
            Hapus filter ({filtered.length})
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {Array.from({ length: 4 }, function(_, i) { return { id: skId + '-s' + i } }).map(function(item) {
            return <Skeleton key={item.id} className="h-32 w-full rounded-xl" />
          })}
        </div>
      ) : paginated.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {paginated.map(function(p) {
            return (
              <PengajuanCard
                key={p.id}
                pengajuan={p}
                variant="karyawan"
                onEdit={function(id) {
                  var target = pengajuan?.find(function(x) { return x.id === id })
                  if (target) navigate({ to: '/pengajuan/baru', state: { edit: target } })
                }}
                onDelete={function(id) { setDeleteConfirmId(id) }}
                onClick={function(p) { setDetailTarget(p) }}
              />
            )
          })}
        </div>
      ) : (
        <EmptyState message={hasActiveFilter ? 'Tidak ditemukan' : 'Belum ada pengajuan'} icon={FileText} />
      )}

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />

      <PengajuanDetailDialog
        open={!!detailTarget}
        onOpenChange={function(o) { if (!o) setDetailTarget(null) }}
        pengajuan={detailTarget}
        variant="karyawan"
        onDelete={function(id) { setDetailTarget(null); setDeleteConfirmId(id) }}
      />

      <ConfirmDialog
        open={deleteConfirmId !== null}
        onOpenChange={function(o) { if (!o) setDeleteConfirmId(null) }}
        title="Hapus Pengajuan"
        actions={[
          {
            label: 'Hapus',
            onClick: function() { if (deleteConfirmId !== null) { deleteMutation.mutate(deleteConfirmId); setDeleteConfirmId(null) } },
            variant: 'destructive' as const,
          },
        ]}
      >
        <p className="text-sm">Yakin ingin menghapus pengajuan ini? Tindakan ini tidak dapat dibatalkan.</p>
      </ConfirmDialog>
    </div>
  )
}
