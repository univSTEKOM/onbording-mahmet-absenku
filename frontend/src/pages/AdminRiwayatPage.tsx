import { useState, useMemo } from 'react'
import { useAbsensiListPaginated } from '@/hooks/useAbsensi'
import { useMonthAttendance } from '@/hooks/useDashboard'
import { useUsers } from '@/hooks/useUsers'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { CalendarCard } from '@/components/CalendarCard'
import { EmptyState } from '@/components/shared/EmptyState'
import { Pagination } from '@/components/shared/Pagination'
import { UserLink } from '@/components/pengguna/UserLink'
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
  var today = new Date().toISOString().split('T')[0]
  switch (preset) {
    case 'hari_ini':
      return { dateFrom: today, dateTo: today }
    case 'kemarin': {
      var d = new Date(); d.setDate(d.getDate() - 1)
      return { dateFrom: d.toISOString().split('T')[0], dateTo: d.toISOString().split('T')[0] }
    }
    case '7_hari': {
      var d = new Date(); d.setDate(d.getDate() - 7)
      return { dateFrom: d.toISOString().split('T')[0], dateTo: today }
    }
    case 'bulan_ini': {
      var d = new Date(); d.setDate(1)
      return { dateFrom: d.toISOString().split('T')[0], dateTo: today }
    }
  }
}

function formatJam(iso: string | null): string {
  if (!iso) return '-'
  return new Date(iso).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
}

export default function AdminRiwayatPage() {
  var { data: users } = useUsers()
  var [page, setPage] = useState(1)
  var [quickDate, setQuickDate] = useState<QuickDate>('hari_ini')
  var [calendarDate, setCalendarDate] = useState<string | null>(null)
  var [selectedStatuses, setSelectedStatuses] = useState<Set<string>>(new Set())
  var [search, setSearch] = useState('')

  var { data: monthData } = useMonthAttendance(curYear, curMonth + 1)

  var dateRange = useMemo(function() {
    if (calendarDate) return { dateFrom: calendarDate, dateTo: calendarDate }
    return getDateRange(quickDate)
  }, [quickDate, calendarDate])

  var { data, isLoading, refetch, isFetching } = useAbsensiListPaginated({
    _sort: 'tanggal', _order: 'desc',
    _page: page, _limit: PAGE_SIZE,
    ...(dateRange ? { tanggal_gte: dateRange.dateFrom } : {}),
    ...(dateRange ? { tanggal_lte: dateRange.dateTo } : {}),
  })

  var absensi = data?.data
  var totalPages = data?.totalPages || 1

  var filtered = useMemo(function() {
    var result = absensi
    if (selectedStatuses.size > 0) {
      result = result?.filter(function(a) { return selectedStatuses.has(a.status) })
    }
    if (search.trim()) {
      result = result?.filter(function(a) {
        var nama = users?.find(function(u) { return u.id === a.userId })?.nama || ''
        return nama.toLowerCase().includes(search.toLowerCase())
      })
    }
    return result
  }, [absensi, selectedStatuses, search, users])

  function toggleStatus(status: string) {
    var next = new Set(selectedStatuses)
    if (next.has(status)) next.delete(status)
    else next.add(status)
    setSelectedStatuses(next)
    setPage(1)
  }

  function clearAll() {
    setQuickDate('hari_ini')
    setCalendarDate(null)
    setSelectedStatuses(new Set())
    setSearch('')
    setPage(1)
  }

  var hasActiveFilter = calendarDate !== null || selectedStatuses.size > 0 || search.trim() !== ''

  return (
    <div className="space-y-5 md:space-y-6">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight">Riwayat Kehadiran</h1>
          <p className="text-xs md:text-sm text-muted-foreground">Seluruh karyawan</p>
        </div>
        <div className="flex gap-2 shrink-0">
          <Button variant="outline" size="sm" className="gap-2" onClick={function() {
            if (!filtered?.length) return
            exportToCsv('riwayat-seluruh-karyawan-' + new Date().toISOString().split('T')[0],
              ['Karyawan', 'Tanggal', 'Masuk', 'Pulang', 'Status'],
              filtered.map(function(a) {
                return [users?.find(function(u) { return u.id === a.userId })?.nama || '-', formatCsvDate(a.tanggal), formatCsvTime(a.checkIn), formatCsvTime(a.checkOut), a.status]
              }))
          }}>
            <Download className="h-4 w-4" /> CSV
          </Button>
          <Button variant="outline" size="icon" onClick={function() { refetch() }} disabled={isFetching}>
            <RefreshCw className={'h-4 w-4' + (isFetching ? ' animate-spin' : '')} />
          </Button>
        </div>
      </div>

      {monthData ? (
        <CalendarCard
          year={curYear}
          month={curMonth}
          data={monthData.data}
          totalKaryawan={monthData.totalKaryawan}
          selectedDate={calendarDate}
          onSelectedDateChange={function(tgl) {
            if (tgl === calendarDate) {
              setCalendarDate(null)
              setQuickDate('hari_ini')
            } else {
              setCalendarDate(tgl)
              setQuickDate(null)
            }
            setPage(1)
          }}
        />
      ) : (
        <Skeleton className="h-[260px] md:h-[300px] w-full rounded-lg" />
      )}

      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          {([
            { label: 'Hari Ini', value: 'hari_ini' as const },
            { label: 'Kemarin', value: 'kemarin' as const },
            { label: '7 Hari', value: '7_hari' as const },
            { label: 'Bulan Ini', value: 'bulan_ini' as const },
          ]).map(function(preset) {
            return (
              <Button
                key={preset.value}
                variant={quickDate === preset.value && !calendarDate ? 'default' : 'outline'}
                size="xs"
                onClick={function() { setQuickDate(quickDate === preset.value && !calendarDate ? null : preset.value); setCalendarDate(null); setPage(1) }}
              >
                {preset.label}
              </Button>
            )
          })}
          {calendarDate && (
            <Button variant="ghost" size="xs" onClick={function() { setCalendarDate(null) }}>
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {STATUS_OPTIONS.map(function(opt) {
            return (
              <button
                key={opt.value}
                type="button"
                onClick={function() { toggleStatus(opt.value) }}
                className={'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ' + (
                  selectedStatuses.has(opt.value)
                    ? (absensiStatusBadge[opt.value] + ' border-transparent')
                    : 'border-border text-muted-foreground hover:text-foreground hover:bg-muted'
                )}
              >
                <span className={'w-1.5 h-1.5 rounded-full ' + (selectedStatuses.has(opt.value) ? 'bg-current' : 'bg-muted-foreground/40')} />
                {opt.label}
                {selectedStatuses.has(opt.value) && <X className="h-3 w-3" />}
              </button>
            )
          })}
        </div>

        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Cari nama karyawan..."
            className="pl-9 h-9 text-sm"
            value={search}
            onChange={function(e) { setSearch(e.target.value); setPage(1) }}
          />
        </div>

        {hasActiveFilter && (
          <div className="flex items-center gap-2 text-xs">
            <Button variant="ghost" size="xs" onClick={clearAll} className="gap-1 text-muted-foreground">
              <X className="h-3 w-3" /> Hapus filter
            </Button>
            <span className="text-muted-foreground">{filtered?.length || 0} hasil</span>
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }, function(_, i) { return { id: 'hr-sk-' + i } }).map(function(item) {
            return <Skeleton key={item.id} className="h-12 w-full rounded-lg" />
          })}
        </div>
      ) : filtered && filtered.length > 0 ? (
        <div className="overflow-x-auto -mx-4 md:-mx-6">
          <div className="min-w-[600px] px-4 md:px-6">
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
                  {filtered.map(function(a) {
                    var user = users?.find(function(u) { return u.id === a.userId })
                    var nama = user?.nama || '-'
                    return (
                      <TableRow key={a.id} className="hover:bg-muted/30 transition-colors">
                        <TableCell>
                          {user ? <UserLink user={user} showAvatar={false} /> : <span className="font-medium">{nama}</span>}
                        </TableCell>
                        <TableCell className="whitespace-nowrap">{new Date(a.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</TableCell>
                        <TableCell className="text-muted-foreground whitespace-nowrap">{formatJam(a.checkIn)}</TableCell>
                        <TableCell className="text-muted-foreground whitespace-nowrap">{formatJam(a.checkOut)}</TableCell>
                        <TableCell>
                          <Badge variant="secondary" className={absensiStatusBadge[a.status]}>{absensiStatusLabel[a.status]}</Badge>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      ) : (
        <EmptyState message={hasActiveFilter ? 'Tidak ditemukan' : 'Belum ada data absensi'} />
      )}

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  )
}
