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
import { StatsCard } from '@/components/shared/StatsCard'
import { EmptyState } from '@/components/shared/EmptyState'
import { absensiStatusBadge, absensiStatusLabel, STATUS_COLORS_MAP } from '@/lib/constants'
import { Fingerprint, Clock, CalendarDays, TrendingUp, ChevronRight, ChevronsUpDown } from 'lucide-react'
import { AttendancePieChart } from '@/components/shared/AttendancePieChart'
import { CardDescription } from '@/components/ui/card'

const now = new Date()
const curMonth = now.getMonth()
const curYear = now.getFullYear()

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
      { name: 'hadir', value: counts.hadir, fill: 'var(--color-status-hadir)' },
      { name: 'pulang_cepat', value: counts.pulangCepat, fill: 'var(--color-status-pulang-cepat)' },
      { name: 'terlambat', value: counts.terlambat, fill: 'var(--color-status-terlambat)' },
      { name: 'tidakHadir', value: counts.tidakHadir, fill: 'var(--color-status-tidakHadir)' },
    ]
  }, [recentAbsensi])

  const total7 = pie7Data.reduce((s, d) => s + d.value, 0)
  const hadir7 = pie7Data[0].value
  const pct7 = total7 > 0 ? Math.round((hadir7 / total7) * 100) : 0

  const totalMonth = monthStats.hadir + monthStats.pulangCepat + monthStats.terlambat + monthStats.izinSakit
  const pctMonth = totalMonth > 0 ? Math.round((monthStats.hadir / totalMonth) * 100) : 0

  const pieMonthData = useMemo(() => [
    { name: 'hadir', value: monthStats.hadir, fill: 'var(--color-status-hadir)' },
    { name: 'pulang_cepat', value: monthStats.pulangCepat, fill: 'var(--color-status-pulang-cepat)' },
    { name: 'terlambat', value: monthStats.terlambat, fill: 'var(--color-status-terlambat)' },
    { name: 'izin/sakit', value: monthStats.izinSakit, fill: 'var(--color-status-sakit)' },
  ], [monthStats.hadir, monthStats.pulangCepat, monthStats.terlambat, monthStats.izinSakit])

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

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4" data-slot="summary-cards">
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
            <Button size="sm" className="w-full gap-2 mt-2" data-slot="absen-button" onClick={() => navigate({ to: '/absensi' })}>
              <Fingerprint className="h-4 w-4" /> {isCheckedIn ? 'Lihat Absensi' : 'Absen Sekarang'}
            </Button>
          </CardContent>
        </Card>
        <StatsCard label="Hadir (Bulan Ini)" value={`${monthStats.hadir} hari`} icon={CalendarDays} />
        <StatsCard label="Pulang Cepat" value={`${monthStats.pulangCepat} kali`} icon={ChevronsUpDown} />
        <StatsCard label="Terlambat" value={`${monthStats.terlambat} kali`} icon={TrendingUp} />
        <StatsCard label="Izin / Sakit" value={`${monthStats.izinSakit} hari`} icon={Clock} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="flex flex-col">
          <CardHeader className="flex-row items-start space-y-0 pb-0">
            <div className="grid gap-1">
              <CardTitle className="text-base">Absensi 7 Hari Terakhir</CardTitle>
              <CardDescription>{new Date(Date.now() - 6 * 86400000).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })} — {now.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="flex flex-1 flex-col items-center justify-center pb-0">
            <AttendancePieChart
              id="pie-7hari"
              data={pie7Data}
              config={{
                hadir: { label: 'Hadir', color: 'var(--color-status-hadir)' },
                pulang_cepat: { label: 'Pulang Cepat', color: 'var(--color-status-pulang-cepat)' },
                terlambat: { label: 'Terlambat', color: 'var(--color-status-terlambat)' },
                tidakHadir: { label: 'Alfa', color: 'var(--color-status-tidakHadir)' },
              }}
              centerLabel={`${pct7}%`}
              centerSub="hadir"
              loading={weekLoading}
            />
          </CardContent>
        </Card>

        <Card className="flex flex-col">
          <CardHeader className="flex-row items-start space-y-0 pb-0">
            <div className="grid gap-1">
              <CardTitle className="text-base">Absensi 1 Bulan Terakhir</CardTitle>
              <CardDescription>{now.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="flex flex-1 flex-col items-center justify-center pb-0">
            <AttendancePieChart
              id="pie-bulan"
              data={pieMonthData}
              config={{
                hadir: { label: 'Hadir', color: 'var(--color-status-hadir)' },
                pulang_cepat: { label: 'Pulang Cepat', color: 'var(--color-status-pulang-cepat)' },
                terlambat: { label: 'Terlambat', color: 'var(--color-status-terlambat)' },
                'izin/sakit': { label: 'Izin/Sakit', color: 'var(--color-status-sakit)' },
              }}
              centerLabel={`${pctMonth}%`}
              centerSub="hadir"
            />
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
            photos: dayDetail[0].photos,
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
