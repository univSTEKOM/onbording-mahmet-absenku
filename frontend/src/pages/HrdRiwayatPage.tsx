import { useState, useMemo, useCallback } from 'react'
import { useAbsensiListPaginated } from '@/hooks/useAbsensi'
import { useMonthAttendance } from '@/hooks/useDashboard'
import { useUsers } from '@/hooks/useUsers'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { AttendanceCalendar } from '@/components/AttendanceCalendar'
import { EmptyState } from '@/components/shared/EmptyState'
import { Pagination } from '@/components/shared/Pagination'
import { absensiStatusBadge, absensiStatusLabel } from '@/lib/constants'
import { exportToCsv, formatCsvDate, formatCsvTime } from '@/lib/export'
import { Download, RefreshCw, X, Search } from 'lucide-react'

const PAGE_SIZE = 15
const curMonth = new Date().getMonth()
const curYear = new Date().getFullYear()

const STATUS_OPTIONS = [
  { value: 'hadir', label: 'Hadir' },
  { value: 'terlambat', label: 'Terlambat' },
  { value: 'pulang_cepat', label: 'Pulang Cepat' },
  { value: 'izin', label: 'Izin' },
  { value: 'sakit', label: 'Sakit' },
  { value: 'cuti', label: 'Cuti' },
] as const

type QuickDate = 'hari_ini' | 'kemarin' | '7_hari' | 'bulan_ini' | null

function getDateRange(preset: QuickDate): { dateFrom: string; dateTo: string } | null {
  if (!preset) return null
  const today = new Date().toISOString().split('T')[0]
  switch (preset) {
    case 'hari_ini':
      return { dateFrom: today, dateTo: today }
    case 'kemarin': {
      const d = new Date(); d.setDate(d.getDate() - 1)
      return { dateFrom: d.toISOString().split('T')[0], dateTo: d.toISOString().split('T')[0] }
    }
    case '7_hari': {
      const d = new Date(); d.setDate(d.getDate() - 7)
      return { dateFrom: d.toISOString().split('T')[0], dateTo: today }
    }
    case 'bulan_ini': {
      const d = new Date(); d.setDate(1)
      return { dateFrom: d.toISOString().split('T')[0], dateTo: today }
    }
  }
}

export default function HrdRiwayatPage() {
  const { data: users } = useUsers()
  const [page, setPage] = useState(1)
  const [quickDate, setQuickDate] = useState<QuickDate>('hari_ini')
  const [calendarDate, setCalendarDate] = useState<string | null>(null)
  const [selectedStatuses, setSelectedStatuses] = useState<Set<string>>(new Set())
  const [search, setSearch] = useState('')

  const { data: monthData } = useMonthAttendance(curYear, curMonth + 1)

  const dateRange = useMemo(() => {
    if (calendarDate) return { dateFrom: calendarDate, dateTo: calendarDate }
    return getDateRange(quickDate)
  }, [quickDate, calendarDate])

  const { data, isLoading, refetch, isFetching } = useAbsensiListPaginated({
    _sort: 'tanggal', _order: 'desc',
    _page: page, _limit: PAGE_SIZE,
    ...(dateRange ? { tanggal_gte: dateRange.dateFrom } : {}),
    ...(dateRange ? { tanggal_lte: dateRange.dateTo } : {}),
  })

  const absensi = data?.data
  const totalPages = data?.totalPages || 1

  const filtered = useMemo(() => {
    let result = absensi
    if (selectedStatuses.size > 0) {
      result = result?.filter((a) => selectedStatuses.has(a.status))
    }
    if (search.trim()) {
      result = result?.filter((a) => {
        const nama = users?.find((u) => u.id === a.userId)?.nama || ''
        return nama.toLowerCase().includes(search.toLowerCase())
      })
    }
    return result
  }, [absensi, selectedStatuses, search, users])

  const toggleStatus = useCallback((status: string) => {
    setSelectedStatuses((prev) => {
      const next = new Set(prev)
      if (next.has(status)) next.delete(status)
      else next.add(status)
      return next
    })
    setPage(1)
  }, [])

  const clearAll = useCallback(() => {
    setQuickDate('hari_ini')
    setCalendarDate(null)
    setSelectedStatuses(new Set())
    setSearch('')
    setPage(1)
  }, [])

  const setQuickDateAndReset = useCallback((preset: QuickDate) => {
    setQuickDate(preset)
    setCalendarDate(null)
    setPage(1)
  }, [])

  const handleDayClick = useCallback((tgl: string) => {
    setCalendarDate(tgl === calendarDate ? null : tgl)
    setQuickDate(null)
    setPage(1)
  }, [calendarDate])

  const hasActiveFilter = calendarDate !== null || selectedStatuses.size > 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Riwayat Kehadiran</h1>
          <p className="text-muted-foreground">Seluruh karyawan</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-2" onClick={() => {
            if (!filtered?.length) return
            exportToCsv('riwayat-seluruh-karyawan-' + new Date().toISOString().split('T')[0],
              ['Karyawan', 'Tanggal', 'Masuk', 'Pulang', 'Status'],
              filtered.map((a) => [users?.find((u) => u.id === a.userId)?.nama || '-', formatCsvDate(a.tanggal), formatCsvTime(a.checkIn), formatCsvTime(a.checkOut), a.status]))
          }}>
            <Download className="h-4 w-4" /> CSV
          </Button>
          <Button variant="outline" size="icon" onClick={() => refetch()} disabled={isFetching}>
            <RefreshCw className={'h-4 w-4' + (isFetching ? ' animate-spin' : '')} />
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          {monthData ? (
            <AttendanceCalendar
              year={curYear}
              month={curMonth}
              data={monthData.data}
              totalKaryawan={monthData.totalKaryawan}
              onDayClick={handleDayClick}
            />
          ) : (
            <Skeleton className="h-[300px] w-full rounded-lg" />
          )}
        </CardContent>
      </Card>

      <div className="space-y-4">
        {calendarDate && (
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Tanggal dipilih:</span>
            <Badge variant="secondary" className="text-sm px-3 py-1">
              {new Date(calendarDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
              <button onClick={() => setCalendarDate(null)} className="ml-2 hover:text-foreground">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground mr-1">Cepat:</span>
          {([
            { label: 'Hari Ini', value: 'hari_ini' as const },
            { label: 'Kemarin', value: 'kemarin' as const },
            { label: '7 Hari', value: '7_hari' as const },
            { label: 'Bulan Ini', value: 'bulan_ini' as const },
          ]).map((preset) => (
            <Button
              key={preset.value}
              variant={quickDate === preset.value && !calendarDate ? 'default' : 'outline'}
              size="sm"
              onClick={() => setQuickDateAndReset(quickDate === preset.value && !calendarDate ? null : preset.value)}
            >
              {preset.label}
            </Button>
          ))}
          {calendarDate && (
            <Button variant="ghost" size="sm" onClick={() => setCalendarDate(null)}>
              <X className="h-3 w-3" /> Hapus tanggal
            </Button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground mr-1">Status:</span>
          {STATUS_OPTIONS.map((opt) => (
            <Button
              key={opt.value}
              variant={selectedStatuses.has(opt.value) ? 'secondary' : 'outline'}
              size="sm"
              className={selectedStatuses.has(opt.value) ? absensiStatusBadge[opt.value] : ''}
              onClick={() => toggleStatus(opt.value)}
            >
              {opt.label}
              {selectedStatuses.has(opt.value) && <X className="h-3 w-3 ml-1" />}
            </Button>
          ))}
        </div>

        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari nama karyawan..."
            className="pl-9"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          />
        </div>

        {hasActiveFilter && (
          <div className="flex items-center gap-2 text-sm">
            <Button variant="ghost" size="sm" onClick={clearAll} className="gap-1">
              <X className="h-3 w-3" /> Hapus semua filter
            </Button>
            <span className="text-muted-foreground">{filtered?.length || 0} hasil</span>
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }, (_, i) => ({ id: 'hr-sk-' + i })).map((item) => <Skeleton key={item.id} className="h-12 w-full rounded-lg" />)}
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
                      <TableCell>{new Date(a.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</TableCell>
                      <TableCell className="text-muted-foreground">{a.checkIn ? new Date(a.checkIn).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '-'}</TableCell>
                      <TableCell className="text-muted-foreground">{a.checkOut ? new Date(a.checkOut).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '-'}</TableCell>
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
    </div>
  )
}
