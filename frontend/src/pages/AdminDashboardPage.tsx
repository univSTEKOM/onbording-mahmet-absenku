import { useMemo } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useAdminWeek, useMonthAttendance } from '@/hooks/useDashboard'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { CalendarCard } from '@/components/CalendarCard'
import { AttendancePieChart } from '@/components/shared/AttendancePieChart'
import { RefreshCw, Users, CheckCircle2, AlertTriangle, UserCheck } from 'lucide-react'
import { type ChartConfig } from '@/components/ui/chart'
import { WeekAttendanceChart } from '@/components/shared/WeekAttendanceChart'
import api from '@/api/axios'
import type { User } from '@/types'

const today = new Date()
const currentMonth = today.getMonth()
const currentYear = today.getFullYear()

const barChartConfig = {
  tidakHadir: { label: 'Alfa', color: 'color-mix(in srgb, var(--color-status-tidakHadir) 30%, transparent)' },
  hadir: { label: 'Hadir', color: 'color-mix(in srgb, var(--color-status-hadir) 30%, transparent)' },
  izin: { label: 'Izin', color: 'color-mix(in srgb, var(--color-status-izin) 30%, transparent)' },
  terlambat: { label: 'Terlambat', color: 'color-mix(in srgb, var(--color-status-terlambat) 30%, transparent)' },
  sakit: { label: 'Sakit', color: 'color-mix(in srgb, var(--color-status-sakit) 30%, transparent)' },
  cuti: { label: 'Cuti', color: 'color-mix(in srgb, var(--color-status-cuti) 30%, transparent)' },
} satisfies ChartConfig

const pieChartConfig = {
  hadir: { label: 'Hadir', color: 'color-mix(in srgb, var(--color-status-hadir) 30%, transparent)' },
  terlambat: { label: 'Terlambat', color: 'color-mix(in srgb, var(--color-status-terlambat) 30%, transparent)' },
  izin: { label: 'Izin', color: 'color-mix(in srgb, var(--color-status-izin) 30%, transparent)' },
  sakit: { label: 'Sakit', color: 'color-mix(in srgb, var(--color-status-sakit) 30%, transparent)' },
  cuti: { label: 'Cuti', color: 'color-mix(in srgb, var(--color-status-cuti) 30%, transparent)' },
  tidakHadir: { label: 'Alfa', color: 'color-mix(in srgb, var(--color-status-tidakHadir) 30%, transparent)' },
} satisfies ChartConfig

const pieId = 'pie-kehadiran'

export default function AdminDashboardPage() {
  const navigate = useNavigate()
  const { data: adminData, isLoading, refetch, isFetching } = useAdminWeek()
  const { data: monthData, isLoading: monthLoading } = useMonthAttendance(currentYear, currentMonth + 1)
  const { data: pendingUsers } = useQuery({
    queryKey: ['users', 'pending'],
    queryFn: function() { return api.get('/api/users/pending').then(function(r) { return r.data as User[] }) },
  })

  var s = adminData?.summary
  var chart = adminData?.chart || []
  var pendingCount = pendingUsers?.length || 0
  var totalKaryawan = s?.totalKaryawan || 0

  var donutData = useMemo(function() {
    if (!monthData?.data) return []
    var hadirTotal = monthData.data.reduce(function(sum, d) { return sum + (d.hadir || 0) }, 0)
    var terlambatTotal = monthData.data.reduce(function(sum, d) { return sum + (d.terlambat || 0) }, 0)
    var izinTotal = monthData.data.reduce(function(sum, d) { return sum + (d.izin || 0) }, 0)
    var sakitTotal = monthData.data.reduce(function(sum, d) { return sum + (d.sakit || 0) }, 0)
    var cutiTotal = monthData.data.reduce(function(sum, d) { return sum + (d.cuti || 0) }, 0)
    var alfaTotal = monthData.data.reduce(function(sum, d) { return sum + (d.tidakHadir || 0) }, 0)
    return [
      { name: 'hadir', value: hadirTotal, fill: 'var(--color-status-hadir)' },
      { name: 'terlambat', value: terlambatTotal, fill: 'var(--color-status-terlambat)' },
      { name: 'izin', value: izinTotal, fill: 'var(--color-status-izin)' },
      { name: 'sakit', value: sakitTotal, fill: 'var(--color-status-sakit)' },
      { name: 'cuti', value: cutiTotal, fill: 'var(--color-status-cuti)' },
      { name: 'tidakHadir', value: alfaTotal, fill: 'var(--color-status-tidakHadir)' },
    ]
  }, [monthData])

  var totalAbsen = donutData.reduce(function(s, d) { return s + d.value }, 0)
  var hadirVal = donutData[0]?.value ?? 0
  var hadirPct = totalAbsen > 0 ? Math.round((hadirVal / totalAbsen) * 100) : 0

  var statsCards = [
    {
      label: 'Total Karyawan', value: isLoading ? '-' : String(totalKaryawan),
      icon: Users, color: 'text-primary', bg: 'bg-primary/10', secondary: null,
    },
    {
      label: 'Hadir Hari Ini', value: isLoading ? '-' : String(s?.hadirHariIni || 0),
      icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-100 dark:bg-emerald-900/30',
      secondary: s?.hadirHariIni !== undefined ? 'dari ' + totalKaryawan + ' karyawan' : null,
    },
    {
      label: 'Terlambat', value: isLoading ? '-' : String(s?.terlambatHariIni || 0),
      icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-100 dark:bg-amber-900/30',
      secondary: s?.terlambatHariIni && s.terlambatHariIni > 0 ? 'Lihat detail' : null,
      onClick: s?.terlambatHariIni && s.terlambatHariIni > 0 ? function() { navigate({ to: '/admin/riwayat' }) } : undefined,
    },
    {
      label: 'Verifikasi', value: String(pendingCount),
      icon: UserCheck, color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-900/30',
      secondary: 'karyawan perlu verifikasi',
      onClick: pendingCount > 0 ? function() { navigate({ to: '/admin/verifikasi' }) } : undefined,
    },
  ]

  return (
    <div className="space-y-5 md:space-y-6">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight">Admin</h1>
          <p className="text-xs md:text-sm text-muted-foreground">
            {today.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <Button variant="outline" size="sm" className="gap-2 shrink-0" onClick={function() { refetch() }} disabled={isFetching}>
          <RefreshCw className={'h-4 w-4' + (isFetching ? ' animate-spin' : '')} />
          Refresh
        </Button>
      </div>

      <div className="flex gap-3 md:gap-4 overflow-x-auto pb-1">
        {statsCards.map(function(stat) {
          var Icon = stat.icon
          return (
            <Card
              key={stat.label}
              className={'shrink-0 w-[140px] md:w-[160px]' + (stat.onClick ? ' cursor-pointer hover:bg-muted/30 transition-colors' : '')}
              onClick={stat.onClick}
            >
              <CardContent className="p-3 md:p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className={'p-1.5 rounded-md ' + stat.bg}>
                    <Icon className={'h-3.5 w-3.5 ' + stat.color} />
                  </div>
                  <span className="text-[11px] md:text-xs text-muted-foreground truncate">{stat.label}</span>
                </div>
                <p className={'text-xl md:text-2xl font-bold ' + stat.color}>{stat.value}</p>
                {stat.secondary && (
                  <p className="text-[10px] md:text-xs text-muted-foreground mt-0.5">{stat.secondary}</p>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-5">
        <Card className="lg:col-span-2">
          <CardHeader className="px-4 md:px-5 pt-4 md:pt-5">
            <CardTitle className="text-sm md:text-base">Tren Kehadiran 7 Hari</CardTitle>
            <CardDescription className="text-[11px] md:text-xs">
              {new Date(today.getTime() - 6 * 86400000).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
              {' — '}
              {today.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
            </CardDescription>
          </CardHeader>
          <CardContent className="px-4 md:px-5 pb-4 md:pb-5">
            <WeekAttendanceChart
              data={chart}
              config={barChartConfig}
              legendOrder={['cuti', 'sakit', 'terlambat', 'izin', 'hadir', 'tidakHadir']}
              loading={isLoading}
            />
          </CardContent>
        </Card>

        <Card className="flex flex-col">
          <CardHeader className="flex-row items-start space-y-0 pb-0 px-4 md:px-5 pt-4 md:pt-5">
            <div className="grid gap-0.5">
              <CardTitle className="text-sm md:text-base">Kehadiran Bulan Ini</CardTitle>
              <CardDescription className="text-[11px] md:text-xs">
                {['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'][currentMonth]} {currentYear}
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="flex flex-1 flex-col items-center justify-center pb-0 px-4 md:px-5">
            <AttendancePieChart
              id={pieId}
              data={donutData}
              config={pieChartConfig}
              centerLabel={hadirPct + '%'}
              centerSub="hadir"
              loading={monthLoading}
            />
          </CardContent>
        </Card>
      </div>

      {monthLoading ? (
        <Skeleton className="h-[260px] md:h-[300px] w-full rounded-lg" />
      ) : (
        <CalendarCard
          year={currentYear}
          month={currentMonth}
          data={monthData?.data || []}
          totalKaryawan={monthData?.totalKaryawan || totalKaryawan}
        />
      )}
    </div>
  )
}
