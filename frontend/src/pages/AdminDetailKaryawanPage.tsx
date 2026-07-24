import { useState, useMemo } from 'react'
import { useNavigate, useLocation } from '@tanstack/react-router'
import { useMonthAttendance } from '@/hooks/useDashboard'
import { useAbsensiList, useAbsensiListPaginated } from '@/hooks/useAbsensi'
import { useAllPengajuan } from '@/hooks/usePengajuan'
import { ProfileInfoCard } from '@/components/pengguna/ProfileInfoCard'
import { StatsCard } from '@/components/shared/StatsCard'
import { DayDetailDialog } from '@/components/AttendanceCalendar'
import { CalendarCard } from '@/components/CalendarCard'
import { Pagination } from '@/components/shared/Pagination'
import { EmptyState } from '@/components/shared/EmptyState'
import { PengajuanCard } from '@/components/pengajuan/PengajuanCard'
import { PengajuanDetailDialog } from '@/components/pengajuan/PengajuanDetailDialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { ArrowLeft, FileText, CalendarDays, Clock, CheckCircle2, ChevronsUpDown, AlertTriangle } from 'lucide-react'
import { absensiStatusBadge, absensiStatusLabel } from '@/lib/constants'
import type { User, Pengajuan } from '@/types'

const ITEMS_PER_PAGE = 8

function durasiJam(checkIn: string | null, checkOut: string | null) {
  if (!checkIn) return '-'
  const masuk = new Date(checkIn).getTime()
  const keluar = checkOut ? new Date(checkOut).getTime() : Date.now()
  const ms = keluar - masuk
  const jam = Math.floor(ms / (1000 * 60 * 60))
  const menit = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60))
  return `${jam}j ${menit}m`
}

function formatWaktu(date: string | null) {
  if (!date) return '-'
  return new Date(date).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
}

function formatTanggal(date: string) {
  return new Date(date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function AdminDetailKaryawanPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const stateUser = (location.state as { user?: User })?.user
  const user = stateUser || null

  const now = new Date()
  const curYear = now.getFullYear()
  const curMonth = now.getMonth() + 1
  const [page, setPage] = useState(1)
  const [pengajuanDetail, setPengajuanDetail] = useState<Pengajuan | null>(null)
  const [detailDate, setDetailDate] = useState<string | null>(null)

  const { data: monthData, isLoading: monthLoading } = useMonthAttendance(curYear, curMonth, user?.id)
  const { data: absensiData, isLoading: absensiLoading } = useAbsensiListPaginated({
    userId: user?.id,
    _sort: 'tanggal',
    _order: 'desc',
    _page: page,
    _limit: ITEMS_PER_PAGE,
  })
  const { data: allPengajuan } = useAllPengajuan()
  const { data: dayDetail } = useAbsensiList(
    detailDate ? { userId: user?.id, tanggal: detailDate } : undefined,
  )

  const dayPengajuan = detailDate && allPengajuan
    ? allPengajuan.find(
        (p) =>
          p.status === 'approved' &&
          p.userId === user?.id &&
          p.tanggalMulai <= detailDate &&
          p.tanggalSelesai >= detailDate,
      )
    : null

  const userPengajuan = useMemo(() =>
    allPengajuan?.filter((p) => p.userId === user?.id) || [],
    [allPengajuan, user?.id]
  )

  const hadirMonth = monthData?.data?.filter((d) => d.hadir > 0).length || 0
  const pulangCepatMonth = monthData?.data?.filter((d) => d.pulangCepat > 0).length || 0
  const terlambatMonth = monthData?.data?.filter((d) => d.terlambat > 0).length || 0
  const izinMonth = monthData?.data?.filter((d) => d.izin > 0 || d.sakit > 0 || d.cuti > 0).length || 0

  const isKaryawan = user?.role === 'karyawan'

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <AlertTriangle className="h-12 w-12 text-muted-foreground" />
        <p className="text-muted-foreground">User tidak ditemukan</p>
        <Button variant="outline" onClick={() => navigate({ to: '/admin/karyawan' })}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Kembali
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" className="gap-2 -ml-2" onClick={() => navigate({ to: '/admin/karyawan' })}>
        <ArrowLeft className="h-4 w-4" /> Kembali ke Kelola Karyawan
      </Button>

      <ProfileInfoCard user={user} />

      {isKaryawan && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatsCard icon={CheckCircle2} label="Hadir" value={hadirMonth} />
            <StatsCard icon={ChevronsUpDown} label="Pulang Cepat" value={pulangCepatMonth} />
            <StatsCard icon={Clock} label="Terlambat" value={terlambatMonth} />
            <StatsCard icon={FileText} label="Izin / Sakit" value={izinMonth} />
          </div>

          {monthLoading ? (
            <Skeleton className="h-[300px] w-full rounded-lg" />
          ) : (
            <CalendarCard
              year={curYear}
              month={curMonth}
              data={monthData?.data || []}
              selectedDate={detailDate}
              onSelectedDateChange={(tgl) => setDetailDate(tgl || null)}
            />
          )}

          <div>
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              Riwayat Absensi
            </h3>
            {absensiLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={`abs-sk-${i}`} className="h-10 w-full rounded-lg" />
                ))}
              </div>
            ) : absensiData?.data?.length ? (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tanggal</TableHead>
                      <TableHead>Masuk</TableHead>
                      <TableHead>Pulang</TableHead>
                      <TableHead>Durasi</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {absensiData.data.map((a) => (
                      <TableRow key={a.id}>
                        <TableCell className="font-medium">{formatTanggal(a.tanggal)}</TableCell>
                        <TableCell>{formatWaktu(a.checkIn)}</TableCell>
                        <TableCell>{formatWaktu(a.checkOut)}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">{durasiJam(a.checkIn, a.checkOut)}</TableCell>
                        <TableCell>
                          <Badge variant="secondary" className={absensiStatusBadge[a.status]}>
                            {absensiStatusLabel[a.status]}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <Pagination
                  page={page}
                  totalPages={absensiData.totalPages}
                  onPageChange={setPage}
                />
              </>
            ) : (
              <EmptyState message="Belum ada riwayat absensi" icon={CalendarDays} />
            )}
          </div>

          <Separator />

          <div>
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              Pengajuan Terkait
            </h3>
            {userPengajuan.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {userPengajuan.map((p) => (
                  <PengajuanCard
                    key={p.id}
                    pengajuan={p}
                    variant="admin"
                    pengaju={user}
                    onClick={(p) => setPengajuanDetail(p)}
                  />
                ))}
              </div>
            ) : (
              <EmptyState message="Belum ada pengajuan" icon={FileText} />
            )}
          </div>

          <PengajuanDetailDialog
            open={!!pengajuanDetail}
            onOpenChange={(o) => { if (!o) setPengajuanDetail(null) }}
            pengajuan={pengajuanDetail}
            variant="admin"
            pengaju={user}
          />

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
        </>
      )}

      {!isKaryawan && (
        <p className="text-sm text-muted-foreground text-center py-8">
          Informasi absensi dan pengajuan hanya tersedia untuk user dengan role Karyawan.
        </p>
      )}
    </div>
  )
}

