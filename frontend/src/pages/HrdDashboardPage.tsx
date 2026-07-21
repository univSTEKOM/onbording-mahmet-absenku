import { useUsers } from '@/hooks/useUsers'
import { useAbsensiList } from '@/hooks/useAbsensi'
import { useAllPengajuan } from '@/hooks/usePengajuan'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { RefreshCw, Users, CheckCircle2, XCircle, AlertTriangle, Clock, FileText, FileCheck, FileX } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

const statusKaryawan = [
  { key: 'hadir', label: 'Hadir', icon: CheckCircle2, color: 'text-green-600' },
  { key: 'terlambat', label: 'Terlambat', icon: AlertTriangle, color: 'text-yellow-600' },
  { key: 'izin_sakit_cuti', label: 'Izin/Sakit/Cuti', icon: Clock, color: 'text-blue-600' },
  { key: 'belum', label: 'Belum Absen', icon: XCircle, color: 'text-gray-500' },
]

export default function HrdDashboardPage() {
  const { data: users, isLoading: usersLoading } = useUsers()
  const { data: allAbsensi, refetch: refetchAbsensi, isFetching: fetchingAbsensi } = useAbsensiList()
  const { data: allPengajuan } = useAllPengajuan()

  const today = new Date().toISOString().split('T')[0]
  const monthStart = new Date(); monthStart.setDate(1)
  const monthStr = monthStart.toISOString().split('T')[0]

  const todayAbsensi = allAbsensi?.filter((a) => a.tanggal === today) || []
  const monthPengajuan = allPengajuan?.filter((p) => p.createdAt >= monthStr) || []

  const karyawan = users?.filter((u) => u.role === 'karyawan') || []
  const total = karyawan.length

  const hadir = todayAbsensi.filter((a) => a.status === 'hadir').length
  const terlambat = todayAbsensi.filter((a) => a.status === 'terlambat').length
  const izinSakitCuti = todayAbsensi.filter((a) => ['izin', 'sakit', 'cuti'].includes(a.status)).length
  const belum = total - hadir - terlambat - izinSakitCuti

  const pengajuanHariIni = allPengajuan?.filter((p) => p.createdAt.startsWith(today)) || []
  const pendingBulanIni = monthPengajuan.filter((p) => p.status === 'pending')
  const approvedBulanIni = monthPengajuan.filter((p) => p.status === 'approved')
  const rejectedBulanIni = monthPengajuan.filter((p) => p.status === 'rejected')

  const chartData = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map((day, i) => {
    const d = new Date(); d.setDate(d.getDate() - d.getDay() + i)
    const ds = d.toISOString().split('T')[0]
    const dayAbsensi = allAbsensi?.filter((a) => a.tanggal === ds) || []
    return {
      name: day,
      hadir: dayAbsensi.filter((a) => a.status === 'hadir').length,
      terlambat: dayAbsensi.filter((a) => a.status === 'terlambat').length,
      persen: total > 0 ? Math.round((dayAbsensi.filter((a) => a.status === 'hadir' || a.status === 'terlambat').length / total) * 100) : 0,
    }
  })

  const weekAvg = total > 0 ? Math.round(chartData.reduce((a, d) => a + d.persen, 0) / 7) : 0
  const bestDay = [...chartData].sort((a, b) => b.persen - a.persen)[0]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard HRD</h1>
          <p className="text-muted-foreground">
            {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <Button variant="outline" size="sm" className="gap-2" onClick={() => refetchAbsensi()} disabled={fetchingAbsensi}>
          <RefreshCw className={`h-4 w-4 ${fetchingAbsensi ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="py-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-muted-foreground">Total Karyawan</span>
              <Users className="h-4 w-4 text-primary" />
            </div>
            <p className="text-2xl font-bold">{usersLoading ? '-' : total}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Semua karyawan aktif</p>
          </CardContent>
        </Card>
        {statusKaryawan.map((s) => {
          const val = s.key === 'hadir' ? hadir : s.key === 'terlambat' ? terlambat : s.key === 'izin_sakit_cuti' ? izinSakitCuti : belum
          const pct = total > 0 ? Math.round((val / total) * 100) : 0
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
            {allAbsensi ? (
              <div className="h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid var(--border)' }} formatter={(value) => [`${value} orang`]} />
                    <Bar dataKey="hadir" fill="var(--chart-1)" radius={[4, 4, 0, 0]} stackId="a" />
                    <Bar dataKey="terlambat" fill="var(--chart-2)" radius={[4, 4, 0, 0]} stackId="a" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : <Skeleton className="h-[220px] w-full rounded-lg" />}
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
                <span className="text-sm font-semibold">{weekAvg}%</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b last:border-0">
                <span className="text-sm text-muted-foreground">Hari dengan kehadiran terbaik</span>
                <span className="text-sm font-semibold">{bestDay?.name} ({bestDay?.persen}%)</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b last:border-0">
                <span className="text-sm text-muted-foreground">Karyawan</span>
                <span className="text-sm font-semibold">{total} orang</span>
              </div>
              <div className="flex items-center justify-between py-1.5">
                <span className="text-sm text-muted-foreground">Total hari kerja bulan ini</span>
                <span className="text-sm font-semibold">22 hari</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-primary/5 to-transparent border-primary/10">
            <CardContent className="py-4 text-center">
              <p className="text-3xl font-bold text-primary">{weekAvg}%</p>
              <p className="text-xs text-muted-foreground mt-1">Rata-rata kehadiran pekan ini</p>
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
                  <span className="text-xs font-medium text-muted-foreground">Pengajuan Hari Ini</span>
                  <FileText className="h-4 w-4 text-blue-600" />
                </div>
                <p className="text-2xl font-bold">{pengajuanHariIni.length}</p>
              </CardContent>
            </Card>
            <Card className="bg-yellow-50/50 dark:bg-yellow-950/20 border-yellow-200/50 dark:border-yellow-800/30">
              <CardContent className="py-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-muted-foreground">Pending</span>
                  <FileText className="h-4 w-4 text-yellow-600" />
                </div>
                <p className="text-2xl font-bold">{pendingBulanIni.length}</p>
              </CardContent>
            </Card>
            <Card className="bg-green-50/50 dark:bg-green-950/20 border-green-200/50 dark:border-green-800/30">
              <CardContent className="py-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-muted-foreground">Disetujui</span>
                  <FileCheck className="h-4 w-4 text-green-600" />
                </div>
                <p className="text-2xl font-bold">{approvedBulanIni.length}</p>
              </CardContent>
            </Card>
            <Card className="bg-red-50/50 dark:bg-red-950/20 border-red-200/50 dark:border-red-800/30">
              <CardContent className="py-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-muted-foreground">Ditolak</span>
                  <FileX className="h-4 w-4 text-red-600" />
                </div>
                <p className="text-2xl font-bold">{rejectedBulanIni.length}</p>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
