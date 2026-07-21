import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useAbsensiListPaginated } from '@/hooks/useAbsensi'
import { Input } from '@/components/ui/input'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { EmptyState } from '@/components/shared/EmptyState'
import { Pagination } from '@/components/shared/Pagination'
import { exportToCsv, formatCsvDate, formatCsvTime } from '@/lib/export'
import { Search, Download, RefreshCw } from 'lucide-react'
import { formatDate, formatTime } from '@/lib/utils'
import type { AbsensiStatus } from '@/types'

const statusBadge: Record<AbsensiStatus, string> = {
  hadir: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  terlambat: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  pulang_cepat: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  izin: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  sakit: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  cuti: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400',
}

const PAGE_SIZE = 10

export default function RiwayatPage() {
  const { user } = useAuth()
  const [page, setPage] = useState(1)
  const [filterStatus, setFilterStatus] = useState('')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  const { data, isLoading, refetch, isFetching } = useAbsensiListPaginated({
    userId: user?.id,
    _sort: 'tanggal', _order: sortOrder,
    _page: page, _limit: PAGE_SIZE,
    ...(filterStatus ? { status: filterStatus } : {}),
  })

  const absensi = data?.data
  const totalPages = data?.totalPages || 1

  function handleStatusChange(v: string) { setFilterStatus(v === ' ' ? '' : v); setPage(1) }
  function handleSortChange(v: string) { setSortOrder(v as 'asc' | 'desc'); setPage(1) }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Riwayat Kehadiran</h1>
          <p className="text-muted-foreground">Daftar absensi Anda</p>
        </div>
        <Button variant="outline" size="icon" onClick={() => refetch()} disabled={isFetching}>
          <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      <div className="flex flex-wrap gap-3">
        <Select value={filterStatus} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-[140px]"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value=" ">Semua</SelectItem>
            <SelectItem value="hadir">Hadir</SelectItem>
            <SelectItem value="terlambat">Terlambat</SelectItem>
            <SelectItem value="pulang_cepat">Pulang Cepat</SelectItem>
            <SelectItem value="izin">Izin</SelectItem>
            <SelectItem value="sakit">Sakit</SelectItem>
            <SelectItem value="cuti">Cuti</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sortOrder} onValueChange={handleSortChange}>
          <SelectTrigger className="w-[130px]"><SelectValue placeholder="Urut" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="desc">Terbaru</SelectItem>
            <SelectItem value="asc">Terlama</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex-1" />
        <Button variant="outline" size="sm" className="gap-2" onClick={() => {
          if (!absensi?.length) return
          exportToCsv(`riwayat-absensi-${new Date().toISOString().split('T')[0]}`,
            ['Tanggal', 'Masuk', 'Pulang', 'Status'],
            absensi.map((a) => [formatCsvDate(a.tanggal), formatCsvTime(a.checkIn), formatCsvTime(a.checkOut), a.status]))
        }}>
          <Download className="h-4 w-4" /> CSV
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full rounded-lg" />
          ))}
        </div>
      ) : absensi?.length ? (
        <>
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Masuk</TableHead>
                  <TableHead>Pulang</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {absensi.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell className="font-medium">{formatDate(a.tanggal)}</TableCell>
                    <TableCell className="text-muted-foreground">{formatTime(a.checkIn)}</TableCell>
                    <TableCell className="text-muted-foreground">{formatTime(a.checkOut)}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={`${statusBadge[a.status]} border-0`}>{a.status}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      ) : (
        <EmptyState message="Belum ada riwayat absensi" />
      )}
    </div>
  )
}
