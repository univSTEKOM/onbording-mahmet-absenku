import { useState, useMemo } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useRecentAbsensi, useMonthAttendance } from '@/hooks/useDashboard'
import { useAbsensiList } from '@/hooks/useAbsensi'
import { useAllPengajuan } from '@/hooks/usePengajuan'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { AttendanceCalendar, DayDetailDialog } from '@/components/AttendanceCalendar'
import { useNavigate } from '@tanstack/react-router'
import { EmptyState } from '@/components/shared/EmptyState'
import { absensiStatusBadge, absensiStatusLabel, STATUS_COLORS_MAP } from '@/lib/constants'
import { Fingerprint, Clock, CalendarDays, TrendingUp, ChevronRight, ChevronsUpDown, LogIn, LogOut, CheckCircle2 } from 'lucide-react'
import { AttendancePieChart } from '@/components/shared/AttendancePieChart'
import { CardDescription } from '@/components/ui/card'
import { absensiChartConfig, pieDataItem, statusColor } from '@/lib/chart-config'

const now = new Date()
const curMonth = now.getMonth()
const curYear = now.getFullYear()

function formatJam(iso: string | null): string {
  if (!iso) return '-'
  return new Date(iso).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
}

function hitungJam(checkIn: string | null, checkOut: string | null): string {
  if (!checkIn) return '-'
  const keluar = checkOut ? new Date(checkOut).getTime() : Date.now()
  const selisih = Math.max(0, keluar - new Date(checkIn).getTime())
  const jam = Math.floor(selisih / (1000 * 60 * 60))
  const menit = Math.floor((selisih % (1000 * 60 * 60)) / (1000 * 60))
  return `${jam}j ${menit}m`
}

export default function DashboardPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [detailDate, setDetailDate] = useState<string | null>(null)
  const { data: recentAbsensi, isLoading: weekLoading } = useRecentAbsensi()
  const { data: monthData } = useMonthAttendance(curYear, curMonth + 1, user?.id)
  const { data: allAbsensi } = useAbsensiList({ userId: user?.id, _sort: 'tanggal', _order: 'desc' })
  const { data: todayAbsensi } = useAbsensiList({ userId: user?.id, tanggal: now.toISOString().split('T')[0] })
  const { data: dayDetail } = useAbsensiList(
    detailDate ? { userId: user?.id, tanggal: detailDate } : undefined,
  )
  const { data: allPengajuan } = useAllPengajuan()

  const dayPengajuan = detailDate && allPengajuan
    ? allPengajuan.find(
        (p) =>
          p.status === 'approved' &&
          p.userId === user?.id &&
          p.tanggalMulai <= detailDate &&
          p.tanggalSelesai >= detailDate,
      )
    : null

  const isCheckedIn = !!todayAbsensi?.[0]?.checkIn
  const isCheckedOut = !!todayAbsensi?.[0]?.checkOut

  const monthStats = {
    total: allAbsensi?.filter((a) => a.tanggal.startsWith(`${curYear}-${String(curMonth + 1).padStart(2, '0')}`)).length || 0,
    hadir: allAbsensi?.filter((a) => a.tanggal.startsWith(`${curYear}-${String(curMonth + 1).padStart(2, '0')}`) && a.status === 'hadir').length || 0,
    pulangCepat: allAbsensi?.filter((a) => a.tanggal.startsWith(`${curYear}-${String(curMonth + 1).padStart(2, '0')}`) && a.status === 'pulang_cepat').length || 0,
    terlambat: allAbsensi?.filter((a) => a.tanggal.startsWith(`${curYear}-${String(curMonth + 1).padStart(2, '0')}`) && a.status === 'terlambat').length || 0,
    izinSakit: allAbsensi?.filter((a) => a.tanggal.startsWith(`${curYear}-${String(curMonth + 1).padStart(2, '0')}`) && ['izin', 'sakit', 'cuti'].includes(a.status)).length || 0,
  }

  const recent5 = useMemo(() => {
    const cutoff = new Date(); cutoff.setDate(cutoff.getDate() - 7)
    const cutoffStr = cutoff.toISOString().split('T')[0]
    return allAbsensi?.filter((a) => a.tanggal >= cutoffStr).slice(0, 5) || []
  }, [allAbsensi])

  const pie7Data = useMemo(() => {
    const counts: Record<string, number> = { hadir: 0, pulangCepat: 0, terlambat: 0, tidakHadir: 0 }
    recentAbsensi?.forEach((item) => {
      if (item.status === 'hadir') counts.hadir++
      else if (item.status === 'pulang_cepat') counts.pulangCepat++
      else if (item.status === 'terlambat') counts.terlambat++
      else counts.tidakHadir++
    })
    return [
      pieDataItem('hadir', counts.hadir),
      pieDataItem('pulang_cepat', counts.pulangCepat),
      pieDataItem('terlambat', counts.terlambat),
      pieDataItem('tidakHadir', counts.tidakHadir),
    ]
  }, [recentAbsensi])

  const total7 = pie7Data.reduce((s, d) => s + d.value, 0)
  const hadir7 = pie7Data[0].value
  const pulangCepat7 = pie7Data[1].value
  const pct7 = total7 > 0 ? Math.round(((hadir7 + pulangCepat7) / total7) * 100) : 0

  const totalMonth = monthStats.hadir + monthStats.pulangCepat + monthStats.terlambat + monthStats.izinSakit
  const totalKehadiran = monthStats.hadir + monthStats.pulangCepat
  const pctMonth = totalMonth > 0 ? Math.round((totalKehadiran / totalMonth) * 100) : 0

  const pieMonthData = useMemo(() => [
    pieDataItem('hadir', monthStats.hadir),
    pieDataItem('pulang_cepat', monthStats.pulangCepat),
    pieDataItem('terlambat', monthStats.terlambat),
    { name: 'izin/sakit', value: monthStats.izinSakit, fill: statusColor('sakit') },
  ], [monthStats.hadir, monthStats.pulangCepat, monthStats.terlambat, monthStats.izinSakit])

  if (!user) return null

  const todayStr = now.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  const todayAbsen = todayAbsensi?.[0]

  const statsList = [
    { label: 'Hadir', value: `${totalKehadiran} hari`, icon: CalendarDays, color: 'text-emerald-600' },
    { label: 'Pulang Cepat', value: `${monthStats.pulangCepat} kali`, icon: ChevronsUpDown, color: 'text-orange-600' },
    { label: 'Terlambat', value: `${monthStats.terlambat} kali`, icon: TrendingUp, color: 'text-amber-600' },
    { label: 'Izin / Sakit', value: `${monthStats.izinSakit} hari`, icon: Clock, color: 'text-blue-600' },
  ]

  const statsCards = statsList.map(function(stat) {
    var Icon = stat.icon
    return (
      <Card key={stat.label} className="shrink-0 w-[130px] md:w-[150px]">
        <CardContent className="p-3 md:p-4">
          <div className="flex items-center gap-2 mb-2">
            <Icon className={'h-3.5 w-3.5 ' + stat.color} />
            <span className="text-[11px] md:text-xs text-muted-foreground truncate">{stat.label}</span>
          </div>
          <p className="text-base md:text-lg font-bold">{stat.value}</p>
        </CardContent>
      </Card>
    )
  })

  return (
    <div className="space-y-5 md:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-xs md:text-sm text-muted-foreground">{todayStr}</p>
          <p className="text-xs md:text-sm text-muted-foreground mt-0.5">
            Selamat datang kembali,{' '}
            <span className="font-medium text-foreground">{user.nama}</span>
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:gap-5">
        <Card className="overflow-hidden border-primary/10">
          <CardContent className="p-4 md:p-5">
            <div className="flex items-center gap-4 md:gap-6">
              <div className="hidden sm:flex w-12 h-12 md:w-14 md:h-14 rounded-xl bg-primary/10 items-center justify-center shrink-0">
                <Fingerprint className="h-6 w-6 md:h-7 md:w-7 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium text-muted-foreground">Status Hari Ini</span>
                  {todayAbsen && (
                    <Badge variant="secondary" className={absensiStatusBadge[todayAbsen.status]}>
                      {absensiStatusLabel[todayAbsen.status]}
                    </Badge>
                  )}
                </div>
                <p className="text-base md:text-lg font-bold">
                  {isCheckedOut ? 'Absensi Selesai' : isCheckedIn ? 'Sedang Bekerja' : 'Belum Absen'}
                </p>
                {todayAbsen && (
                  <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <LogIn className="h-3 w-3" /> {formatJam(todayAbsen.checkIn)}
                    </span>
                    {todayAbsen.checkOut && (
                      <span className="flex items-center gap-1">
                        <LogOut className="h-3 w-3" /> {formatJam(todayAbsen.checkOut)}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {hitungJam(todayAbsen.checkIn, todayAbsen.checkOut)}
                    </span>
                  </div>
                )}
              </div>
              <Button size="sm" className="gap-1.5 shrink-0" onClick={function() { navigate({ to: '/absensi' }) }}>
                <Fingerprint className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{isCheckedIn ? 'Lihat' : 'Absen'}</span>
              </Button>
            </div>
          </CardContent>
        </Card>

      </div>

      <div className="flex gap-3 md:gap-4 overflow-x-auto pb-1 scrollbar-none">
        {statsCards}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
        <Card className="flex flex-col">
          <CardHeader className="flex-row items-start space-y-0 pb-0 px-4 md:px-5 pt-4 md:pt-5">
            <div className="grid gap-0.5">
              <CardTitle className="text-sm md:text-base">7 Hari Terakhir</CardTitle>
              <CardDescription className="text-[11px] md:text-xs">
                {new Date(Date.now() - 6 * 86400000).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                {' — '}
                {now.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="flex flex-1 flex-col items-center justify-center pb-0 px-4 md:px-5">
            <AttendancePieChart
              id="pie-7hari"
              data={pie7Data}
              config={absensiChartConfig}
              centerLabel={pct7 + '%'}
              centerSub="kehadiran"
              loading={weekLoading}
            />
          </CardContent>
        </Card>

        <Card className="flex flex-col">
          <CardHeader className="flex-row items-start space-y-0 pb-0 px-4 md:px-5 pt-4 md:pt-5">
            <div className="grid gap-0.5">
              <CardTitle className="text-sm md:text-base">Bulan Ini</CardTitle>
              <CardDescription className="text-[11px] md:text-xs">
                {now.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="flex flex-1 flex-col items-center justify-center pb-0 px-4 md:px-5">
            <AttendancePieChart
              id="pie-bulan"
              data={pieMonthData}
              config={{ ...absensiChartConfig, 'izin/sakit': { label: 'Izin/Sakit', color: statusColor('sakit') } }}
              centerLabel={pctMonth + '%'}
              centerSub="kehadiran"
            />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-4 md:p-5">
          {monthData ? (
            <AttendanceCalendar
              year={curYear}
              month={curMonth}
              data={monthData.data}
              onDayClick={setDetailDate}
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
          onClose={function() { setDetailDate(null) }}
        />
      )}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between px-4 md:px-5 pt-4 md:pt-5">
          <CardTitle className="text-sm md:text-base">Aktivitas Terbaru</CardTitle>
          <Button variant="ghost" size="xs" className="gap-1 text-muted-foreground" onClick={function() { navigate({ to: '/absensi/riwayat' }) }}>
            Lihat semua <ChevronRight className="h-3 w-3" />
          </Button>
        </CardHeader>
        <CardContent className="px-4 md:px-5 pb-4 md:pb-5">
          {recent5.length > 0 ? (
            <div className="space-y-0 divide-y divide-border/50">
              {recent5.map(function(a) {
                var tgl = new Date(a.tanggal + 'T00:00:00')
                var dayName = tgl.toLocaleDateString('id-ID', { weekday: 'short' })
                var dayNum = tgl.getDate()
                var monthShort = tgl.toLocaleDateString('id-ID', { month: 'short' })
                return (
                  <div key={a.id} className="flex items-center gap-3 py-2.5">
                    <div className="flex flex-col items-center w-8 shrink-0">
                      <span className="text-[10px] text-muted-foreground leading-none">{dayName}</span>
                      <span className="text-sm font-bold leading-tight">{dayNum}</span>
                      <span className="text-[10px] text-muted-foreground leading-none">{monthShort}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ backgroundColor: STATUS_COLORS_MAP[a.status] || '#999' }}
                        />
                        <span className="text-xs font-medium truncate">{absensiStatusLabel[a.status]}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5 text-[11px] text-muted-foreground">
                        <span>{formatJam(a.checkIn)}</span>
                        <span>-</span>
                        <span>{formatJam(a.checkOut)}</span>
                        <span className="text-muted-foreground/60">{'·'}</span>
                        <span>{hitungJam(a.checkIn, a.checkOut)}</span>
                      </div>
                    </div>
                    {a.faceVerified && (
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                    )}
                  </div>
                )
              })}
            </div>
          ) : (
            <EmptyState message="Belum ada riwayat absensi" />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
