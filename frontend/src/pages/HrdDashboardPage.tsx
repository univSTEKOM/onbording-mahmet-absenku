import { useState } from 'react'
import { useUsers } from '@/hooks/useUsers'
import { useAbsensiList } from '@/hooks/useAbsensi'
import { useAllPengajuan, useUpdatePengajuanStatus } from '@/hooks/usePengajuan'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/shared/EmptyState'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { RefreshCw, Users, CheckCircle2, XCircle, AlertTriangle, Clock } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import type { Pengajuan, PengajuanStatus } from '@/types'

const statusKaryawan = [
  { key: 'hadir', label: 'Hadir', icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-950/30' },
  { key: 'terlambat', label: 'Terlambat', icon: AlertTriangle, color: 'text-yellow-600', bg: 'bg-yellow-50 dark:bg-yellow-950/30' },
  { key: 'izin_sakit_cuti', label: 'Izin/Sakit/Cuti', icon: Clock, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-950/30' },
  { key: 'belum', label: 'Belum Absen', icon: XCircle, color: 'text-gray-500', bg: 'bg-gray-50 dark:bg-gray-900/50' },
]

export default function HrdDashboardPage() {
  const { data: users, isLoading: usersLoading } = useUsers()
  const { data: allAbsensi, refetch: refetchAbsensi, isFetching: fetchingAbsensi } = useAbsensiList()
  const { data: allPengajuan, refetch: refetchPengajuan, isFetching: fetchingPengajuan } = useAllPengajuan()
  const updateStatus = useUpdatePengajuanStatus()
  const [selectedPengajuan, setSelectedPengajuan] = useState<Pengajuan | null>(null)
  const [catatan, setCatatan] = useState('')
  const [actionType, setActionType] = useState<PengajuanStatus | null>(null)

  const today = new Date().toISOString().split('T')[0]
  const todayAbsensi = allAbsensi?.filter((a) => a.tanggal === today) || []
  const pendingPengajuan = allPengajuan?.filter((p) => p.status === 'pending') || []

  const karyawan = users?.filter((u) => u.role === 'karyawan') || []
  const total = karyawan.length

  const hadir = todayAbsensi.filter((a) => a.status === 'hadir').length
  const terlambat = todayAbsensi.filter((a) => a.status === 'terlambat').length
  const izinSakitCuti = todayAbsensi.filter((a) => ['izin', 'sakit', 'cuti'].includes(a.status)).length
  const belum = total - hadir - terlambat - izinSakitCuti

  const chartData = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map((day, i) => {
    const d = new Date(); d.setDate(d.getDate() - d.getDay() + i)
    const ds = d.toISOString().split('T')[0]
    const dayAbsensi = allAbsensi?.filter((a) => a.tanggal === ds) || []
    const dayTotal = karyawan.length
    return {
      name: day,
      hadir: dayAbsensi.filter((a) => a.status === 'hadir').length,
      terlambat: dayAbsensi.filter((a) => a.status === 'terlambat').length,
      persen: dayTotal > 0 ? Math.round((dayAbsensi.filter((a) => a.status === 'hadir' || a.status === 'terlambat').length / dayTotal) * 100) : 0,
    }
  })

  function handleConfirm() {
    if (!selectedPengajuan || !actionType) return
    updateStatus.mutate(
      { id: selectedPengajuan.id, status: actionType, catatan },
      { onSettled: () => { setSelectedPengajuan(null); setCatatan(''); setActionType(null) } }
    )
  }

  function openConfirm(p: Pengajuan, status: PengajuanStatus) {
    setSelectedPengajuan(p); setActionType(status); setCatatan('')
  }

  const weekAvg = total > 0 ? Math.round(chartData.reduce((a, d) => a + d.persen, 0) / 7) : 0
  const bestDay = [...chartData].sort((a, b) => b.persen - a.persen)[0]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard HRD</h1>
          <p className="text-muted-foreground">Ringkasan kehadiran {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
        </div>
        <Button variant="outline" size="sm" className="gap-2" onClick={() => { refetchAbsensi(); refetchPengajuan() }} disabled={fetchingAbsensi || fetchingPengajuan}>
          <RefreshCw className={`h-4 w-4 ${fetchingAbsensi || fetchingPengajuan ? 'animate-spin' : ''}`} />
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
                    <Tooltip
                      contentStyle={{ borderRadius: 8, border: '1px solid var(--border)' }}
                      formatter={(value) => [`${value} orang`]}
                    />
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
              <CardTitle className="text-base">Ringkasan Bulan Ini</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between py-1.5 border-b last:border-0">
                <span className="text-sm text-muted-foreground">Rata-rata kehadiran</span>
                <span className="text-sm font-semibold">{weekAvg}%</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b last:border-0">
                <span className="text-sm text-muted-foreground">Hari terbaik</span>
                <span className="text-sm font-semibold">{bestDay?.name} ({bestDay?.persen}%)</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b last:border-0">
                <span className="text-sm text-muted-foreground">Total hari kerja</span>
                <span className="text-sm font-semibold">22 hari</span>
              </div>
              <div className="flex items-center justify-between py-1.5">
                <span className="text-sm text-muted-foreground">Karyawan tetap</span>
                <span className="text-sm font-semibold">{total} orang</span>
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
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-base">Pengajuan Pending</CardTitle>
          <div className="flex items-center gap-2">
            {pendingPengajuan.length > 0 && (
              <Badge variant="secondary" className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border-0">
                {pendingPengajuan.length} menunggu
              </Badge>
            )}
            <Button variant="ghost" size="icon" onClick={() => refetchPengajuan()} disabled={fetchingPengajuan}>
              <RefreshCw className={`h-4 w-4 ${fetchingPengajuan ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {pendingPengajuan.length ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {pendingPengajuan.map((p) => {
                const pengaju = users?.find((u) => u.id === p.userId)
                return (
                  <div key={p.id} className="flex items-start justify-between p-4 rounded-xl border bg-card hover:bg-muted/50 transition-colors">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className={
                          p.jenis === 'cuti' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border-0'
                          : p.jenis === 'izin' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-0'
                          : 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 border-0'
                        }>{p.jenis}</Badge>
                        <span className="text-sm font-medium">{pengaju?.nama || 'Unknown'}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {new Date(p.tanggalMulai).toLocaleDateString('id-ID')} — {new Date(p.tanggalSelesai).toLocaleDateString('id-ID')}
                      </p>
                      <p className="text-xs text-muted-foreground line-clamp-1">{p.alasan}</p>
                    </div>
                    <div className="flex gap-2 shrink-0 ml-3">
                      <Button size="sm" variant="outline" className="text-green-600 border-green-300 hover:bg-green-50 dark:border-green-800 dark:hover:bg-green-950/30 h-8 px-3 text-xs" onClick={() => openConfirm(p, 'approved')}>Setujui</Button>
                      <Button size="sm" variant="outline" className="text-red-600 border-red-300 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-950/30 h-8 px-3 text-xs" onClick={() => openConfirm(p, 'rejected')}>Tolak</Button>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <EmptyState message="Tidak ada pengajuan yang menunggu" />
          )}
        </CardContent>
      </Card>

      <ConfirmDialog
        open={!!selectedPengajuan}
        onOpenChange={(o) => { if (!o) { setSelectedPengajuan(null); setActionType(null); setCatatan('') } }}
        title={actionType === 'approved' ? 'Setujui Pengajuan' : 'Tolak Pengajuan'}
        actions={[{
          label: actionType === 'approved' ? 'Setujui' : 'Tolak',
          onClick: handleConfirm,
          className: actionType === 'approved' ? 'text-green-600 border-green-600' : 'text-red-600 border-red-600',
          variant: 'outline' as const,
          disabled: updateStatus.isPending,
        }]}
      >
        <div className="space-y-3">
          <p className="text-sm">{selectedPengajuan?.jenis} — {users?.find((u) => u.id === selectedPengajuan?.userId)?.nama || 'Unknown'}</p>
          <p className="text-sm text-muted-foreground">{selectedPengajuan?.alasan}</p>
          <div className="space-y-2">
            <label className="text-sm font-medium">Catatan</label>
            <textarea className="flex min-h-[60px] w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm"
              value={catatan} onChange={(e) => setCatatan(e.target.value)} placeholder="Catatan (opsional)" />
          </div>
        </div>
      </ConfirmDialog>
    </div>
  )
}
