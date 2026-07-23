import { useState, useMemo, useCallback } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useAbsensiListPaginated, useAbsensiList } from '@/hooks/useAbsensi'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { AttendanceCalendar, DayDetailDialog } from '@/components/AttendanceCalendar'
import { EmptyState } from '@/components/shared/EmptyState'
import { Pagination } from '@/components/shared/Pagination'
import { absensiStatusBadge, absensiStatusLabel } from '@/lib/constants'
import { exportToCsv, formatCsvDate, formatCsvTime } from '@/lib/export'
import { Download, RefreshCw, LogIn, LogOut, CheckCircle2, History, Clock, X } from 'lucide-react'
import type { Absensi } from '@/types'
import type { DayAttendanceData } from '@/api/dashboard'

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
  if (!checkIn || !checkOut) return '-'
  const selisih = Math.max(0, new Date(checkOut).getTime() - new Date(checkIn).getTime())
  const jam = Math.floor(selisih / (1000 * 60 * 60))
  const menit = Math.floor((selisih % (1000 * 60 * 60)) / (1000 * 60))
  return `${jam}j ${menit}m`
}

function namaHari(tanggal: string): string {
  return new Date(tanggal).toLocaleDateString('id-ID', { weekday: 'long' })
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
  const [quickDate, setQuickDate] = useState<QuickDate>(null)
  const [selectedStatuses, setSelectedStatuses] = useState<Set<string>>(new Set())
  const [detail, setDetail] = useState<Absensi | null>(null)
  const [detailDate, setDetailDate] = useState<string | null>(null)

  const dateRange = useMemo(() => getDateRange(quickDate), [quickDate])

  const { data: monthAbsensi } = useAbsensiList({
    userId: user?.id,
    _sort: 'tanggal',
    _order: 'desc',
    tanggal_gte: `${curYear}-${String(curMonth + 1).padStart(2, '0')}-01`,
    tanggal_lte: `${curYear}-${String(curMonth + 1).padStart(2, '0')}-31`,
  })

  const { data: dayDetail } = useAbsensiList(
    detailDate ? { userId: user?.id, tanggal: detailDate } : undefined,
  )

  const { data, isLoading, refetch, isFetching } = useAbsensiListPaginated({
    userId: user?.id,
    _sort: 'tanggal', _order: 'desc',
    _page: page, _limit: PAGE_SIZE,
    ...(dateRange ? { tanggal_gte: dateRange.dateFrom } : {}),
    ...(dateRange ? { tanggal_lte: dateRange.dateTo } : {}),
  })

  const absensi = data?.data
  const totalPages = data?.totalPages || 1

  const filtered = useMemo(() => {
    if (!absensi || selectedStatuses.size === 0) return absensi
    return absensi.filter((a) => selectedStatuses.has(a.status))
  }, [absensi, selectedStatuses])

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
    setQuickDate(null)
    setSelectedStatuses(new Set())
    setPage(1)
  }, [])

  const setQuickDateAndReset = useCallback((preset: QuickDate) => {
    setQuickDate(preset)
    setPage(1)
  }, [])

  const hasActiveFilter = quickDate !== null || selectedStatuses.size > 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Riwayat Kehadiran</h1>
          <p className="text-muted-foreground">Daftar absensi Anda</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-2" onClick={() => {
            if (!filtered?.length) return
            exportToCsv('riwayat-absensi-' + new Date().toISOString().split('T')[0],
              ['Tanggal', 'Hari', 'Masuk', 'Pulang', 'Durasi', 'Status'],
              filtered.map((a) => [formatCsvDate(a.tanggal), namaHari(a.tanggal), formatCsvTime(a.checkIn), formatCsvTime(a.checkOut), hitungJam(a.checkIn, a.checkOut), a.status]))
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
          <AttendanceCalendar
            year={curYear}
            month={curMonth}
            data={Object.entries(
              (monthAbsensi || []).reduce<Record<string, DayAttendanceData>>((acc, a) => {
                if (!acc[a.tanggal]) acc[a.tanggal] = { tanggal: a.tanggal, hadir: 0, terlambat: 0, checkInOnly: 0, izin: 0, tidakHadir: 0 }
                if (a.status === 'hadir') acc[a.tanggal].hadir++
                else if (a.status === 'terlambat') acc[a.tanggal].terlambat++
                else if (['izin', 'sakit', 'cuti'].includes(a.status)) acc[a.tanggal].izin++
                if (a.checkIn && !a.checkOut) acc[a.tanggal].checkInOnly++
                return acc
              }, {})
            ).map(([_, v]) => v)}
            onDayClick={(tgl) => setDetailDate(tgl)}
          />
        </CardContent>
      </Card>

      {detailDate && dayDetail?.[0] && (
        <DayDetailDialog
          tanggal={detailDate}
          userStatus={{
            status: dayDetail[0].status,
            checkIn: dayDetail[0].checkIn,
            checkOut: dayDetail[0].checkOut,
          }}
          onClose={() => setDetailDate(null)}
        />
      )}

      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground mr-1">Tanggal:</span>
          {([
            { label: 'Hari Ini', value: 'hari_ini' as const },
            { label: 'Kemarin', value: 'kemarin' as const },
            { label: '7 Hari', value: '7_hari' as const },
            { label: 'Bulan Ini', value: 'bulan_ini' as const },
          ]).map((preset) => (
            <Button
              key={preset.value}
              variant={quickDate === preset.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => setQuickDateAndReset(quickDate === preset.value ? null : preset.value)}
            >
              {preset.label}
            </Button>
          ))}
          {quickDate !== null && (
            <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground" onClick={() => setQuickDateAndReset(null)}>
              <X className="h-3 w-3" /> Hapus
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
          {Array.from({ length: 3 }, (_, i) => ({ id: 'rw-sk-' + i })).map((item) => <Skeleton key={item.id} className="h-32 w-full rounded-xl" />)}
        </div>
      ) : filtered?.length ? (
        <>
          <div className="space-y-3">
            {filtered.map((a) => (
              <Card key={a.id} className="hover:bg-muted/30 transition-colors cursor-pointer" onClick={() => setDetail(a)}>
                <CardContent className="py-4">
                  <div className="flex items-start gap-4">
                    <div className="flex flex-col items-center justify-center w-10 h-10 rounded-lg bg-primary/10 text-primary shrink-0">
                      <span className="text-xs font-bold leading-none">{new Date(a.tanggal).getDate()}</span>
                      <span className="text-[10px] leading-none mt-0.5">{new Date(a.tanggal).toLocaleDateString('id-ID', { month: 'short' })}</span>
                    </div>
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <p className="text-sm font-medium">{new Date(a.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                          <p className="text-xs text-muted-foreground">{namaHari(a.tanggal)}</p>
                        </div>
                        <Badge variant="secondary" className={absensiStatusBadge[a.status]}>{absensiStatusLabel[a.status]}</Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <div className="flex items-center gap-1.5 p-1.5 rounded-lg bg-muted/50">
                          <LogIn className="h-3 w-3 text-green-600 shrink-0" />
                          <div className="min-w-0">
                            <p className="text-[10px] text-muted-foreground leading-none">Masuk</p>
                            <p className="text-xs font-medium leading-tight truncate">{a.checkIn ? new Date(a.checkIn).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '-'}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 p-1.5 rounded-lg bg-muted/50">
                          <LogOut className="h-3 w-3 text-red-600 shrink-0" />
                          <div className="min-w-0">
                            <p className="text-[10px] text-muted-foreground leading-none">Pulang</p>
                            <p className="text-xs font-medium leading-tight truncate">{a.checkOut ? new Date(a.checkOut).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '-'}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 p-1.5 rounded-lg bg-muted/50">
                          <Clock className="h-3 w-3 text-blue-600 shrink-0" />
                          <div className="min-w-0">
                            <p className="text-[10px] text-muted-foreground leading-none">Durasi</p>
                            <p className="text-xs font-medium leading-tight truncate">{hitungJam(a.checkIn, a.checkOut)}</p>
                          </div>
                        </div>
                      </div>
                      {a.faceVerified && <p className="text-xs text-green-600 flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> Wajah terverifikasi</p>}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          {!hasActiveFilter && <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />}
        </>
      ) : (
        <EmptyState message={hasActiveFilter ? 'Tidak ditemukan' : 'Belum ada riwayat absensi'} icon={History} />
      )}

      <Dialog open={!!detail} onOpenChange={(o) => { if (!o) setDetail(null) }}>
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
                  {detail.photos.map((p) => (
                    <div key={p.type + p.capturedAt}>
                      <p className="text-xs text-muted-foreground mb-1 capitalize">{p.type === 'check_in' ? 'Check In' : 'Check Out'}</p>
                      <div className="rounded-lg overflow-hidden border">
                        <img src={p.url} alt={p.type} className="w-full aspect-[4/3] object-cover" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="p-3 rounded-lg bg-muted">
                  <p className="text-xs text-muted-foreground">Check In</p>
                  <p className="font-medium">{detail.checkIn ? new Date(detail.checkIn).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '-'}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted">
                  <p className="text-xs text-muted-foreground">Check Out</p>
                  <p className="font-medium">{detail.checkOut ? new Date(detail.checkOut).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '-'}</p>
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
                <p className="text-xs text-green-600 flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> Wajah terverifikasi</p>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
