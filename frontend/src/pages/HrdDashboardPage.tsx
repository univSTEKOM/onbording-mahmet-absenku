import { useNavigate } from '@tanstack/react-router'
import { useHrdWeek, useMonthAttendance } from '@/hooks/useDashboard'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

import { Skeleton } from '@/components/ui/skeleton'
import { AttendanceCalendar } from '@/components/AttendanceCalendar'
import { StatsCard } from '@/components/shared/StatsCard'
import { RefreshCw, Users, CheckCircle2, AlertTriangle, ArrowRight, UserCheck } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import api from '@/api/axios'
import type { User } from '@/types'

const today = new Date()
const currentMonth = today.getMonth()
const currentYear = today.getFullYear()

export default function HrdDashboardPage() {
  const navigate = useNavigate()
  const { data: hrdData, isLoading, refetch, isFetching } = useHrdWeek()
  const { data: monthData, isLoading: monthLoading } = useMonthAttendance(currentYear, currentMonth)
  const { data: pendingUsers } = useQuery({
    queryKey: ['users', 'pending'],
    queryFn: () => api.get('/api/users/pending').then((r) => r.data as User[]),
  })

  const s = hrdData?.summary
  const chart = hrdData?.chart || []
  const pendingCount = pendingUsers?.length || 0
  const totalKaryawan = s?.totalKaryawan || 0

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
          <RefreshCw className={'h-4 w-4' + (isFetching ? ' animate-spin' : '')} />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          label="Total Karyawan"
          value={isLoading ? '-' : String(totalKaryawan)}
          icon={Users}
        />
        <StatsCard
          label="Hadir Hari Ini"
          value={isLoading ? '-' : String(s?.hadirHariIni || 0)}
          icon={CheckCircle2}
        />
        <StatsCard
          label="Terlambat"
          value={isLoading ? '-' : String(s?.terlambatHariIni || 0)}
          icon={AlertTriangle}
        />
        <Card className="relative">
          <CardContent className="py-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-muted-foreground">Verifikasi Karyawan</span>
              <UserCheck className="h-4 w-4 text-blue-600" />
            </div>
            <p className="text-3xl font-bold text-blue-600">{pendingCount}</p>
            {pendingCount > 0 && (
              <Button
                size="sm"
                variant="ghost"
                className="absolute bottom-2 right-2 gap-1 text-xs text-blue-600 h-7"
                onClick={() => navigate({ to: '/hrd/verifikasi' })}
              >
                Lihat <ArrowRight className="h-3 w-3" />
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <div className="px-6 pt-6 pb-2">
            <h3 className="font-semibold text-base">Tren Kehadiran 7 Hari</h3>
            <p className="text-xs text-muted-foreground">
              {new Date(today.getTime() - 6 * 86400000).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
              {' — '}
              {today.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
            </p>
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
                    <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid var(--border)' }} formatter={(value) => [String(value) + ' orang']} />
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
            <div className="px-6 pt-6 pb-2">
              <h3 className="font-semibold text-base">Ringkasan Hari Ini</h3>
              <p className="text-xs text-muted-foreground">{today.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
            </div>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between py-1.5 border-b last:border-0">
                <span className="text-sm text-muted-foreground">Total Karyawan</span>
                <span className="text-sm font-semibold">{totalKaryawan} orang</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b last:border-0">
                <span className="text-sm text-muted-foreground">Hadir</span>
                <span className="text-sm font-semibold text-green-600">{s?.hadirHariIni || 0}</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b last:border-0">
                <span className="text-sm text-muted-foreground">Terlambat</span>
                <span className="text-sm font-semibold text-yellow-600">{s?.terlambatHariIni || 0}</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b last:border-0">
                <span className="text-sm text-muted-foreground">Izin / Sakit / Cuti</span>
                <span className="text-sm font-semibold">{s?.izinHariIni || 0}</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b last:border-0">
                <span className="text-sm text-muted-foreground">Belum Absen</span>
                <span className="text-sm font-semibold text-muted-foreground">{s?.belumAbsen || 0}</span>
              </div>
              <div className="flex items-center justify-between py-1.5">
                <span className="text-sm text-muted-foreground">Rata-rata pekan ini</span>
                <span className="text-sm font-semibold">{s?.weekAvg || 0}%</span>
              </div>
            </CardContent>
          </Card>

          {pendingCount > 0 && (
            <Card className="border-blue-200 dark:border-blue-800">
              <CardContent className="py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <UserCheck className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium">{pendingCount} karyawan perlu verifikasi</span>
                  </div>
                  <Button size="sm" variant="outline" className="gap-1" onClick={() => navigate({ to: '/hrd/verifikasi' })}>
                    Verifikasi <ArrowRight className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {s?.terlambatHariIni && s.terlambatHariIni > 0 ? (
            <Card>
              <CardContent className="py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    <span className="text-sm">{s.terlambatHariIni} karyawan terlambat hari ini</span>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => navigate({ to: '/hrd/riwayat' })}>Riwayat</Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-4">
                <p className="text-sm text-muted-foreground text-center">Semua karyawan hadir tepat waktu hari ini</p>
              </CardContent>
            </Card>
          )}
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
              totalKaryawan={monthData?.totalKaryawan || totalKaryawan}
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
