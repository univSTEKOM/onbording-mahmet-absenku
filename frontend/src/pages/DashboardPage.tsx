import { useAuth } from '@/hooks/useAuth'
import { useAbsensiList } from '@/hooks/useAbsensi'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useNavigate } from 'react-router-dom'
import { StatsCard } from '@/components/shared/StatsCard'
import { EmptyState } from '@/components/shared/EmptyState'
import { Fingerprint, Clock, CalendarDays, TrendingUp } from 'lucide-react'

export default function DashboardPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const today = new Date().toISOString().split('T')[0]
  const weekStart = new Date()
  weekStart.setDate(weekStart.getDate() - weekStart.getDay())
  const monthStart = new Date()
  monthStart.setDate(1)

  const { data: todayAbsensi } = useAbsensiList({ userId: user?.id, tanggal: today })
  const { data: weekAbsensi } = useAbsensiList({ userId: user?.id, tanggal_gte: weekStart.toISOString().split('T')[0] })
  const { data: monthAbsensi } = useAbsensiList({ userId: user?.id, tanggal_gte: monthStart.toISOString().split('T')[0] })
  const { data: recentAbsensi } = useAbsensiList({ userId: user?.id, _sort: 'tanggal', _order: 'desc' })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Selamat datang kembali, {user?.nama}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatsCard
          label="Hari Ini"
          value={todayAbsensi?.length ? (todayAbsensi[0].checkOut ? 'Selesai' : 'Check-in') : 'Belum'}
          icon={Clock}
        />
        <StatsCard
          label="Minggu Ini"
          value={`${weekAbsensi?.length || 0} hari`}
          icon={CalendarDays}
        />
        <StatsCard
          label="Bulan Ini"
          value={`${monthAbsensi?.length || 0} hari`}
          icon={TrendingUp}
        />
      </div>

      <Button size="lg" className="gap-2" onClick={() => navigate('/absensi')}>
        <Fingerprint className="h-5 w-5" />
        Absen Sekarang
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Aktivitas Terbaru</CardTitle>
        </CardHeader>
        <CardContent>
          {recentAbsensi?.length ? (
            <div className="space-y-2">
              {recentAbsensi.slice(0, 5).map((a) => (
                <div key={a.id} className="flex justify-between items-center py-2 border-b last:border-0">
                  <span>{a.tanggal}</span>
                  <span className="text-sm text-muted-foreground">
                    {a.checkIn ? new Date(a.checkIn).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '-'}
                    {' → '}
                    {a.checkOut ? new Date(a.checkOut).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '-'}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">{a.status}</span>
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
