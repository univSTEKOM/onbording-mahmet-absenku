import { useHrdWeek } from '@/hooks/useDashboard'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { RefreshCw, Users, CheckCircle2, XCircle, AlertTriangle, Clock, FileText, FileCheck, FileX } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

const statusKaryawan = [
  { key: 'hadir', label: 'Hadir', icon: CheckCircle2, color: 'text-green-600' },
  { key: 'terlambat', label: 'Terlambat', icon: AlertTriangle, color: 'text-yellow-600' },
  { key: 'izin', label: 'Izin/Sakit/Cuti', icon: Clock, color: 'text-blue-600' },
  { key: 'belum', label: 'Belum Absen', icon: XCircle, color: 'text-gray-500' },
]

export default function HrdDashboardPage() {
  const { data: hrdData, isLoading, refetch, isFetching } = useHrdWeek()

  const summary = hrdData?.summary
  const chart = hrdData?.chart || []
  const todayAbsensi = { hadir: summary?.hadirHariIni || 0, terlambat: summary?.terlambatHariIni || 0, izin: summary?.izinHariIni || 0, belum: summary?.belumAbsen || 0 }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard HRD</h1>
          <p className="text-muted-foreground">{new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
        </div>
        <Button variant="outline" size="sm" className="gap-2" onClick={() => refetch()} disabled={isFetching}>
          <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} /> Refresh
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="py-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-muted-foreground">Total Karyawan</span>
              <Users className="h-4 w-4 text-primary" />
            </div>
            <p className="text-2xl font-bold">{isLoading ? '-' : summary?.totalKaryawan || 0}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Semua karyawan aktif</p>
          </CardContent>
        </Card>
        {statusKaryawan.map((s) => {
          const val = todayAbsensi[s.key as keyof typeof todayAbsensi]
          const pct = summary?.totalKaryawan ? Math.round((val / summary.totalKaryawan) * 100) : 0
          const Icon = s.icon
          return (
            <Card key={s.key}>
              <CardContent className="py-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-muted-foreground">{s.label}</span>
                  <Icon className={`h-4 w-4 ${s.color}`} />
                </div>
                <p className="text-2xl font-bold">{val}</p>
                <p className={`text-xs mt-0.5 ${s.color}`}>{pct}%</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Tren Kehadiran 7 Hari</CardTitle>
          </CardHeader>
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

        <div className="space-y-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Ringkasan Kehadiran</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between py-1.5 border-b last:border-0">
                <span className="text-sm text-muted-foreground">Rata-rata kehadiran pekan ini</span>
                <span className="text-sm font-semibold">{summary?.weekAvg || 0}%</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b last:border-0">
                <span className="text-sm text-muted-foreground">Hari dengan kehadiran terbaik</span>
                <span className="text-sm font-semibold">{summary?.bestDay ? `${summary.bestDay.name} (${summary.bestDay.persen}%)` : '-'}</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b last:border-0">
                <span className="text-sm text-muted-foreground">Karyawan</span>
                <span className="text-sm font-semibold">{summary?.totalKaryawan || 0} orang</span>
              </div>
              <div className="flex items-center justify-between py-1.5">
                <span className="text-sm text-muted-foreground">Total absensi bulan ini</span>
                <span className="text-sm font-semibold">{summary?.totalAbsensiBulanIni || 0}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-primary/5 to-transparent border-primary/10">
            <CardContent className="py-4 text-center">
              <p className="text-3xl font-bold text-primary">{summary?.weekAvg || 0}%</p>
              <p className="text-xs text-muted-foreground mt-1">Rata-rata kehadiran</p>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Ringkasan Pengajuan Bulan Ini</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Card className="bg-blue-50/50 dark:bg-blue-950/20 border-blue-200/50 dark:border-blue-800/30">
              <CardContent className="py-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-muted-foreground">Total Karyawan</span>
                  <FileText className="h-4 w-4 text-blue-600" />
                </div>
                <p className="text-2xl font-bold">{summary?.totalKaryawan || 0}</p>
              </CardContent>
            </Card>
            <Card className="bg-yellow-50/50 dark:bg-yellow-950/20 border-yellow-200/50 dark:border-yellow-800/30">
              <CardContent className="py-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-muted-foreground">Hadir Hari Ini</span>
                  <Clock className="h-4 w-4 text-yellow-600" />
                </div>
                <p className="text-2xl font-bold">{summary?.hadirHariIni || 0}</p>
              </CardContent>
            </Card>
            <Card className="bg-green-50/50 dark:bg-green-950/20 border-green-200/50 dark:border-green-800/30">
              <CardContent className="py-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-muted-foreground">Terlambat</span>
                  <FileCheck className="h-4 w-4 text-green-600" />
                </div>
                <p className="text-2xl font-bold">{summary?.terlambatHariIni || 0}</p>
              </CardContent>
            </Card>
            <Card className="bg-red-50/50 dark:bg-red-950/20 border-red-200/50 dark:border-red-800/30">
              <CardContent className="py-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-muted-foreground">Izin/Sakit/Cuti</span>
                  <FileX className="h-4 w-4 text-red-600" />
                </div>
                <p className="text-2xl font-bold">{summary?.izinHariIni || 0}</p>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function CardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('px-6 pt-6 pb-2', className)} {...props} />
}
function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn('text-base font-semibold leading-none tracking-tight', className)} {...props} />
}
