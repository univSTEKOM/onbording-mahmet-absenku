import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useAbsensiListPaginated, useAbsensiList } from '@/hooks/useAbsensi'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { LoadingState } from '@/components/shared/LoadingState'
import { EmptyState } from '@/components/shared/EmptyState'
import { Pagination } from '@/components/shared/Pagination'
import { Search, Download } from 'lucide-react'
import { formatDate, formatTime } from '@/lib/utils'
import { exportToCsv, formatCsvDate, formatCsvTime } from '@/lib/export'
import type { AbsensiStatus } from '@/types'

const statusColor: Record<AbsensiStatus, string> = {
  hadir: 'bg-green-100 text-green-800',
  terlambat: 'bg-yellow-100 text-yellow-800',
  izin: 'bg-blue-100 text-blue-800',
  sakit: 'bg-purple-100 text-purple-800',
  cuti: 'bg-orange-100 text-orange-800',
}

const PAGE_SIZE = 10

export default function RiwayatPage() {
  const { user } = useAuth()
  const [page, setPage] = useState(1)
  const [filterStatus, setFilterStatus] = useState('')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  const { data, isLoading } = useAbsensiListPaginated({
    userId: user?.id,
    _sort: 'tanggal',
    _order: sortOrder,
    _page: page,
    _limit: PAGE_SIZE,
    ...(filterStatus ? { status: filterStatus } : {}),
  })

  const { data: allAbsensi } = useAbsensiList({
    userId: user?.id,
    ...(filterStatus ? { status: filterStatus } : {}),
    _sort: 'tanggal',
    _order: 'desc',
  })

  const absensi = data?.data
  const totalPages = data?.totalPages || 1

  function handleExport() {
    if (!allAbsensi?.length) return
    exportToCsv(
      `riwayat-absensi-${new Date().toISOString().split('T')[0]}`,
      ['Tanggal', 'Masuk', 'Pulang', 'Status'],
      allAbsensi.map((a) => [
        formatCsvDate(a.tanggal),
        formatCsvTime(a.checkIn),
        formatCsvTime(a.checkOut),
        a.status,
      ])
    )
  }

  function handleStatusChange(value: string) {
    setFilterStatus(value === ' ' ? '' : value)
    setPage(1)
  }

  function handleSortChange(value: string) {
    setSortOrder(value as 'asc' | 'desc')
    setPage(1)
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Riwayat Kehadiran</h1>
        <p className="text-muted-foreground">
          Daftar riwayat absensi Anda
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Cari tanggal..." className="pl-9" />
        </div>
        <Select value={filterStatus} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Semua Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value=" ">Semua Status</SelectItem>
            <SelectItem value="hadir">Hadir</SelectItem>
            <SelectItem value="terlambat">Terlambat</SelectItem>
            <SelectItem value="izin">Izin</SelectItem>
            <SelectItem value="sakit">Sakit</SelectItem>
            <SelectItem value="cuti">Cuti</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sortOrder} onValueChange={handleSortChange}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Urutkan" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="desc">Terbaru</SelectItem>
            <SelectItem value="asc">Terlama</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" className="gap-2" onClick={handleExport}>
          <Download className="h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {isLoading ? (
        <LoadingState />
      ) : absensi?.length ? (
        <>
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
                  <TableCell>{formatDate(a.tanggal)}</TableCell>
                  <TableCell>{formatTime(a.checkIn)}</TableCell>
                  <TableCell>{formatTime(a.checkOut)}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={statusColor[a.status]}>
                      {a.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      ) : (
        <EmptyState message="Belum ada riwayat absensi" />
      )}
    </div>
  )
}
