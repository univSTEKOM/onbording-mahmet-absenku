import { useState, useEffect, useMemo } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useRecentAbsensi, useMonthAttendance } from '@/hooks/useDashboard'
import { useAbsensiList } from '@/hooks/useAbsensi'
import { useAllPengajuan } from '@/hooks/usePengajuan'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { AttendanceCalendar, DayDetailDialog } from '@/components/AttendanceCalendar'
import { useNavigate } from '@tanstack/react-router'
import { StatsCard } from '@/components/shared/StatsCard'
import { EmptyState } from '@/components/shared/EmptyState'
import { absensiStatusBadge, absensiStatusLabel, STATUS_COLORS_MAP } from '@/lib/constants'
import { Fingerprint, Clock, CalendarDays, TrendingUp, ChevronRight, X } from 'lucide-react'
import { BarChart, Bar, XAxis, CartesianGrid } from 'recharts'
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent, type ChartConfig } from '@/components/ui/chart'

const now = new Date()
const curMonth = now.getMonth()
const curYear = now.getFullYear()

function hitungJam(checkIn: string | null, checkOut: string | null): string {
  if (!checkIn || !checkOut) return '-'
  const selisih = Math.max(0, new Date(checkOut).getTime() - new Date(checkIn).getTime())
  const jam = Math.floor(selisih / (1000 * 60 * 60))
  const menit = Math.floor((selisih % (1000 * 60 * 60)) / (1000 * 60))
  return `${jam}j ${menit}m`
}

function durasiRealTime(checkIn: string): string {
  const selisih = Math.max(0, Date.now() - new Date(checkIn).getTime())
  const jam = Math.floor(selisih / (1000 * 60 * 60))
  const menit = Math.floor((selisih % (1000 * 60 * 60)) / (1000 * 60))
  return `${jam}j ${menit}m`
}

export default function DashboardPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [detailDate, setDetailDate] = useState<string | null>(null)
  const [, setTick] = useState(0)

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 60000)
    return () => clearInterval(id)
  }, [])

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
    hadir: allAbsensi?.filter((a) => a.tanggal.startsWith(`${curYear}-${String(curMonth + 1).padStart(2, '0')}`) && ['hadir', 'pulang_cepat'].includes(a.status)).length || 0,
    terlambat: allAbsensi?.filter((a) => a.tanggal.startsWith(`${curYear}-${String(curMonth + 1).padStart(2, '0')}`) && a.status === 'terlambat').length || 0,
    izinSakit: allAbsensi?.filter((a) => a.tanggal.startsWith(`${curYear}-${String(curMonth + 1).padStart(2, '0')}`) && ['izin', 'sakit', 'cuti'].includes(a.status)).length || 0,
  }

  const recent5 = useMemo(() => {
    const cutoff = new Date(); cutoff.setDate(cutoff.getDate() - 7)
    const cutoffStr = cutoff.toISOString().split('T')[0]
    return allAbsensi?.filter((a) => a.tanggal >= cutoffStr).slice(0, 5) || []
  }, [allAbsensi])

  const chartData = (recentAbsensi || []).map((item) => ({
    dayName: new Date(item.tanggal).toLocaleDateString('id-ID', { weekday: 'short' }),
    tanggal: item.tanggal,
    status: item.status,
    hadir: item.status && ['hadir'].includes(item.status) ? 1 : 0,
    terlambat: item.status === 'terlambat' ? 1 : 0,
    pulangCepat: item.status === 'pulang_cepat' ? 1 : 0,
    tidakHadir: !item.status ? 1 : 0,
    checkIn: item.checkIn ? new Date(item.checkIn).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '-',
    checkOut: item.checkOut ? new Date(item.checkOut).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '-',
  }))

  if (!user) return null

  const todayStr = now.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground">{todayStr}</p>
          <p className="text-muted-foreground">Selamat datang kembali, <span className="font-medium text-foreground">{user.nama}</span></p>
        </div>
      </div>

      {detailDate && (
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Tanggal dipilih:</span>
          <Badge variant="secondary" className="text-sm px-3 py-1">
            {new Date(detailDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
            <button onClick={() => setDetailDate(null)} className="ml-2 hover:text-foreground">
              <X className="h-3 w-3" />
            </button>
          </Badge>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="relative lg:col-span-1">
          <CardContent className="py-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-muted-foreground">Status Hari Ini</span>
              <Fingerprint className="h-4 w-4 text-primary" />
            </div>
            <p className="text-xl font-bold mb-1">
              {isCheckedOut ? 'Absensi Selesai' : isCheckedIn ? 'Sedang Bekerja' : 'Belum Absen'}
            </p>
            {todayAbsensi?.[0] && (
              <Badge variant="secondary" className={absensiStatusBadge[todayAbsensi[0].status] + ' mb-2'}>
                {absensiStatusLabel[todayAbsensi[0].status]}
              </Badge>
            )}
            <Button size="sm" className="w-full gap-2 mt-2" onClick={() => navigate({ to: '/absensi' })}>
              <Fingerprint className="h-4 w-4" /> {isCheckedIn ? 'Lihat Absensi' : 'Absen Sekarang'}
            </Button>
          </CardContent>
        </Card>
        <StatsCard label="Hadir (Bulan Ini)" value={`${monthStats.hadir} hari`} icon={CalendarDays} />
        <StatsCard label="Terlambat" value={`${monthStats.terlambat} kali`} icon={TrendingUp} />
        <Card>
          <CardContent className="py-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-muted-foreground">Izin / Sakit</span>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-2xl font-bold">{monthStats.izinSakit} hari</p>
            <p className="text-xs text-muted-foreground mt-1">dari {monthStats.total} absensi</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Absensi 7 Hari Terakhir</CardTitle>
          </CardHeader>
          <CardContent>
            {weekLoading ? (
              <Skeleton className="h-44 w-full rounded-lg" />
            ) : chartData.length > 0 ? (
                <ChartContainer config={{
                  tidakHadir: { label: 'Alfa', color: 'var(--chart-1)' },
                  hadir: { label: 'Hadir', color: 'var(--chart-2)' },
                  terlambat: { label: 'Terlambat', color: 'var(--chart-3)' },
                  pulangCepat: { label: 'Pulang Cepat', color: 'var(--chart-4)' },
                } satisfies ChartConfig} className="h-44">
                  <BarChart accessibilityLayer data={chartData}>
                    <CartesianGrid vertical={false} />
                    <XAxis dataKey="dayName" tickLine={false} tickMargin={10} axisLine={false} />
                    <ChartTooltip content={<ChartTooltipContent />} cursor={false} />
                    <ChartLegend content={<ChartLegendContent payload={[
                      { value: 'pulangCepat' }, { value: 'terlambat' }, { value: 'hadir' }, { value: 'tidakHadir' },
                    ]} />} />
                    <Bar dataKey="tidakHadir" fill="var(--color-tidakHadir)" radius={[0, 0, 4, 4]} stackId="a" />
                    <Bar dataKey="hadir" fill="var(--color-hadir)" radius={[0, 0, 0, 0]} stackId="a" />
                    <Bar dataKey="terlambat" fill="var(--color-terlambat)" radius={[0, 0, 0, 0]} stackId="a" />
                    <Bar dataKey="pulangCepat" fill="var(--color-pulangCepat)" radius={[4, 4, 0, 0]} stackId="a" />
                  </BarChart>
                </ChartContainer>
            ) : (
              <div className="h-44 flex items-center justify-center text-sm text-muted-foreground">Belum ada data absensi 7 hari terakhir</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Status Absensi Hari Ini</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {todayAbsensi?.[0] ? (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <Badge variant="secondary" className={absensiStatusBadge[todayAbsensi[0].status]}>
                    {absensiStatusLabel[todayAbsensi[0].status]}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Check-in</span>
                  <span className="font-medium">
                    {new Date(todayAbsensi[0].checkIn!).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <Progress value={isCheckedOut ? 100 : 50} className="h-2" />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Check-out</span>
                  <span className="font-medium">
                    {isCheckedOut
                      ? new Date(todayAbsensi[0].checkOut!).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
                      : 'Belum'}
                  </span>
                </div>
                {isCheckedOut && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Durasi</span>
                    <span className="font-medium">{hitungJam(todayAbsensi[0].checkIn, todayAbsensi[0].checkOut)}</span>
                  </div>
                )}
                {isCheckedIn && !isCheckedOut && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Sedang bekerja</span>
                    <span className="font-medium text-green-600">{durasiRealTime(todayAbsensi[0].checkIn!)}</span>
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center gap-3 py-6">
                <Fingerprint className="h-10 w-10 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">Belum ada absensi hari ini</p>
                <Button size="sm" className="gap-2" onClick={() => navigate({ to: '/absensi' })}>
                  <Fingerprint className="h-4 w-4" /> Absen Sekarang
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="pt-6">
          {monthData ? (
            <AttendanceCalendar
              year={curYear}
              month={curMonth}
              data={monthData.data}
              onDayClick={setDetailDate}
            />
          ) : (
            <Skeleton className="h-[300px] w-full rounded-lg" />
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
          } : undefined}
          pengajuan={dayPengajuan || undefined}
          onClose={() => setDetailDate(null)}
        />
      )}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Aktivitas Terbaru</CardTitle>
          <Button variant="ghost" size="sm" className="gap-1" onClick={() => navigate({ to: '/absensi/riwayat' })}>
            Lihat semua <ChevronRight className="h-3 w-3" />
          </Button>
        </CardHeader>
        <CardContent>
          {recent5?.length ? (
            <div className="space-y-1">
              {recent5.map((a) => (
                <div key={a.id} className="flex items-center justify-between py-2.5 border-b last:border-0">
                  <div className="flex items-center gap-2">
                    <span className="size-2.5 rounded-full shrink-0" style={{ backgroundColor: STATUS_COLORS_MAP[a.status] || '#999' }} />
                    <span className="text-sm">{new Date(a.tanggal).toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' })}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground">
                      {a.checkIn ? new Date(a.checkIn).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '-'}
                      {' — '}
                      {a.checkOut ? new Date(a.checkOut).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '-'}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${absensiStatusBadge[a.status]}`}>{absensiStatusLabel[a.status]}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState message="Belum ada riwayat absensi" />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
