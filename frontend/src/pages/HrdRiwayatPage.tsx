import { useState } from 'react'
import { useUsers } from '@/hooks/useUsers'
import { useAbsensiListPaginated } from '@/hooks/useAbsensi'
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
import { exportToCsv, formatCsvDate, formatCsvTime } from '@/lib/export'
import { absensiStatusBadge } from '@/lib/constants'
import { Download, RefreshCw } from 'lucide-react'
import { formatDate, formatTime } from '@/lib/utils'

const PAGE_SIZE = 15

export default function HrdRiwayatPage() {
  const { data: users } = useUsers()
  const [page, setPage] = useState(1)
  const [selectedUserId, setSelectedUserId] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [dateStart, setDateStart] = useState('')
  const [dateEnd, setDateEnd] = useState('')

  const { data, isLoading, refetch, isFetching } = useAbsensiListPaginated({
    _sort: 'tanggal',
    _order: 'desc',
    _page: page,
    _limit: PAGE_SIZE,
    ...(selectedUserId ? { userId: selectedUserId } : {}),
    ...(filterStatus ? { status: filterStatus } : {}),
    ...(dateStart ? { tanggal_gte: dateStart } : {}),
    ...(dateEnd ? { tanggal_lte: dateEnd } : {}),
  })

  const absensi = data?.data
  const totalPages = data?.totalPages || 1

  function handleFilterChange() {
    setPage(1)
  }

  function handleExport() {
    if (!absensi?.length) return
    const karyawanMap = new Map(users?.map((u) => [u.id, u.nama || '-']))
    exportToCsv(
      `riwayat-seluruh-karyawan-${new Date().toISOString().split('T')[0]}`,
      ['Karyawan', 'Tanggal', 'Masuk', 'Pulang', 'Status'],
      absensi.map((a) => [
        karyawanMap.get(a.userId) || `User #${a.userId}`,
        formatCsvDate(a.tanggal),
        formatCsvTime(a.checkIn),
        formatCsvTime(a.checkOut),
        a.status,
      ])
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Riwayat Kehadiran</h1>
          <p className="text-muted-foreground">Seluruh karyawan</p>
        </div>
        <Button variant="outline" size="icon" onClick={() => refetch()} disabled={isFetching}>
          <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      <div className="flex flex-wrap gap-3">
        <Select value={selectedUserId} onValueChange={(v) => { setSelectedUserId(v || ''); handleFilterChange() }}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Semua Karyawan" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value=" ">Semua Karyawan</SelectItem>
            {users?.filter((u) => u.role === 'karyawan').map((u) => (
              <SelectItem key={u.id} value={String(u.id)}>{u.nama}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input type="date" className="w-[140px]" value={dateStart} onChange={(e) => { setDateStart(e.target.value); handleFilterChange() }} />
        <span className="flex items-center text-sm text-muted-foreground">sd</span>
        <Input type="date" className="w-[140px]" value={dateEnd} onChange={(e) => { setDateEnd(e.target.value); handleFilterChange() }} />
        <Select value={filterStatus} onValueChange={(v) => { setFilterStatus(v === ' ' ? '' : v || ''); handleFilterChange() }}>
          <SelectTrigger className="w-[130px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value=" ">Semua</SelectItem>
            <SelectItem value="hadir">Hadir</SelectItem>
            <SelectItem value="terlambat">Terlambat</SelectItem>
            <SelectItem value="izin">Izin</SelectItem>
            <SelectItem value="sakit">Sakit</SelectItem>
            <SelectItem value="cuti">Cuti</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" className="gap-2" onClick={handleExport} disabled={!absensi?.length}>
          <Download className="h-4 w-4" /> CSV
        </Button>
      </div>

      {isLoading ? (
        <LoadingState />
      ) : absensi?.length ? (
        <>
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
              {absensi.map((a) => {
                const nama = users?.find((u) => u.id === a.userId)?.nama || '-'
                return (
                  <TableRow key={a.id}>
                    <TableCell className="font-medium">{nama}</TableCell>
                    <TableCell>{formatDate(a.tanggal)}</TableCell>
                    <TableCell>{formatTime(a.checkIn)}</TableCell>
                    <TableCell>{formatTime(a.checkOut)}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={absensiStatusBadge[a.status]}>{a.status}</Badge>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      ) : (
        <EmptyState message="Belum ada data absensi" />
      )}
    </div>
  )
}
