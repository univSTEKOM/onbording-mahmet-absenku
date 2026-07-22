import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useAbsensiListPaginated } from '@/hooks/useAbsensi'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { EmptyState } from '@/components/shared/EmptyState'
import { Pagination } from '@/components/shared/Pagination'
import { FilterDialog, type FilterValues } from '@/components/shared/FilterDialog'
import { absensiStatusBadge } from '@/lib/constants'
import { exportToCsv, formatCsvDate, formatCsvTime } from '@/lib/export'
import { Download, RefreshCw, Filter, LogIn, LogOut, CheckCircle2, History, Clock } from 'lucide-react'
import type { Absensi } from '@/types'

const PAGE_SIZE = 10
const datePresets = [
  { label: 'Hari Ini', get: () => new Date().toISOString().split('T')[0] },
  { label: '7 Hari', get: () => { const d = new Date(); d.setDate(d.getDate() - 7); return d.toISOString().split('T')[0] } },
  { label: 'Bulan Ini', get: () => { const d = new Date(); d.setDate(1); return d.toISOString().split('T')[0] } },
]

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

export default function RiwayatPage() {
  const { user } = useAuth()
  const [page, setPage] = useState(1)
  const [filterOpen, setFilterOpen] = useState(false)
  const [filter, setFilter] = useState<FilterValues>({ search: '', jenis: '', status: '', dateFrom: '', dateTo: '' })
  const [detail, setDetail] = useState<Absensi | null>(null)

  const { data, isLoading, refetch, isFetching } = useAbsensiListPaginated({
    userId: user?.id,
    _sort: 'tanggal', _order: 'desc',
    _page: page, _limit: PAGE_SIZE,
    ...(filter.status ? { status: filter.status } : {}),
    ...(filter.dateFrom ? { tanggal_gte: filter.dateFrom } : {}),
    ...(filter.dateTo ? { tanggal_lte: filter.dateTo } : {}),
  })

  const absensi = data?.data
  const totalPages = data?.totalPages || 1
  const hasActiveFilter = filter.status || filter.dateFrom || filter.dateTo

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Riwayat Kehadiran</h1>
          <p className="text-muted-foreground">Daftar absensi Anda</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-2" onClick={() => {
            if (!absensi?.length) return
            exportToCsv(`riwayat-absensi-${new Date().toISOString().split('T')[0]}`,
              ['Tanggal', 'Hari', 'Masuk', 'Pulang', 'Durasi', 'Status'],
              absensi.map((a) => [formatCsvDate(a.tanggal), namaHari(a.tanggal), formatCsvTime(a.checkIn), formatCsvTime(a.checkOut), hitungJam(a.checkIn, a.checkOut), a.status]))
          }}>
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
        <span className="text-sm text-muted-foreground">{absensi?.length || 0} hasil</span>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-32 w-full rounded-xl" />)}
        </div>
      ) : absensi?.length ? (
        <>
          <div className="space-y-3">
            {absensi.map((a) => (
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
                        <Badge variant="secondary" className={absensiStatusBadge[a.status]}>{a.status}</Badge>
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
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
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
              {detail.foto && (
                <div className="flex justify-center">
                  <div className="w-32 h-32 rounded-xl overflow-hidden border-2 border-muted">
                    <img src={detail.foto} alt="foto absensi" className="w-full h-full object-cover" />
                  </div>
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
                  <Badge variant="secondary" className={absensiStatusBadge[detail.status]}>{detail.status}</Badge>
                </div>
              </div>
              {detail.faceVerified && (
                <p className="text-xs text-green-600 flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> Wajah terverifikasi</p>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <FilterDialog
        open={filterOpen}
        onOpenChange={setFilterOpen}
        values={filter}
        onApply={(v) => { setFilter(v); setPage(1) }}
        onReset={() => { setFilter({ search: '', jenis: '', status: '', dateFrom: '', dateTo: '' }); setPage(1) }}
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
