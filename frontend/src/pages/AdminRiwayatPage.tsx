import { useState } from 'react'
import { useSearchAbsensi } from '@/hooks/useAbsensi'
import { useMonthAttendance } from '@/hooks/useDashboard'
import { useDebounce } from '@/hooks/useDebounce'
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
import { absensiStatusBadge, absensiStatusLabel, CATEGORY_LABEL } from '@/lib/constants'
import { buildExportWorkbook } from '@/lib/export-templates'
import { exportWorkbook } from '@/lib/export-xlsx'
import { ExportDialog } from '@/components/shared/ExportDialog'
import { ImageViewer } from '@/components/shared/ImageViewer'
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'
import { Download, RefreshCw, X, Search, History, CheckCircle2, LogIn, LogOut, Clock, CalendarDays } from 'lucide-react'
import type { Absensi } from '@/types'
import { formatJam, hitungJam } from '@/lib/utils'
import api from '@/api/axios'

const PAGE_SIZE = 15 /* Admin sees more rows than employee (10) */
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

export default function AdminRiwayatPage() {
  const [page, setPage] = useState(1)
  const [quickDate, setQuickDate] = useState<QuickDate>('hari_ini')
  const [calendarDate, setCalendarDate] = useState<string | null>(null)
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([])
  const [selectedMainCategory, setSelectedMainCategory] = useState('')
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 400)
  const isSearching = search !== debouncedSearch
  const [detail, setDetail] = useState<Absensi | null>(null)
  const [previewImage, setPreviewImage] = useState('')
  const [exportOpen, setExportOpen] = useState(false)

  const { data: users } = useUsers()
  const { data: monthData } = useMonthAttendance(curYear, curMonth + 1)

  const dateFrom = calendarDate || (getDateRange(quickDate)?.dateFrom)
  const dateTo = calendarDate || (getDateRange(quickDate)?.dateTo)

  const queryParams: Record<string, string | number | string[] | undefined> = {
    _sort: 'tanggal',
    _order: 'desc',
    _page: page,
    _limit: PAGE_SIZE,
  }
  if (dateFrom) queryParams.tanggal_gte = dateFrom
  if (dateTo) queryParams.tanggal_lte = dateTo
  if (selectedStatuses.length > 0) queryParams.status = selectedStatuses
  if (selectedMainCategory) queryParams.mainCategory = selectedMainCategory
  if (debouncedSearch) queryParams.q = debouncedSearch

  const { data, isLoading, refetch, isFetching } = useSearchAbsensi(queryParams)

  const absensi = data?.data
  const totalPages = data?.totalPages || 1

  const hasActiveFilter = calendarDate !== null || selectedStatuses.length > 0 || search.trim() !== '' || !!selectedMainCategory

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
    setSelectedMainCategory('')
    setSearch('')
    setPage(1)
  }

  return (
    <div className="space-y-5 md:space-y-6">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight">Riwayat Kehadiran</h1>
          <p className="text-xs md:text-sm text-muted-foreground">Seluruh karyawan</p>
        </div>
        <div className="flex gap-2 shrink-0">
          {/*
            EXPORT — dinonaktifkan sementara.
            Aktifkan: hapus baris `false &&` dan `</div>` di bawah, lalu hapus <div className="hidden"> pembungkus
          */}
          <div className="hidden">
          <Button variant="outline" size="sm" className="gap-2" onClick={function() { setExportOpen(true) }}>
            <Download className="h-4 w-4" /> Export
          </Button>
          </div>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="icon" aria-label="Refresh" onClick={function() { refetch() }} disabled={isFetching}>
                <RefreshCw className={'h-4 w-4' + (isFetching ? ' animate-spin' : '')} />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom"><p>Muat ulang data</p></TooltipContent>
          </Tooltip>
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
          {['', 'physical_present', 'absent_permit', 'absent_unpermit'].map(function(cat) {
            return (
              <button
                key={cat || 'all'}
                type="button"
                onClick={function() { setSelectedMainCategory(selectedMainCategory === cat ? '' : cat); setPage(1) }}
                className={'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ' + (
                  selectedMainCategory === cat
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'border-border text-muted-foreground hover:text-foreground hover:bg-muted'
                )}
              >
                {cat ? CATEGORY_LABEL[cat] || cat : 'Semua'}
              </button>
            )
          })}
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {STATUS_OPTIONS.map(function(opt) {
            return (
              <button
                key={opt.value}
                type="button"
                onClick={function() { toggleStatus(opt.value) }}
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
            )
          })}
        </div>

        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Cari nama karyawan..."
            className={'pl-9 h-9 text-sm ' + (isSearching ? 'pr-8' : '')}
            value={search}
            onChange={function(e) { setSearch(e.target.value); setPage(1) }}
          />
          {isSearching && <span className="absolute right-3 top-1/2 -translate-y-1/2 h-3 w-3 rounded-full border-2 border-primary border-t-transparent animate-spin" />}
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
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2">
          {Array.from({ length: 6 }, function(_, i) { return { id: 'ar-sk-' + i } }).map(function(item) {
            return <Skeleton key={item.id} className="h-24 w-full rounded-xl" />
          })}
        </div>
      ) : absensi && absensi.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2">
          {absensi.map(function(a) {
            const u = users?.find(function(u) { return u.id === a.userId })
            const tgl = new Date(a.tanggal + 'T00:00:00')
            const initials = (u?.nama || '?').charAt(0).toUpperCase()

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
                      <AvatarImage src={u?.foto || undefined} />
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
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="pointer-events-none">
                            <CheckCircle2 className="h-3 w-3 text-emerald-500 ml-auto shrink-0" />
                          </span>
                        </TooltipTrigger>
                        <TooltipContent side="bottom"><p>Wajah terverifikasi</p></TooltipContent>
                      </Tooltip>
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

      {/* DISABLED — Export XLSX. Aktifkan: hapus <div className="hidden"> */}
      <div className="hidden">
      <ExportDialog
        open={exportOpen}
        onOpenChange={setExportOpen}
        initialFilters={{ mainCategory: selectedMainCategory, statuses: selectedStatuses as import('@/types').AbsensiStatus[] }}
        onExport={async function(from, to, filters) {
          try {
            var params: Record<string, string | string[]> = { _sort: 'tanggal', _order: 'desc' }
            if (from) params.tanggal_gte = from
            if (to) params.tanggal_lte = to
            if (filters.mainCategory) params.mainCategory = filters.mainCategory
            if (filters.statuses.length > 0) params.status = filters.statuses
            var res = await api.get('/absensi', { params: params })
            var allData = (res.data || []) as Absensi[]
            if (!allData.length) return
            var data = allData.map(function(a) {
              var u = users?.find(function(u) { return u.id === a.userId })
              return { nama: u?.nama || '-', tanggal: a.tanggal, checkIn: a.checkIn, checkOut: a.checkOut, status: a.status, subCategory: a.subCategory, mainCategory: a.mainCategory }
            })
            var wb = await buildExportWorkbook(data, from, to, true)
            await exportWorkbook(wb, 'laporan-absensi-' + new Date().toISOString().split('T')[0])
            setExportOpen(false)
          } catch (e) {
            console.error('Export gagal:', e)
          }
        }}
      />
      </div>
    </div>
  )
}

