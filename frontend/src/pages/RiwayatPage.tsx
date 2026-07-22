import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useAbsensiListPaginated } from '@/hooks/useAbsensi'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/shared/EmptyState'
import { Pagination } from '@/components/shared/Pagination'
import { FilterDialog, type FilterValues } from '@/components/shared/FilterDialog'
import { absensiStatusBadge } from '@/lib/constants'
import { exportToCsv, formatCsvDate, formatCsvTime } from '@/lib/export'
import { Download, RefreshCw, Filter, Clock, LogIn, LogOut, CheckCircle2, History } from 'lucide-react'

const PAGE_SIZE = 10
const datePresets = [
  { label: 'Hari Ini', get: () => new Date().toISOString().split('T')[0] },
  { label: '7 Hari', get: () => { const d = new Date(); d.setDate(d.getDate() - 7); return d.toISOString().split('T')[0] } },
  { label: 'Bulan Ini', get: () => { const d = new Date(); d.setDate(1); return d.toISOString().split('T')[0] } },
]

function hitungJam(checkIn: string | null, checkOut: string | null): string {
  if (!checkIn || !checkOut) return '-'
  const masuk = new Date(checkIn).getTime()
  const pulang = new Date(checkOut).getTime()
  const selisih = Math.max(0, pulang - masuk)
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
              absensi.map((a) => [formatCsvDate(a.tanggal), namaHari(a.tanggal), formatCsvTime(a.checkIn), formatCsvTime(a.checkOut), hitungJam(a.checkIn, a.checkOut), a.status])
            )
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
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full rounded-xl" />
          ))}
        </div>
      ) : absensi?.length ? (
        <>
          <div className="space-y-3">
            {absensi.map((a) => {
              const totalJam = hitungJam(a.checkIn, a.checkOut)
              return (
                <Card key={a.id} className="hover:bg-muted/30 transition-colors">
                  <CardContent className="py-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-3 flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <div className="flex flex-col items-center justify-center w-10 h-10 rounded-lg bg-primary/10 text-primary">
                              <span className="text-xs font-bold leading-none">{new Date(a.tanggal).getDate()}</span>
                              <span className="text-[10px] leading-none mt-0.5">
                                {new Date(a.tanggal).toLocaleDateString('id-ID', { month: 'short' })}
                              </span>
                            </div>
                            <div>
                              <p className="text-sm font-medium">{new Date(a.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                              <p className="text-xs text-muted-foreground">{namaHari(a.tanggal)}</p>
                            </div>
                          </div>
                          <Badge variant="secondary" className={absensiStatusBadge[a.status]}>{a.status}</Badge>
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                          <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                            <LogIn className="h-3.5 w-3.5 text-green-600 shrink-0" />
                            <div>
                              <p className="text-[10px] text-muted-foreground leading-none">Masuk</p>
                              <p className="text-sm font-medium leading-tight">{a.checkIn ? new Date(a.checkIn).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '-'}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                            <LogOut className="h-3.5 w-3.5 text-red-600 shrink-0" />
                            <div>
                              <p className="text-[10px] text-muted-foreground leading-none">Pulang</p>
                              <p className="text-sm font-medium leading-tight">{a.checkOut ? new Date(a.checkOut).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '-'}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                            <Clock className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                            <div>
                              <p className="text-[10px] text-muted-foreground leading-none">Durasi</p>
                              <p className="text-sm font-medium leading-tight">{totalJam}</p>
                            </div>
                          </div>
                        </div>

                        {a.faceVerified && (
                          <p className="text-xs text-green-600 flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3" /> Wajah terverifikasi
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      ) : (
        <EmptyState message={hasActiveFilter ? 'Tidak ditemukan' : 'Belum ada riwayat absensi'} icon={History} />
      )}

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
