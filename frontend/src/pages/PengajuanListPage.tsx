import { useState, useId } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { usePengajuanList, useDeletePengajuan } from '@/hooks/usePengajuan'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/shared/EmptyState'
import { Pagination } from '@/components/shared/Pagination'
import { FilterDialog, type FilterValues } from '@/components/shared/FilterDialog'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { PengajuanCard } from '@/components/pengajuan/PengajuanCard'
import { PengajuanDetailDialog } from '@/components/pengajuan/PengajuanDetailDialog'
import { PlusCircle, RefreshCw, Clock, CheckCircle2, FileText, Filter } from 'lucide-react'
import type { Pengajuan } from '@/types'

const ITEMS_PER_PAGE = 10

export default function PengajuanListPage() {
  const navigate = useNavigate()
  const { data: pengajuan, isLoading, refetch, isFetching } = usePengajuanList()
  const deleteMutation = useDeletePengajuan()
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null)
  const [detailTarget, setDetailTarget] = useState<Pengajuan | null>(null)
  const [filterOpen, setFilterOpen] = useState(false)
  const [filter, setFilter] = useState<FilterValues>({ search: '', jenis: '', status: '', dateFrom: '', dateTo: '' })
  const [page, setPage] = useState(1)
  const skId = useId()

  const filtered = pengajuan?.filter((p) => {
    const matchStatus = !filter.status || p.status === filter.status
    const matchJenis = !filter.jenis || p.jenis === filter.jenis
    const matchDate = (!filter.dateFrom || p.tanggalMulai >= filter.dateFrom) && (!filter.dateTo || p.tanggalMulai <= filter.dateTo)
    const matchSearch = !filter.search || p.alasan.toLowerCase().includes(filter.search.toLowerCase())
    return matchStatus && matchJenis && matchDate && matchSearch
  }) || []

  const total = pengajuan?.length || 0
  const pending = pengajuan?.filter((p) => p.status === 'pending').length || 0
  const approved = pengajuan?.filter((p) => p.status === 'approved').length || 0
  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE))
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)

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
          <Button className="gap-2" onClick={() => navigate({ to: '/pengajuan/baru' })}>
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
          <Button variant="ghost" size="sm" onClick={() => { setFilter({ search: '', jenis: '', status: '', dateFrom: '', dateTo: '' }); setPage(1) }}>
            Hapus filter
          </Button>
        )}
        <div className="flex-1" />
        <span className="text-sm text-muted-foreground">{filtered.length} hasil</span>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {Array.from({ length: 4 }, (_, i) => ({ id: `${skId}-s${i}` })).map((item) => (
            <Skeleton key={item.id} className="h-32 w-full rounded-xl" />
          ))}
        </div>
      ) : paginated.length ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {paginated.map((p) => (
            <PengajuanCard
              key={p.id}
              pengajuan={p}
              variant="karyawan"
              onDelete={(id) => setDeleteConfirmId(id)}
              onClick={(p) => setDetailTarget(p)}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          message={hasActiveFilter ? 'Tidak ditemukan' : 'Belum ada pengajuan'}
          icon={FileText}
        />
      )}

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />

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

      <PengajuanDetailDialog
        open={!!detailTarget}
        onOpenChange={(o) => { if (!o) setDetailTarget(null) }}
        pengajuan={detailTarget}
        variant="karyawan"
        onDelete={(id) => { setDetailTarget(null); setDeleteConfirmId(id) }}
      />

      <ConfirmDialog
        open={deleteConfirmId !== null}
        onOpenChange={(o) => { if (!o) setDeleteConfirmId(null) }}
        title="Hapus Pengajuan"
        actions={[
          {
            label: 'Hapus',
            onClick: () => { if (deleteConfirmId) { deleteMutation.mutate(deleteConfirmId); setDeleteConfirmId(null) } },
            variant: 'destructive' as const,
          },
        ]}
      >
        <p className="text-sm">Yakin ingin menghapus pengajuan ini? Tindakan ini tidak dapat dibatalkan.</p>
      </ConfirmDialog>
    </div>
  )
}
