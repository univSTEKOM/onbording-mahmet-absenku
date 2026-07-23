import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useRecentAbsensi } from '@/hooks/useDashboard'
import { useAbsensiList } from '@/hooks/useAbsensi'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Progress } from '@/components/ui/progress'
import { AttendanceCalendar, DayDetailDialog } from '@/components/AttendanceCalendar'
import { useNavigate } from 'react-router-dom'
import { StatsCard } from '@/components/shared/StatsCard'
import { EmptyState } from '@/components/shared/EmptyState'
import { absensiStatusBadge, absensiStatusLabel } from '@/lib/constants'
import { Fingerprint, Clock, CalendarDays, TrendingUp, ChevronRight } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

const now = new Date()
const curMonth = now.getMonth()
const curYear = now.getFullYear()

export default function DashboardPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [detailDate, setDetailDate] = useState<string | null>(null)
  const { data: recentAbsensi, isLoading: chartLoading } = useRecentAbsensi()
  const { data: allAbsensi } = useAbsensiList({ userId: user?.id, _sort: 'tanggal', _order: 'desc' })
  const { data: todayAbsensi } = useAbsensiList({ userId: user?.id, tanggal: new Date().toISOString().split('T')[0] })
  const { data: dayDetail } = useAbsensiList(
    detailDate ? { userId: user?.id, tanggal: detailDate } : undefined,
  )

  const chartData = (recentAbsensi || []).map((item) => ({
    name: new Date(item.tanggal).toLocaleDateString('id-ID', { weekday: 'short' }),
    hadir: item.status === 'hadir' ? 1 : 0,
    terlambat: item.status === 'terlambat' ? 1 : 0,
  }))

  const isCheckedIn = !!todayAbsensi?.[0]?.checkIn
  const isCheckedOut = !!todayAbsensi?.[0]?.checkOut
  const recent5 = allAbsensi?.slice(0, 5)

  const calendarData = (allAbsensi || []).reduce<Record<string, { status: string; checkIn: string | null; checkOut: string | null }>>((acc, a) => {
    if (!acc[a.tanggal]) acc[a.tanggal] = { status: a.status, checkIn: a.checkIn, checkOut: a.checkOut }
    return acc
  }, {})

  if (!user) return null

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Selamat datang kembali, <span className="font-medium text-foreground">{user.nama}</span></p>
        </div>
        <Button size="lg" className="gap-2 shadow-sm" onClick={() => navigate('/absensi')}>
          <Fingerprint className="h-4 w-4" /> Absen Sekarang
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatsCard label="Status Hari Ini" value={isCheckedOut ? 'Selesai' : isCheckedIn ? 'Check-in' : 'Belum'} icon={Clock} />
        <StatsCard label="Total Hadir" value={`${allAbsensi?.filter((a) => a.status === 'hadir').length || 0} hari`} icon={CalendarDays} />
        <StatsCard label="Terlambat" value={`${allAbsensi?.filter((a) => a.status === 'terlambat').length || 0} kali`} icon={TrendingUp} />
        <StatsCard label="Kehadiran" value={`${allAbsensi?.length || 0} hari`} icon={Fingerprint} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Absensi 7 Hari Terakhir</CardTitle>
          </CardHeader>
          <CardContent>
            {chartLoading ? (
              <Skeleton className="h-[200px] w-full rounded-lg" />
            ) : chartData.length > 0 ? (
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                    <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid var(--border)' }} />
                    <Bar dataKey="hadir" fill="var(--chart-1)" radius={[4, 4, 0, 0]} stackId="a" />
                    <Bar dataKey="terlambat" fill="var(--chart-2)" radius={[4, 4, 0, 0]} stackId="a" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-sm text-muted-foreground">Belum ada data absensi</div>
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
                  <span className="text-sm text-muted-foreground">Check-in</span>
                  <span className="font-medium">
                    {new Date(todayAbsensi[0].checkIn!).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <Progress value={todayAbsensi[0].checkOut ? 100 : 50} className="h-2" />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Check-out</span>
                  <span className="font-medium">
                    {todayAbsensi[0].checkOut
                      ? new Date(todayAbsensi[0].checkOut).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
                      : 'Belum'}
                  </span>
                </div>
              </>
            ) : (
              <div className="text-center py-6 text-muted-foreground text-sm">Belum ada absensi hari ini</div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="pt-6">
          <AttendanceCalendar
            year={curYear}
            month={curMonth}
            data={Object.entries(calendarData).map(([tanggal, v]) => ({
              tanggal,
              hadir: v.status === 'hadir' ? 1 : 0,
              terlambat: v.status === 'terlambat' ? 1 : 0,
              checkInOnly: v.checkIn && !v.checkOut ? 1 : 0,
              izin: ['izin', 'sakit', 'cuti'].includes(v.status) ? 1 : 0,
              tidakHadir: 0,
            }))}
            totalKaryawan={1}
            onDayClick={setDetailDate}
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

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Aktivitas Terbaru</CardTitle>
          <Button variant="ghost" size="sm" className="gap-1" onClick={() => navigate('/absensi/riwayat')}>
            Lihat semua <ChevronRight className="h-3 w-3" />
          </Button>
        </CardHeader>
        <CardContent>
          {recent5?.length ? (
            <div className="space-y-1">
              {recent5.map((a) => (
                <div key={a.id} className="flex items-center justify-between py-2.5 border-b last:border-0">
                  <span className="text-sm">{new Date(a.tanggal).toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' })}</span>
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
