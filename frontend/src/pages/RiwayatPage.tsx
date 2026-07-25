import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useAbsensiListPaginated, useAbsensiList } from '@/hooks/useAbsensi'
import { useMonthAttendance } from '@/hooks/useDashboard'
import { useAllPengajuan } from '@/hooks/usePengajuan'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { AttendanceCalendar, DayDetailDialog } from '@/components/AttendanceCalendar'
import { EmptyState } from '@/components/shared/EmptyState'
import { Pagination } from '@/components/shared/Pagination'
import { absensiStatusBadge, absensiStatusLabel, STATUS_COLORS_MAP } from '@/lib/constants'
import { exportToCsv, formatCsvDate, formatCsvTime } from '@/lib/export'
import { ImageViewer } from '@/components/shared/ImageViewer'
import { Download, RefreshCw, CheckCircle2, History, CalendarDays, X } from 'lucide-react'
import type { Absensi } from '@/types'

const PAGE_SIZE = 10
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

function hitungJam(checkIn: string | null, checkOut: string | null): string {
  if (!checkIn) return '-'
  const selisih = Math.max(0, (checkOut ? new Date(checkOut).getTime() : Date.now()) - new Date(checkIn).getTime())
  const jam = Math.floor(selisih / (1000 * 60 * 60))
  const menit = Math.floor((selisih % (1000 * 60 * 60)) / (1000 * 60))
  return `${jam}j ${menit}m`
}

function formatJam(iso: string | null): string {
  if (!iso) return '-'
  return new Date(iso).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
}

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

export default function RiwayatPage() {
  const { user } = useAuth()
  const [page, setPage] = useState(1)
  const [quickDate, setQuickDate] = useState<QuickDate>('hari_ini')
  const [calendarDate, setCalendarDate] = useState<string | null>(null)
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([])
  const [detail, setDetail] = useState<Absensi | null>(null)
  const [detailDate, setDetailDate] = useState<string | null>(null)
  const [previewImage, setPreviewImage] = useState('')

  var dateFrom = calendarDate || (getDateRange(quickDate)?.dateFrom)
  var dateTo = calendarDate || (getDateRange(quickDate)?.dateTo)

  const { data: monthData } = useMonthAttendance(curYear, curMonth + 1, user?.id)
  const { data: allPengajuan } = useAllPengajuan()
  const { data: dayDetail } = useAbsensiList(
    detailDate ? { userId: user?.id, tanggal: detailDate } : undefined,
  )

  const dayPengajuan = detailDate && allPengajuan
    ? allPengajuan.find(function(p) { return p.status === 'approved' && p.userId === user?.id && p.tanggalMulai <= detailDate && p.tanggalSelesai >= detailDate })
    : null

  const { data, isLoading, refetch, isFetching } = useAbsensiListPaginated({
    userId: user?.id,
    _sort: 'tanggal', _order: 'desc',
    _page: page, _limit: PAGE_SIZE,
    ...(dateFrom ? { tanggal_gte: dateFrom } : {}),
    ...(dateTo ? { tanggal_lte: dateTo } : {}),
    ...(selectedStatuses.length > 0 ? { status: selectedStatuses } : {}),
  })

  const absensi = data?.data
  const totalPages = data?.totalPages || 1

  const hasActiveFilter = calendarDate !== null || selectedStatuses.length > 0

  function toggleStatus(status: string) {
    setSelectedStatuses(function(prev) {
      if (prev.includes(status)) return prev.filter(function(s) { return s !== status })
      return [...prev, status]
    })
    setPage(1)
  }

  function clearAll() {
    setQuickDate('hari_ini')
    setCalendarDate(null)
    setSelectedStatuses([])
    setPage(1)
  }

  function setQuickDateFn(preset: QuickDate) {
    setQuickDate(preset)
    setCalendarDate(null)
    setPage(1)
  }

  function handleDayClick(tgl: string) {
    setCalendarDate(tgl === calendarDate ? null : tgl)
    setQuickDate(null)
    setPage(1)
  }

  return (
    <div className="space-y-5 md:space-y-6">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight">Riwayat Kehadiran</h1>
          <p className="text-xs md:text-sm text-muted-foreground">Daftar absensi Anda</p>
        </div>
        <div className="flex gap-2 shrink-0">
          <Button variant="outline" size="sm" className="gap-2" onClick={() => {
            if (!absensi?.length) return
            exportToCsv('riwayat-absensi-' + new Date().toISOString().split('T')[0],
              ['Tanggal', 'Masuk', 'Pulang', 'Durasi', 'Status'],
              absensi.map((a) => [formatCsvDate(a.tanggal), formatCsvTime(a.checkIn), formatCsvTime(a.checkOut), hitungJam(a.checkIn, a.checkOut), a.status]))
          }}>
            <Download className="h-4 w-4" /> CSV
          </Button>
          <Button variant="outline" size="icon" onClick={() => refetch()} disabled={isFetching}>
            <RefreshCw className={'h-4 w-4' + (isFetching ? ' animate-spin' : '')} />
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-4 md:p-5">
          {monthData ? (
            <AttendanceCalendar
              year={curYear}
              month={curMonth}
              data={monthData.data}
              onDayClick={handleDayClick}
            />
          ) : (
            <Skeleton className="h-[260px] md:h-[300px] w-full rounded-lg" />
          )}
        </CardContent>
      </Card>

      {detailDate && (
        <DayDetailDialog
          tanggal={detailDate}
          userStatus={dayDetail?.[0] ? {
            status: dayDetail[0].status,
            checkIn: dayDetail[0].checkIn,
            checkOut: dayDetail[0].checkOut,
            photos: dayDetail[0].photos,
          } : undefined}
          pengajuan={dayPengajuan || undefined}
          onClose={() => setDetailDate(null)}
        />
      )}

      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          {([
            { label: 'Hari Ini', value: 'hari_ini' as const },
            { label: 'Kemarin', value: 'kemarin' as const },
            { label: '7 Hari', value: '7_hari' as const },
            { label: 'Bulan Ini', value: 'bulan_ini' as const },
          ]).map((preset) => (
            <Button
              key={preset.value}
              variant={quickDate === preset.value && !calendarDate ? 'default' : 'outline'}
              size="xs"
              onClick={() => setQuickDateFn(quickDate === preset.value && !calendarDate ? null : preset.value)}
            >
              {preset.label}
            </Button>
          ))}
          {calendarDate && (
            <Badge variant="secondary" className="text-xs gap-1 px-2 py-0.5">
              <CalendarDays className="h-3 w-3" />
              {new Date(calendarDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
              <button onClick={() => setCalendarDate(null)} className="hover:text-foreground ml-0.5">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {STATUS_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => toggleStatus(opt.value)}
              className={'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ' + (
                selectedStatuses.includes(opt.value)
                  ? (absensiStatusBadge[opt.value] + ' border-transparent')
                  : 'border-border text-muted-foreground hover:text-foreground hover:bg-muted'
              )}
            >
              <span className={'w-1.5 h-1.5 rounded-full ' + (selectedStatuses.includes(opt.value) ? 'bg-current' : 'bg-muted-foreground/40')} />
              {opt.label}
              {selectedStatuses.includes(opt.value) && <X className="h-3 w-3" />}
            </button>
          ))}
        </div>

        {hasActiveFilter && (
          <div className="flex items-center gap-2 text-xs">
            <Button variant="ghost" size="xs" onClick={clearAll} className="gap-1 text-muted-foreground">
              <X className="h-3 w-3" /> Hapus filter
            </Button>
            <span className="text-muted-foreground">{absensi?.length || 0} hasil</span>
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }, function(_, i) { return { id: 'rw-sk-' + i } }).map(function(item) {
            return <Skeleton key={item.id} className="h-24 w-full rounded-xl" />
          })}
        </div>
      ) : absensi && absensi.length > 0 ? (
        <div className="space-y-2">
          {absensi.map(function(a) {
            var tgl = new Date(a.tanggal + 'T00:00:00')
            return (
              <Card
                key={a.id}
                className="hover:bg-muted/30 transition-colors cursor-pointer"
                onClick={function() { setDetail(a) }}
              >
                <CardContent className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col items-center w-9 shrink-0">
                      <span className="text-[10px] text-muted-foreground leading-none">{tgl.toLocaleDateString('id-ID', { weekday: 'short' })}</span>
                      <span className="text-base font-bold leading-tight">{tgl.getDate()}</span>
                      <span className="text-[10px] text-muted-foreground leading-none">{tgl.toLocaleDateString('id-ID', { month: 'short' })}</span>
                    </div>
                    <div className="flex-1 min-w-0 grid grid-cols-3 gap-1.5 text-center">
                      <div>
                        <p className="text-[10px] text-muted-foreground">Masuk</p>
                        <p className="text-xs font-medium">{formatJam(a.checkIn)}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-muted-foreground">Pulang</p>
                        <p className="text-xs font-medium">{formatJam(a.checkOut)}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-muted-foreground">Durasi</p>
                        <p className="text-xs font-medium">{hitungJam(a.checkIn, a.checkOut)}</p>
                      </div>
                    </div>
                    <div className="shrink-0 flex flex-col items-center gap-0.5">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: STATUS_COLORS_MAP[a.status] || '#999' }} />
                      <span className="text-[10px] font-medium text-muted-foreground">
                        {absensiStatusLabel[a.status]}
                      </span>
                    </div>
                  </div>
                  {a.faceVerified && (
                    <div className="flex items-center gap-1 mt-1.5 text-[10px] text-emerald-600 justify-end">
                      <CheckCircle2 className="h-3 w-3" /> Wajah terverifikasi
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      ) : (
        <EmptyState message={hasActiveFilter ? 'Tidak ditemukan' : 'Belum ada riwayat absensi'} icon={History} />
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
                        <div className="rounded-lg overflow-hidden border cursor-pointer hover:opacity-80 transition-opacity" onClick={function() { setPreviewImage(p.url) }}>
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

      <ImageViewer open={!!previewImage} imageUrl={previewImage} onClose={function() { setPreviewImage('') }} />
    </div>
  )
}
