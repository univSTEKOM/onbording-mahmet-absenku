import { useMemo } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useHrdWeek, useMonthAttendance } from '@/hooks/useDashboard'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { AttendanceCalendar } from '@/components/AttendanceCalendar'
import { StatsCard } from '@/components/shared/StatsCard'
import { RefreshCw, Users, CheckCircle2, AlertTriangle, UserCheck, ArrowRight } from 'lucide-react'
import { Pie, PieChart, Label } from 'recharts'
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartStyle, type ChartConfig } from '@/components/ui/chart'
import { WeekAttendanceChart } from '@/components/shared/WeekAttendanceChart'
import api from '@/api/axios'
import type { User } from '@/types'

const today = new Date()
const currentMonth = today.getMonth()
const currentYear = today.getFullYear()

const barChartConfig = {
  tidakHadir: { label: 'Alfa', color: 'var(--chart-1)' },
  hadir: { label: 'Hadir', color: 'var(--chart-2)' },
  izin: { label: 'Izin', color: 'var(--chart-3)' },
  terlambat: { label: 'Terlambat', color: 'var(--chart-4)' },
  sakit: { label: 'Sakit', color: 'var(--chart-5)' },
  cuti: { label: 'Cuti', color: 'var(--chart-6)' },
} satisfies ChartConfig

const pieChartConfig = {
  hadir: { label: 'Hadir', color: 'var(--chart-1)' },
  terlambat: { label: 'Terlambat', color: 'var(--chart-2)' },
  izin: { label: 'Izin', color: 'var(--chart-3)' },
  sakit: { label: 'Sakit', color: 'var(--chart-4)' },
  cuti: { label: 'Cuti', color: 'var(--chart-5)' },
  tidakHadir: { label: 'Alfa', color: 'var(--chart-6)' },
} satisfies ChartConfig

const pieId = 'pie-kehadiran'

export default function HrdDashboardPage() {
  const navigate = useNavigate()
  const { data: hrdData, isLoading, refetch, isFetching } = useHrdWeek()
  const { data: monthData, isLoading: monthLoading } = useMonthAttendance(currentYear, currentMonth + 1)
  const { data: pendingUsers } = useQuery({
    queryKey: ['users', 'pending'],
    queryFn: () => api.get('/api/users/pending').then((r) => r.data as User[]),
  })

  const s = hrdData?.summary
  const chart = hrdData?.chart || []
  const pendingCount = pendingUsers?.length || 0
  const totalKaryawan = s?.totalKaryawan || 0

  const donutData = useMemo(() => {
    if (!monthData?.data) return []
    const hadirTotal = monthData.data.reduce((sum, d) => sum + (d.hadir || 0), 0)
    const terlambatTotal = monthData.data.reduce((sum, d) => sum + (d.terlambat || 0), 0)
    const izinTotal = monthData.data.reduce((sum, d) => sum + (d.izin || 0), 0)
    const sakitTotal = monthData.data.reduce((sum, d) => sum + (d.sakit || 0), 0)
    const cutiTotal = monthData.data.reduce((sum, d) => sum + (d.cuti || 0), 0)
    const alfaTotal = monthData.data.reduce((sum, d) => sum + (d.tidakHadir || 0), 0)
    return [
      { name: 'hadir', value: hadirTotal, fill: 'var(--color-hadir)' },
      { name: 'terlambat', value: terlambatTotal, fill: 'var(--color-terlambat)' },
      { name: 'izin', value: izinTotal, fill: 'var(--color-izin)' },
      { name: 'sakit', value: sakitTotal, fill: 'var(--color-sakit)' },
      { name: 'cuti', value: cutiTotal, fill: 'var(--color-cuti)' },
      { name: 'tidakHadir', value: alfaTotal, fill: 'var(--color-tidakHadir)' },
    ]
  }, [monthData])

  const totalAbsen = donutData.reduce((s, d) => s + d.value, 0)
  const hadirVal = donutData[0]?.value ?? 0
  const hadirPct = totalAbsen > 0 ? Math.round((hadirVal / totalAbsen) * 100) : 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Admin</h1>
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
        <StatsCard label="Total Karyawan" value={isLoading ? '-' : String(totalKaryawan)} icon={Users} />
        <Card>
          <CardContent className="py-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-muted-foreground">Hadir Hari Ini</span>
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            </div>
            <p className="text-3xl font-bold text-green-600">{isLoading ? '-' : s?.hadirHariIni || 0}</p>
            <p className="text-xs text-muted-foreground mt-1">dari {totalKaryawan} karyawan</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-muted-foreground">Terlambat</span>
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
            </div>
            <p className="text-3xl font-bold text-yellow-600">{isLoading ? '-' : s?.terlambatHariIni || 0}</p>
            {s?.terlambatHariIni && s.terlambatHariIni > 0 && (
              <Button variant="link" size="sm" className="h-5 p-0 text-xs text-muted-foreground" onClick={() => navigate({ to: '/hrd/riwayat' })}>
                Lihat detail →
              </Button>
            )}
          </CardContent>
        </Card>
        <Card className="relative">
          <CardContent className="py-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-muted-foreground">Verifikasi</span>
              <UserCheck className="h-4 w-4 text-blue-600" />
            </div>
            <p className="text-3xl font-bold text-blue-600">{pendingCount}</p>
            <p className="text-xs text-muted-foreground mt-1">karyawan perlu verifikasi</p>
            {pendingCount > 0 && (
              <Button size="sm" variant="ghost" className="absolute bottom-2 right-2 gap-1 text-xs text-blue-600 h-7" onClick={() => navigate({ to: '/hrd/verifikasi' })}>
                Verifikasi <ArrowRight className="h-3 w-3" />
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Tren Kehadiran 7 Hari</CardTitle>
            <CardDescription>
              {new Date(today.getTime() - 6 * 86400000).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
              {' — '}
              {today.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <WeekAttendanceChart
              data={chart}
              config={barChartConfig}
              legendOrder={['cuti', 'sakit', 'terlambat', 'izin', 'hadir', 'tidakHadir']}
              loading={isLoading}
            />
          </CardContent>
        </Card>

        <Card data-chart={pieId} className="flex flex-col">
          <ChartStyle id={pieId} config={pieChartConfig} />
          <CardHeader className="flex-row items-start space-y-0 pb-0">
            <div className="grid gap-1">
              <CardTitle>Kehadiran Bulan Ini</CardTitle>
              <CardDescription>{['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'][currentMonth]} {currentYear}</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="flex flex-1 flex-col items-center justify-center pb-0">
            {monthLoading ? (
              <Skeleton className="h-[250px] w-full rounded-lg" />
            ) : donutData.length > 0 && totalAbsen > 0 ? (
              <>
                <ChartContainer id={pieId} config={pieChartConfig} className="mx-auto aspect-square w-full max-w-[250px]">
                  <PieChart>
                    <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                    <Pie data={donutData} dataKey="value" nameKey="name" innerRadius={60} strokeWidth={1}
                      stroke="hsl(var(--border))"
                      shape={renderPieShape}
                      activeIndex={activeIndex}
                      onMouseEnter={(_, index) => setActiveIndex(index)}
                      onMouseLeave={() => setActiveIndex(undefined)}
                    >
                      <Label
                        content={({ viewBox }) => {
                          if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                            return (
                              <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                                <tspan x={viewBox.cx} y={(viewBox.cy || 0) - 8} className="fill-foreground text-2xl font-bold">{hadirPct}%</tspan>
                                <tspan x={viewBox.cx} y={(viewBox.cy || 0) + 16} className="fill-muted-foreground text-xs">hadir</tspan>
                              </text>
                            )
                          }
                        }}
                      />
                    </Pie>
                  </PieChart>
                </ChartContainer>
                <div className="flex flex-wrap items-center justify-center gap-4 text-[11px] text-muted-foreground mt-2">
                  {donutData.map((d) => (
                    <span key={d.name} className="flex items-center gap-1.5">
                      <span className="size-3 rounded-sm" style={{ backgroundColor: `var(--color-${d.name})` }} />
                      {d.name === 'tidakHadir' ? 'Alfa' : d.name.charAt(0).toUpperCase() + d.name.slice(1)}
                    </span>
                  ))}
                </div>
              </>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-sm text-muted-foreground">Belum ada data</div>
            )}
          </CardContent>
        </Card>
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
