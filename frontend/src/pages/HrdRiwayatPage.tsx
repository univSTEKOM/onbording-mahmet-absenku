import { useState } from 'react'
import { useUsers } from '@/hooks/useUsers'
import { useAbsensiListPaginated } from '@/hooks/useAbsensi'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { EmptyState } from '@/components/shared/EmptyState'
import { Pagination } from '@/components/shared/Pagination'
import { FilterDialog, type FilterValues } from '@/components/shared/FilterDialog'
import { exportToCsv, formatCsvDate, formatCsvTime } from '@/lib/export'
import { absensiStatusBadge, absensiStatusLabel } from '@/lib/constants'
import { Download, RefreshCw, Filter } from 'lucide-react'
import { formatDate, formatTime } from '@/lib/utils'

const PAGE_SIZE = 15
const datePresets = [
  { label: 'Hari Ini', get: () => new Date().toISOString().split('T')[0] },
  { label: '7 Hari', get: () => { const d = new Date(); d.setDate(d.getDate() - 7); return d.toISOString().split('T')[0] } },
  { label: '30 Hari', get: () => { const d = new Date(); d.setDate(d.getDate() - 30); return d.toISOString().split('T')[0] } },
]

export default function HrdRiwayatPage() {
  const { data: users } = useUsers()
  const [page, setPage] = useState(1)
  const [filterOpen, setFilterOpen] = useState(false)
  const [filter, setFilter] = useState<FilterValues>({ search: '', jenis: '', status: '', dateFrom: '', dateTo: '' })

  const { data, isLoading, refetch, isFetching } = useAbsensiListPaginated({
    _sort: 'tanggal',
    _order: 'desc',
    _page: page,
    _limit: PAGE_SIZE,
    ...(filter.status ? { status: filter.status } : {}),
    ...(filter.dateFrom ? { tanggal_gte: filter.dateFrom } : {}),
    ...(filter.dateTo ? { tanggal_lte: filter.dateTo } : {}),
  })

  const absensi = data?.data
  const totalPages = data?.totalPages || 1
  const hasActiveFilter = filter.search || filter.status || filter.dateFrom || filter.dateTo

  const filtered = absensi?.filter((a) => {
    if (!filter.search) return true
    const pengaju = users?.find((u) => u.id === a.userId)
    const namaMatch = (pengaju?.nama || '').toLowerCase().includes(filter.search.toLowerCase())
    return namaMatch
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Riwayat Kehadiran</h1>
          <p className="text-muted-foreground">Seluruh karyawan</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-2" onClick={() => { if (filtered?.length) exportToCsv(
            `riwayat-seluruh-karyawan-${new Date().toISOString().split('T')[0]}`,
            ['Karyawan', 'Tanggal', 'Masuk', 'Pulang', 'Status'],
            filtered.map((a) => [users?.find((u) => u.id === a.userId)?.nama || '-', formatCsvDate(a.tanggal), formatCsvTime(a.checkIn), formatCsvTime(a.checkOut), a.status])
          ) }}>
            <Download className="h-4 w-4" /> CSV
          </Button>
          <Button variant="outline" size="icon" onClick={() => refetch()} disabled={isFetching}>
            <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button variant={hasActiveFilter ? 'default' : 'outline'} size="sm" className="gap-2" onClick={() => { setFilterOpen(true); setPage(1) }}>
          <Filter className="h-4 w-4" /> Filter
          {hasActiveFilter && <span className="ml-1 w-2 h-2 rounded-full bg-primary-foreground" />}
        </Button>
        {hasActiveFilter && (
          <Button variant="ghost" size="sm" onClick={() => { setFilter({ search: '', jenis: '', status: '', dateFrom: '', dateTo: '' }); setPage(1) }}>
            Hapus filter
          </Button>
        )}
        <div className="flex-1" />
        <span className="text-sm text-muted-foreground">{filtered?.length || 0} hasil</span>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full rounded-lg" />)}
        </div>
      ) : filtered?.length ? (
        <>
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Karyawan</TableHead>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Masuk</TableHead>
                  <TableHead>Pulang</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((a) => {
                  const nama = users?.find((u) => u.id === a.userId)?.nama || '-'
                  return (
                    <TableRow key={a.id}>
                      <TableCell className="font-medium">{nama}</TableCell>
                      <TableCell>{formatDate(a.tanggal)}</TableCell>
                      <TableCell className="text-muted-foreground">{formatTime(a.checkIn)}</TableCell>
                      <TableCell className="text-muted-foreground">{formatTime(a.checkOut)}</TableCell>
                      <TableCell><Badge variant="secondary" className={absensiStatusBadge[a.status]}>{absensiStatusLabel[a.status]}</Badge></TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      ) : (
        <EmptyState message={hasActiveFilter ? 'Tidak ditemukan' : 'Belum ada data absensi'} />
      )}

      <FilterDialog
        open={filterOpen}
        onOpenChange={setFilterOpen}
        values={filter}
        onApply={(v) => { setFilter(v); setPage(1) }}
        onReset={() => { setFilter({ search: '', jenis: '', status: '', dateFrom: '', dateTo: '' }); setPage(1) }}
        searchPlaceholder="Cari nama karyawan..."
        showJenis={false}
        showStatus
        showDate
        datePresets={datePresets}
        statusOptions={[
          { value: 'hadir', label: 'Hadir' },
          { value: 'terlambat', label: 'Terlambat' },
          { value: 'pulang_cepat', label: 'Pulang Cepat' },
          { value: 'izin', label: 'Izin' },
          { value: 'sakit', label: 'Sakit' },
          { value: 'cuti', label: 'Cuti' },
        ]}
      />
    </div>
  )
}
