import { useAuth } from '@/hooks/useAuth'
import { useAbsensiList } from '@/hooks/useAbsensi'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Progress } from '@/components/ui/progress'
import { useNavigate } from 'react-router-dom'
import { StatsCard } from '@/components/shared/StatsCard'
import { EmptyState } from '@/components/shared/EmptyState'
import { Fingerprint, Clock, CalendarDays, TrendingUp, ChevronRight } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

export default function DashboardPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const today = new Date().toISOString().split('T')[0]

  const { data: todayAbsensi } = useAbsensiList({ userId: user?.id, tanggal: today })
  const { data: allAbsensi } = useAbsensiList({ userId: user?.id, _sort: 'tanggal', _order: 'desc' })

  const weekDays = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']
  const chartData = weekDays.map((day, i) => {
    const d = new Date()
    d.setDate(d.getDate() - d.getDay() + i)
    const dateStr = d.toISOString().split('T')[0]
    const absen = allAbsensi?.filter((a) => a.tanggal === dateStr)
    return {
      name: day,
      hadir: absen?.filter((a) => a.status === 'hadir').length || 0,
      terlambat: absen?.filter((a) => a.status === 'terlambat').length || 0,
    }
  })

  const isCheckedIn = !!todayAbsensi?.[0]?.checkIn
  const isCheckedOut = !!todayAbsensi?.[0]?.checkOut
  const recentAbsensi = allAbsensi?.slice(0, 5)

  if (!user) return null

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Selamat datang kembali, <span className="font-medium text-foreground">{user.nama}</span></p>
        </div>
        <Button size="lg" className="gap-2 shadow-sm" onClick={() => navigate('/absensi')}>
          <Fingerprint className="h-4 w-4" />
          Absen Sekarang
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
            {allAbsensi ? (
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip />
                    <Bar dataKey="hadir" fill="hsl(142, 71%, 45%)" radius={[4, 4, 0, 0]} stackId="a" />
                    <Bar dataKey="terlambat" fill="hsl(48, 96%, 53%)" radius={[4, 4, 0, 0]} stackId="a" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <Skeleton className="h-[200px] w-full" />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
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
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Aktivitas Terbaru</CardTitle>
          <Button variant="ghost" size="sm" className="gap-1" onClick={() => navigate('/absensi/riwayat')}>
            Lihat semua <ChevronRight className="h-3 w-3" />
          </Button>
        </CardHeader>
        <CardContent>
          {recentAbsensi?.length ? (
            <div className="space-y-1">
              {recentAbsensi.map((a) => (
                <div key={a.id} className="flex items-center justify-between py-2.5 border-b last:border-0">
                  <span className="text-sm">{new Date(a.tanggal).toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' })}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground">
                      {a.checkIn ? new Date(a.checkIn).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '-'}
                      {' — '}
                      {a.checkOut ? new Date(a.checkOut).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '-'}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      a.status === 'hadir' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                      : a.status === 'terlambat' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                      : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
                    }`}>{a.status}</span>
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
