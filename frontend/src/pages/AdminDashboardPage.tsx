import { useMemo } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useAdminWeek, useMonthAttendance } from '@/hooks/useDashboard'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { CalendarCard } from '@/components/CalendarCard'
import { AttendancePieChart } from '@/components/shared/AttendancePieChart'
import { RefreshCw, Users, CheckCircle2, AlertTriangle, UserCheck, ArrowRight } from 'lucide-react'
import { WeekAttendanceChart } from '@/components/shared/WeekAttendanceChart'
import { absensiChartConfig, pieDataItem } from '@/lib/chart-config'
import api from '@/api/axios'
import type { User } from '@/types'

var today = new Date()
var currentMonth = today.getMonth()
var currentYear = today.getFullYear()

var pieId = 'pie-kehadiran'

var monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']

export default function AdminDashboardPage() {
  var navigate = useNavigate()
  var { data: adminData, isLoading, refetch, isFetching } = useAdminWeek()
  var { data: monthData, isLoading: monthLoading } = useMonthAttendance(currentYear, currentMonth + 1)
  var { data: pendingUsers } = useQuery({
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
      pieDataItem('hadir', hadirTotal),
      pieDataItem('terlambat', terlambatTotal),
      pieDataItem('izin', izinTotal),
      pieDataItem('sakit', sakitTotal),
      pieDataItem('cuti', cutiTotal),
      pieDataItem('tidakHadir', alfaTotal),
    ]
  }, [monthData])

  var totalAbsen = donutData.reduce(function(s, d) { return s + d.value }, 0)
  var hadirVal = donutData[0]?.value ?? 0
  var hadirPct = totalAbsen > 0 ? Math.round((hadirVal / totalAbsen) * 100) : 0

  var statsData = [
    {
      label: 'Total Karyawan',
      value: isLoading ? '-' : String(totalKaryawan),
      icon: Users,
      accent: 'border-t-primary',
      iconBg: 'bg-primary/10 text-primary',
      secondary: null,
    },
    {
      label: 'Hadir Hari Ini',
      value: isLoading ? '-' : String(s?.hadirHariIni || 0),
      subtitle: s?.hadirHariIni !== undefined ? 'dari ' + totalKaryawan + ' (' + (totalKaryawan > 0 ? Math.round((s.hadirHariIni / totalKaryawan) * 100) : 0) + '%)' : null,
      icon: CheckCircle2,
      accent: 'border-t-emerald-500',
      iconBg: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400',
    },
    {
      label: 'Terlambat',
      value: isLoading ? '-' : String(s?.terlambatHariIni || 0),
      icon: AlertTriangle,
      accent: 'border-t-amber-500',
      iconBg: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
      link: s?.terlambatHariIni && s.terlambatHariIni > 0 ? { text: 'Lihat detail', to: '/admin/riwayat' } : null,
    },
    {
      label: 'Verifikasi',
      value: String(pendingCount),
      icon: UserCheck,
      accent: pendingCount > 0 ? 'border-t-blue-500' : 'border-t-muted',
      iconBg: pendingCount > 0 ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-muted text-muted-foreground',
      subtitle: pendingCount > 0 ? 'menunggu persetujuan' : 'tidak ada',
      link: pendingCount > 0 ? { text: 'Verifikasi', to: '/admin/verifikasi' } : null,
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
        <Button variant="outline" size="icon" onClick={function() { refetch() }} disabled={isFetching}>
          <RefreshCw className={'h-4 w-4' + (isFetching ? ' animate-spin' : '')} />
        </Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-4 gap-3 md:gap-4">
        {statsData.map(function(stat) {
          var Icon = stat.icon
          return (
            <Card key={stat.label} className={'border-t-2 ' + stat.accent}>
              <CardContent className="p-3 md:p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] md:text-xs font-medium text-muted-foreground">{stat.label}</span>
                  <div className={'p-1.5 rounded-md ' + stat.iconBg}>
                    <Icon className="h-3.5 w-3.5" />
                  </div>
                </div>
                <p className="text-xl md:text-2xl font-bold">{stat.value}</p>
                {stat.subtitle && (
                  <p className="text-[10px] md:text-xs text-muted-foreground mt-0.5">{stat.subtitle}</p>
                )}
                {stat.link && (
                  <button
                    type="button"
                    onClick={function(e) { e.stopPropagation(); navigate({ to: stat.link!.to }) }}
                    className="text-[11px] md:text-xs text-primary hover:text-primary/80 mt-1 inline-flex items-center gap-0.5 font-medium transition-colors"
                  >
                    {stat.link.text}
                    <ArrowRight className="h-3 w-3" />
                  </button>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-5">
        <Card className="lg:col-span-2">
          <CardHeader className="px-4 md:px-5 pt-4 md:pt-5 pb-2">
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
              config={absensiChartConfig}
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
                {monthNames[currentMonth]} {currentYear}
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="flex flex-1 flex-col items-center justify-center pb-3 px-4 md:px-5">
            <AttendancePieChart
              id={pieId}
              data={donutData}
              config={absensiChartConfig}
              centerLabel={hadirPct + '%'}
              centerSub="hadir"
              loading={monthLoading}
            />
            <p className="text-[11px] text-muted-foreground text-center -mt-1">
              {totalAbsen > 0 ? 'Total ' + totalAbsen + ' absensi tercatat' : 'Belum ada data'}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-4 md:p-5">
          {monthData ? (
            <CalendarCard
              year={currentYear}
              month={currentMonth}
              data={monthData?.data || []}
              totalKaryawan={monthData?.totalKaryawan || totalKaryawan}
            />
          ) : (
            <Skeleton className="h-[220px] md:h-[260px] w-full rounded-lg" />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
