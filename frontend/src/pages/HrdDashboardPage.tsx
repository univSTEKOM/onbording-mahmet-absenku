import { useState, useId } from 'react'
import { useUsers } from '@/hooks/useUsers'
import { useAbsensiList } from '@/hooks/useAbsensi'
import { useAllPengajuan, useUpdatePengajuanStatus } from '@/hooks/usePengajuan'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { StatsCard } from '@/components/shared/StatsCard'
import { EmptyState } from '@/components/shared/EmptyState'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { exportToCsv } from '@/lib/export'
import { Users, Clock, FileText, CheckCircle2, Search, Download, RefreshCw } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import type { Pengajuan, PengajuanStatus } from '@/types'

export default function HrdDashboardPage() {
  const { data: users, isLoading: usersLoading } = useUsers()
  const { data: allAbsensi, refetch: refetchAbsensi, isFetching: fetchingAbsensi } = useAbsensiList()
  const { data: allPengajuan, refetch: refetchPengajuan, isFetching: fetchingPengajuan } = useAllPengajuan()
  const updateStatus = useUpdatePengajuanStatus()
  const [search, setSearch] = useState('')
  const skId = useId()
  const [selectedPengajuan, setSelectedPengajuan] = useState<Pengajuan | null>(null)
  const [catatan, setCatatan] = useState('')
  const [actionType, setActionType] = useState<PengajuanStatus | null>(null)

  const today = new Date().toISOString().split('T')[0]
  const todayAbsensi = allAbsensi?.filter((a) => a.tanggal === today) || []
  const pendingPengajuan = allPengajuan?.filter((p) => p.status === 'pending') || []
  const monthStart = new Date(); monthStart.setDate(1)
  const monthStr = monthStart.toISOString().split('T')[0]

  const karyawan = users?.filter((u) => u.role === 'karyawan') || []
  const filteredUsers = karyawan.filter(
    (u) => ((u.nama || '') + (u.jabatan || '')).toLowerCase().includes(search.toLowerCase())
  )

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

  function handleExport() {
    exportToCsv(`data-karyawan-${new Date().toISOString().split('T')[0]}`,
      ['Nama', 'Jabatan', 'Status Hari Ini', 'Hadir Bulan Ini'],
      filteredUsers.map((u) => {
        const t = todayAbsensi.find((a) => a.userId === u.id)
        const m = allAbsensi?.filter((a) => a.userId === u.id && a.tanggal >= monthStr)
        return [u.nama || '-', u.jabatan || '-',
          t ? (t.status === 'terlambat' ? 'Terlambat' : t.status) : 'Belum absen',
          `${m?.length || 0} hari`]
      })
    )
  }

  const chartData = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map((day, i) => {
    const d = new Date(); d.setDate(d.getDate() - d.getDay() + i)
    const ds = d.toISOString().split('T')[0]
    const dayAbsensi = allAbsensi?.filter((a) => a.tanggal === ds) || []
    return { name: day, hadir: dayAbsensi.filter((a) => a.status === 'hadir').length, terlambat: dayAbsensi.filter((a) => a.status === 'terlambat').length }
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard HRD</h1>
          <p className="text-muted-foreground">Overview kehadiran karyawan</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatsCard label="Total Karyawan" value={karyawan.length} icon={Users} />
        <StatsCard label="Hadir Hari Ini" value={todayAbsensi.filter((a) => a.status === 'hadir').length} icon={Clock} />
        <StatsCard label="Terlambat" value={todayAbsensi.filter((a) => a.status === 'terlambat').length} icon={CheckCircle2} />
        <StatsCard label="Pending" value={pendingPengajuan.length} icon={FileText} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Tren Kehadiran 7 Hari</CardTitle>
        </CardHeader>
        <CardContent>
          {allAbsensi ? (
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip />
                  <Bar dataKey="hadir" fill="hsl(142, 71%, 45%)" radius={[4, 4, 0, 0]} stackId="a" />
                  <Bar dataKey="terlambat" fill="hsl(48, 96%, 53%)" radius={[4, 4, 0, 0]} stackId="a" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : <Skeleton className="h-[200px] w-full" />}
        </CardContent>
      </Card>

      <Tabs defaultValue="karyawan">
        <TabsList>
          <TabsTrigger value="karyawan">Karyawan</TabsTrigger>
          <TabsTrigger value="pengajuan">Pengajuan {pendingPengajuan.length > 0 && `(${pendingPengajuan.length})`}</TabsTrigger>
        </TabsList>

        <TabsContent value="karyawan" className="space-y-4 mt-4">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Cari karyawan..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <Button variant="outline" size="sm" className="gap-2" onClick={handleExport}><Download className="h-4 w-4" /> CSV</Button>
            <Button variant="outline" size="icon" onClick={() => refetchAbsensi()} disabled={fetchingAbsensi}>
              <RefreshCw className={`h-4 w-4 ${fetchingAbsensi ? 'animate-spin' : ''}`} />
            </Button>
          </div>

          {usersLoading ? (
            <div className="space-y-3">{Array.from({ length: 4 }, (_, i) => ({ id: `${skId}-s${i}` })).map((item) => <Skeleton key={item.id} className="h-10 w-full rounded-lg" />)}</div>
          ) : filteredUsers.length ? (
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nama</TableHead>
                    <TableHead>Jabatan</TableHead>
                    <TableHead>Hari Ini</TableHead>
                    <TableHead>Hadir Bulan Ini</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((u) => {
                    const t = todayAbsensi.find((a) => a.userId === u.id)
                    const m = allAbsensi?.filter((a) => a.userId === u.id && a.tanggal >= monthStr)
                    return (
                      <TableRow key={u.id}>
                        <TableCell className="font-medium">{u.nama || '-'}</TableCell>
                        <TableCell className="text-muted-foreground">{u.jabatan || '-'}</TableCell>
                        <TableCell>
                          <Badge variant="secondary" className={`border-0 ${
                            t?.status === 'hadir' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                            : t?.status === 'terlambat' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                            : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
                          }`}>{t ? (t.status === 'terlambat' ? 'Terlambat' : t.status) : 'Belum absen'}</Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{m?.length || 0} hari</TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          ) : <EmptyState message={search ? 'Karyawan tidak ditemukan' : 'Tidak ada data'} />}
        </TabsContent>

        <TabsContent value="pengajuan" className="space-y-4 mt-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">{pendingPengajuan.length} pengajuan menunggu</p>
            <Button variant="outline" size="icon" onClick={() => refetchPengajuan()} disabled={fetchingPengajuan}>
              <RefreshCw className={`h-4 w-4 ${fetchingPengajuan ? 'animate-spin' : ''}`} />
            </Button>
          </div>

          {pendingPengajuan.length ? (
            <div className="space-y-3">
              {pendingPengajuan.map((p) => {
                const pengaju = users?.find((u) => u.id === p.userId)
                return (
                  <div key={p.id} className="flex items-center justify-between p-4 rounded-lg border">
                    <div className="space-y-1">
                      <p className="font-medium text-sm">{p.jenis} — {pengaju?.nama || 'Unknown'}</p>
                      <p className="text-xs text-muted-foreground">{p.tanggalMulai} s/d {p.tanggalSelesai}</p>
                      <p className="text-xs text-muted-foreground">{p.alasan}</p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <Button size="sm" variant="outline" className="text-green-600 border-green-600 hover:bg-green-50" onClick={() => openConfirm(p, 'approved')}>Setujui</Button>
                      <Button size="sm" variant="outline" className="text-red-600 border-red-600 hover:bg-red-50" onClick={() => openConfirm(p, 'rejected')}>Tolak</Button>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : <EmptyState message="Tidak ada pengajuan pending" />}
        </TabsContent>
      </Tabs>

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
