import { useState, useMemo } from 'react'
import { useAbsensiListPaginated } from '@/hooks/useAbsensi'
import { useMonthAttendance } from '@/hooks/useDashboard'
import { useUsers } from '@/hooks/useUsers'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import { CalendarCard } from '@/components/CalendarCard'
import { EmptyState } from '@/components/shared/EmptyState'
import { Pagination } from '@/components/shared/Pagination'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { absensiStatusBadge, absensiStatusLabel } from '@/lib/constants'
import { exportToCsv, formatCsvDate, formatCsvTime } from '@/lib/export'
import { Download, RefreshCw, X, Search, History, CheckCircle2, LogIn, LogOut, Clock } from 'lucide-react'
import type { Absensi } from '@/types'

var PAGE_SIZE = 15
var curMonth = new Date().getMonth()
var curYear = new Date().getFullYear()

var STATUS_OPTIONS = [
  { value: 'hadir', label: 'Hadir' },
  { value: 'terlambat', label: 'Terlambat' },
  { value: 'pulang_cepat', label: 'Pulang Cepat' },
  { value: 'izin', label: 'Izin' },
  { value: 'sakit', label: 'Sakit' },
  { value: 'cuti', label: 'Cuti' },
] as const

type QuickDate = 'hari_ini' | 'kemarin' | '7_hari' | 'bulan_ini' | null

function formatJam(iso: string | null): string {
  if (!iso) return '-'
  return new Date(iso).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
}

function hitungJam(checkIn: string | null, checkOut: string | null): string {
  if (!checkIn) return '-'
  var selisih = Math.max(0, (checkOut ? new Date(checkOut).getTime() : Date.now()) - new Date(checkIn).getTime())
  var jam = Math.floor(selisih / (1000 * 60 * 60))
  var menit = Math.floor((selisih % (1000 * 60 * 60)) / (1000 * 60))
  return jam + 'j ' + menit + 'm'
}

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

export default function AdminRiwayatPage() {
  var { data: users } = useUsers()
  var [page, setPage] = useState(1)
  var [quickDate, setQuickDate] = useState<QuickDate>('hari_ini')
  var [calendarDate, setCalendarDate] = useState<string | null>(null)
  var [selectedStatuses, setSelectedStatuses] = useState<Set<string>>(new Set())
  var [search, setSearch] = useState('')
  var [detail, setDetail] = useState<Absensi | null>(null)

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
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2">
          {Array.from({ length: 6 }, function(_, i) { return { id: 'ar-sk-' + i } }).map(function(item) {
            return <Skeleton key={item.id} className="h-24 w-full rounded-xl" />
          })}
        </div>
      ) : filtered && filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2">
          {filtered.map(function(a) {
            var u = users?.find(function(u) { return u.id === a.userId })
            var tgl = new Date(a.tanggal + 'T00:00:00')
            var initials = (u?.nama || '?').charAt(0).toUpperCase()

            return (
              <div
                key={a.id}
                className="rounded-xl border border-border bg-card hover:border-primary/30 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
                onClick={function() { setDetail(a) }}
              >
                <div className="p-3">
                  <div className="flex items-center gap-2.5">
                    <div className="flex flex-col items-center w-8 shrink-0">
                      <span className="text-[9px] text-muted-foreground leading-none">{tgl.toLocaleDateString('id-ID', { weekday: 'short' })}</span>
                      <span className="text-sm font-bold leading-tight">{tgl.getDate()}</span>
                      <span className="text-[9px] text-muted-foreground leading-none">{tgl.toLocaleDateString('id-ID', { month: 'short' })}</span>
                    </div>

                    <Avatar className="h-8 w-8 ring-2 ring-border/50 shrink-0">
                      <AvatarImage src={u?.foto && !u.foto.startsWith('[') ? u.foto : undefined} />
                      <AvatarFallback className="text-xs bg-muted text-muted-foreground">{initials}</AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1.5">
                        <p className="text-sm font-semibold truncate">{u?.nama || '-'}</p>
                        <Badge variant="secondary" className={absensiStatusBadge[a.status] + ' shrink-0'}>{absensiStatusLabel[a.status]}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{u?.email || '-'}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mt-2 pt-2 border-t border-border/40">
                    <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                      <LogIn className="h-3 w-3 text-emerald-600" />
                      {formatJam(a.checkIn)}
                    </div>
                    <span className="text-muted-foreground/30">|</span>
                    <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                      <LogOut className="h-3 w-3 text-red-600" />
                      {formatJam(a.checkOut)}
                    </div>
                    {a.checkIn && (
                      <>
                        <span className="text-muted-foreground/30">|</span>
                        <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                          <Clock className="h-3 w-3 text-blue-600" />
                          {hitungJam(a.checkIn, a.checkOut)}
                        </div>
                      </>
                    )}
                    {a.faceVerified && (
                      <CheckCircle2 className="h-3 w-3 text-emerald-500 ml-auto shrink-0" />
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <EmptyState message={hasActiveFilter ? 'Tidak ditemukan' : 'Belum ada data absensi'} icon={History} />
      )}

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />

      <Dialog open={!!detail} onOpenChange={function(o) { if (!o) setDetail(null) }}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Detail Absensi</DialogTitle>
            <DialogDescription>
              {detail && new Date(detail.tanggal).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </DialogDescription>
          </DialogHeader>
          {detail && (
            <div className="space-y-4">
              {detail.photos && detail.photos.length > 0 && (
                <div className="grid grid-cols-2 gap-3">
                  {detail.photos.map(function(p) {
                    return (
                      <div key={p.type + p.capturedAt}>
                        <p className="text-xs text-muted-foreground mb-1 capitalize">{p.type === 'check_in' ? 'Check In' : 'Check Out'}</p>
                        <div className="rounded-lg overflow-hidden border">
                          <img src={p.url} alt={p.type} className="w-full aspect-[4/3] object-cover" />
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="p-3 rounded-lg bg-muted">
                  <p className="text-xs text-muted-foreground">Check In</p>
                  <p className="font-medium">{detail.checkIn ? formatJam(detail.checkIn) : '-'}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted">
                  <p className="text-xs text-muted-foreground">Check Out</p>
                  <p className="font-medium">{detail.checkOut ? formatJam(detail.checkOut) : '-'}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted">
                  <p className="text-xs text-muted-foreground">Durasi</p>
                  <p className="font-medium">{hitungJam(detail.checkIn, detail.checkOut)}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted">
                  <p className="text-xs text-muted-foreground">Status</p>
                  <Badge variant="secondary" className={absensiStatusBadge[detail.status]}>{absensiStatusLabel[detail.status]}</Badge>
                </div>
              </div>
              {detail.faceVerified && (
                <p className="text-xs text-emerald-600 flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> Wajah terverifikasi</p>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
