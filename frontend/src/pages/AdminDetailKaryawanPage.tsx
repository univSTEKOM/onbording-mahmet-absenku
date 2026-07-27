import { useState, useMemo } from 'react'
import { useNavigate, useLocation } from '@tanstack/react-router'
import { useMonthAttendance } from '@/hooks/useDashboard'
import { useAbsensiList, useAbsensiListPaginated } from '@/hooks/useAbsensi'
import { useAllPengajuan } from '@/hooks/usePengajuan'
import { ProfileInfoCard } from '@/components/pengguna/ProfileInfoCard'
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
import { Card, CardContent } from '@/components/ui/card'
import { ArrowLeft, FileText, CalendarDays, Clock, CheckCircle2, ChevronsUpDown } from 'lucide-react'
import { absensiStatusBadge, absensiStatusLabel } from '@/lib/constants'
import { formatJam, hitungJam, formatTanggal } from '@/lib/utils'
import type { User, Pengajuan } from '@/types'

const ITEMS_PER_PAGE = 8

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
    ? allPengajuan.find(function(p) {
        return p.status === 'approved' && p.userId === user?.id && p.tanggalMulai <= detailDate && p.tanggalSelesai >= detailDate
      })
    : null

  const userPengajuan = useMemo(function() {
    return allPengajuan?.filter(function(p) { return p.userId === user?.id }) || []
  }, [allPengajuan, user?.id])

  const hadirMonth = monthData?.data?.filter(function(d) { return d.hadir > 0 }).length || 0
  const pulangCepatMonth = monthData?.data?.filter(function(d) { return d.pulangCepat > 0 }).length || 0
  const terlambatMonth = monthData?.data?.filter(function(d) { return d.terlambat > 0 }).length || 0
  const izinMonth = monthData?.data?.filter(function(d) { return d.izin > 0 || d.sakit > 0 || d.cuti > 0 }).length || 0

  const isKaryawan = user?.role === 'karyawan'

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="text-muted-foreground">User tidak ditemukan</div>
        <Button variant="outline" onClick={function() { navigate({ to: '/admin/karyawan' }) }}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Kembali
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-5 md:space-y-6">
      <Button variant="ghost" size="sm" className="gap-2" onClick={function() { navigate({ to: '/admin/karyawan' }) }}>
        <ArrowLeft className="h-4 w-4" /> Kembali
      </Button>

      <ProfileInfoCard user={user} />

      {isKaryawan && (
        <>
          <div className="flex gap-3 md:gap-4 overflow-x-auto pb-1">
            {[
              { label: 'Hadir', value: hadirMonth, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-100 dark:bg-emerald-900/30' },
              { label: 'Pulang Cepat', value: pulangCepatMonth, icon: ChevronsUpDown, color: 'text-orange-600', bg: 'bg-orange-100 dark:bg-orange-900/30' },
              { label: 'Terlambat', value: terlambatMonth, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-100 dark:bg-amber-900/30' },
              { label: 'Izin / Sakit', value: izinMonth, icon: FileText, color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-900/30' },
            ].map(function(stat) {
              const Icon = stat.icon
              return (
                <Card key={stat.label} className="shrink-0 w-[130px] md:w-[150px]">
                  <CardContent className="p-3 md:p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className={'p-1.5 rounded-md ' + stat.bg}>
                        <Icon className={'h-3.5 w-3.5 ' + stat.color} />
                      </div>
                      <span className="text-[11px] md:text-xs text-muted-foreground truncate">{stat.label}</span>
                    </div>
                    <p className={'text-base md:text-lg font-bold ' + stat.color}>{stat.value}</p>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {monthLoading ? (
            <Skeleton className="h-[260px] md:h-[300px] w-full rounded-lg" />
          ) : (
            <CalendarCard
              year={curYear}
              month={curMonth}
              data={monthData?.data || []}
              selectedDate={detailDate}
              onSelectedDateChange={function(tgl) { setDetailDate(tgl || null) }}
            />
          )}

          <div>
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2 text-muted-foreground">
              <Clock className="h-4 w-4" />
              Riwayat Absensi
            </h3>
            {absensiLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 5 }, function(_, i) { return { id: 'det-abs-sk-' + i } }).map(function(item) {
                  return <Skeleton key={item.id} className="h-10 w-full rounded-lg" />
                })}
              </div>
            ) : absensiData?.data && absensiData.data.length > 0 ? (
              <div className="overflow-x-auto -mx-4 md:-mx-6">
                <div className="min-w-[500px] px-4 md:px-6">
                  <div className="rounded-lg border">
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
                        {absensiData.data.map(function(a) {
                          return (
                            <TableRow key={a.id} className="hover:bg-muted/30 transition-colors">
                              <TableCell className="font-medium whitespace-nowrap">{formatTanggal(a.tanggal)}</TableCell>
                              <TableCell className="whitespace-nowrap">{formatJam(a.checkIn)}</TableCell>
                              <TableCell className="whitespace-nowrap">{formatJam(a.checkOut)}</TableCell>
                              <TableCell className="text-xs text-muted-foreground whitespace-nowrap">{hitungJam(a.checkIn, a.checkOut)}</TableCell>
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
              <EmptyState message="Belum ada riwayat absensi" icon={CalendarDays} />
            )}
            {absensiData && absensiData.totalPages > 1 && (
              <Pagination page={page} totalPages={absensiData.totalPages} onPageChange={setPage} />
            )}
          </div>

          <div>
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2 text-muted-foreground">
              <FileText className="h-4 w-4" />
              Pengajuan Terkait
            </h3>
            {userPengajuan.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {userPengajuan.map(function(p) {
                  return (
                    <PengajuanCard
                      key={p.id}
                      pengajuan={p}
                      variant="admin"
                      pengaju={user}
                      onClick={function(p) { setPengajuanDetail(p) }}
                    />
                  )
                })}
              </div>
            ) : (
              <EmptyState message="Belum ada pengajuan" icon={FileText} />
            )}
          </div>

          <PengajuanDetailDialog
            open={!!pengajuanDetail}
            onOpenChange={function(o) { if (!o) setPengajuanDetail(null) }}
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
              onClose={function() { setDetailDate(null) }}
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
