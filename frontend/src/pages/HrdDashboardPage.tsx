import { useNavigate } from '@tanstack/react-router'
import { useHrdWeek, useMonthAttendance } from '@/hooks/useDashboard'
import { useUsers } from '@/hooks/useUsers'
import { useAllPengajuan } from '@/hooks/usePengajuan'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { AttendanceCalendar } from '@/components/AttendanceCalendar'
import { RefreshCw, Users, CheckCircle2, AlertTriangle, Clock, ArrowRight } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

const today = new Date()
const currentMonth = today.getMonth()
const currentYear = today.getFullYear()

export default function HrdDashboardPage() {
  const navigate = useNavigate()
  const { data: hrdData, isLoading, refetch, isFetching } = useHrdWeek()
  const { data: monthData, isLoading: monthLoading } = useMonthAttendance(currentYear, currentMonth)
  const { data: users } = useUsers()
  const { data: pengajuan } = useAllPengajuan()

  const s = hrdData?.summary
  const chart = hrdData?.chart || []
  const pendingPengajuan = pengajuan?.filter((p) => p.status === 'pending').length || 0
  const pendingUsers = users?.filter((u) => u.status === 'pending').length || 0
  const lateToday = s?.terlambatHariIni || 0

  const todayAbsensi = {
    hadir: s?.hadirHariIni || 0,
    terlambat: s?.terlambatHariIni || 0,
    izin: s?.izinHariIni || 0,
    belum: s?.belumAbsen || 0,
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard HRD</h1>
          <p className="text-muted-foreground text-sm">
            {today.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <Button variant="outline" size="sm" className="gap-2" onClick={() => refetch()} disabled={isFetching}>
          <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="py-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-muted-foreground">Total Karyawan</span>
              <Users className="h-4 w-4 text-primary" />
            </div>
            <p className="text-3xl font-bold">{isLoading ? '-' : s?.totalKaryawan || 0}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="py-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-muted-foreground">Hadir Hari Ini</span>
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            </div>
            <p className="text-3xl font-bold text-green-600">{todayAbsensi.hadir}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="py-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-muted-foreground">Terlambat</span>
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
            </div>
            <p className="text-3xl font-bold text-yellow-600">{todayAbsensi.terlambat}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="py-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-muted-foreground">Verifikasi Tertunda</span>
              <Clock className="h-4 w-4 text-blue-600" />
            </div>
            <p className="text-3xl font-bold text-blue-600">{pendingUsers}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <div className="px-6 pt-6 pb-2">
            <h3 className="font-semibold text-base">Tren Kehadiran 7 Hari</h3>
          </div>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-[220px] w-full rounded-lg" />
            ) : chart.length > 0 ? (
              <div className="h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chart}>
                    <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                    <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid var(--border)' }} formatter={(value) => [`${value} orang`]} />
                    <Bar dataKey="hadir" fill="var(--chart-1)" radius={[4, 4, 0, 0]} stackId="a" />
                    <Bar dataKey="terlambat" fill="var(--chart-2)" radius={[4, 4, 0, 0]} stackId="a" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[220px] flex items-center justify-center text-sm text-muted-foreground">Belum ada data</div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <div className="px-6 pt-6 pb-2 flex items-center justify-between">
              <h3 className="font-semibold text-base">Ringkasan</h3>
            </div>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between py-1.5 border-b last:border-0">
                <span className="text-sm text-muted-foreground">Rata-rata kehadiran</span>
                <span className="text-sm font-semibold">{s?.weekAvg || 0}%</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b last:border-0">
                <span className="text-sm text-muted-foreground">Belum absen hari ini</span>
                <span className="text-sm font-semibold">{todayAbsensi.belum}</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b last:border-0">
                <span className="text-sm text-muted-foreground">Izin/Sakit/Cuti</span>
                <span className="text-sm font-semibold">{todayAbsensi.izin}</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b last:border-0">
                <span className="text-sm text-muted-foreground">Pengajuan pending</span>
                <span className="text-sm font-semibold">{pendingPengajuan}</span>
              </div>
              <div className="flex items-center justify-between py-1.5">
                <span className="text-sm text-muted-foreground">Verifikasi pending</span>
                <span className="text-sm font-semibold">{pendingUsers}</span>
              </div>
            </CardContent>
          </Card>

          <Button variant="outline" className="w-full gap-2" onClick={() => navigate({ to: '/hrd/verifikasi' })}>
            <Clock className="h-4 w-4" /> Verifikasi Karyawan
            {pendingUsers > 0 && <Badge className="ml-1 bg-primary">{pendingUsers}</Badge>}
            <ArrowRight className="h-4 w-4 ml-auto" />
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          {monthLoading ? (
            <Skeleton className="h-[300px] w-full rounded-lg" />
          ) : (
            <AttendanceCalendar
              year={currentYear}
              month={currentMonth}
              data={monthData?.data || []}
              totalKaryawan={monthData?.totalKaryawan || s?.totalKaryawan || 0}
            />
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <div className="px-6 pt-6 pb-2 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-base">Verifikasi Tertunda</h3>
              <p className="text-xs text-muted-foreground">Karyawan yang menunggu persetujuan</p>
            </div>
            <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-0">{pendingUsers} perlu</Badge>
          </div>
          <CardContent>
            {pendingUsers > 0 ? (
              <div className="space-y-3">
                {users?.filter((u) => u.status === 'pending').slice(0, 5).map((u) => (
                  <div key={u.id} className="flex items-center justify-between py-2 border-b last:border-0">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-700 font-bold text-sm">
                        {u.nama?.charAt(0)?.toUpperCase() || '?'}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{u.nama}</p>
                        <p className="text-xs text-muted-foreground">{u.email}</p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-0 text-[10px]">Pending</Badge>
                  </div>
                ))}
                <Button variant="ghost" className="w-full text-sm gap-1" onClick={() => navigate({ to: '/hrd/verifikasi' })}>
                  Lihat semua <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground py-4 text-center">Tidak ada verifikasi tertunda</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <div className="px-6 pt-6 pb-2">
            <h3 className="font-semibold text-base">Karyawan Terlambat Hari Ini</h3>
          </div>
          <CardContent>
            {lateToday > 0 ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b">
                  <span className="text-sm text-muted-foreground">{lateToday} karyawan terlambat hari ini</span>
                  <span className="text-sm font-semibold text-yellow-600">{lateToday} orang</span>
                </div>
                <Button variant="outline" className="w-full text-sm" onClick={() => navigate({ to: '/hrd/riwayat' })}>
                  Lihat Riwayat
                </Button>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground py-4 text-center">Semua karyawan hadir tepat waktu hari ini</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
