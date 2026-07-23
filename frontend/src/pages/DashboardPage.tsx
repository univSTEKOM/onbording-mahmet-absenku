import { useState } from 'react'
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
import { absensiStatusBadge, absensiStatusLabel } from '@/lib/constants'
import { Fingerprint, Clock, CalendarDays, TrendingUp, ChevronRight } from 'lucide-react'
import { BarChart, Bar, Cell, XAxis, Tooltip, ResponsiveContainer } from 'recharts'

const now = new Date()
const curMonth = now.getMonth()
const curYear = now.getFullYear()

const STATUS_BAR_COLORS: Record<string, string> = {
  hadir: 'var(--chart-1)',
  terlambat: 'var(--chart-2)',
  pulang_cepat: 'var(--chart-3)',
}

function hitungJam(checkIn: string | null, checkOut: string | null): string {
  if (!checkIn || !checkOut) return '-'
  const selisih = Math.max(0, new Date(checkOut).getTime() - new Date(checkIn).getTime())
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
    hadir: allAbsensi?.filter((a) => a.tanggal.startsWith(`${curYear}-${String(curMonth + 1).padStart(2, '0')}`) && ['hadir', 'pulang_cepat'].includes(a.status)).length || 0,
    terlambat: allAbsensi?.filter((a) => a.tanggal.startsWith(`${curYear}-${String(curMonth + 1).padStart(2, '0')}`) && a.status === 'terlambat').length || 0,
  }

  const recent5 = allAbsensi?.slice(0, 5)

  const chartData = (recentAbsensi || []).map((item) => ({
    dayName: new Date(item.tanggal).toLocaleDateString('id-ID', { weekday: 'short' }),
    tanggal: item.tanggal,
    status: item.status,
    hadir: item.status && ['hadir'].includes(item.status) ? 1 : 0,
    terlambat: item.status === 'terlambat' ? 1 : 0,
    pulangCepat: item.status === 'pulang_cepat' ? 1 : 0,
    checkIn: item.checkIn ? new Date(item.checkIn).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '-',
    checkOut: item.checkOut ? new Date(item.checkOut).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '-',
  }))

  const chartBarColor = (entry: typeof chartData[number]) => {
    if (entry.status && STATUS_BAR_COLORS[entry.status]) return STATUS_BAR_COLORS[entry.status]
    return 'var(--muted-foreground)'
  }

  if (!user) return null

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Selamat datang kembali, <span className="font-medium text-foreground">{user.nama}</span></p>
        </div>
        <Button size="lg" className="gap-2 shadow-sm" onClick={() => navigate({ to: '/absensi' })}>
          <Fingerprint className="h-4 w-4" /> Absen Sekarang
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard label="Status Hari Ini" value={isCheckedOut ? 'Selesai' : isCheckedIn ? 'Check-in' : 'Belum'} icon={Clock} />
        <StatsCard label="Hadir (Bulan Ini)" value={`${monthStats.hadir} hari`} icon={CalendarDays} />
        <StatsCard label="Terlambat" value={`${monthStats.terlambat} kali`} icon={TrendingUp} />
        <StatsCard label="Total Absensi" value={`${monthStats.total} hari`} icon={Fingerprint} />
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
              <div>
                <div className="h-44">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} barSize={36}>
                      <XAxis dataKey="dayName" fontSize={12} tickLine={false} axisLine={false} />
                      <Tooltip
                        contentStyle={{ borderRadius: 8, border: '1px solid var(--border)', fontSize: 13 }}
                        formatter={(_value, _name, props) => {
                          const d = props.payload
                          if (!d.status) return ['Tidak absen', 'Status']
                          return [
                            `${absensiStatusLabel[d.status as keyof typeof absensiStatusLabel] || d.status} · ${d.checkIn} - ${d.checkOut}`,
                            'Status',
                          ]
                        }}
                        labelFormatter={(label) => `${label}`}
                      />
                      <Bar dataKey="hadir" stackId="a" radius={[4, 4, 0, 0]}>
                        {chartData.map((entry, i) => (
                          <Cell key={i} fill={chartBarColor(entry)} />
                        ))}
                      </Bar>
                      <Bar dataKey="terlambat" stackId="a" radius={[4, 4, 0, 0]}>
                        {chartData.map((entry, i) => (
                          <Cell key={i} fill={chartBarColor(entry)} />
                        ))}
                      </Bar>
                      <Bar dataKey="pulangCepat" stackId="a" radius={[4, 4, 0, 0]}>
                        {chartData.map((entry, i) => (
                          <Cell key={i} fill={chartBarColor(entry)} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex items-center justify-center gap-4 mt-2 text-[11px] text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <span className="size-3 rounded-sm" style={{ backgroundColor: 'var(--chart-1)' }} /> Hadir
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="size-3 rounded-sm" style={{ backgroundColor: 'var(--chart-2)' }} /> Terlambat
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="size-3 rounded-sm" style={{ backgroundColor: 'var(--chart-3)' }} /> Pulang Cepat
                  </span>
                </div>
              </div>
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
              </>
            ) : (
              <div className="text-center py-6 text-muted-foreground text-sm">Belum ada absensi hari ini</div>
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
