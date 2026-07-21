import { useState } from 'react'
import { useUsers } from '@/hooks/useUsers'
import { useAbsensiList } from '@/hooks/useAbsensi'
import { useAllPengajuan, useUpdatePengajuanStatus } from '@/hooks/usePengajuan'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { StatsCard } from '@/components/shared/StatsCard'
import { EmptyState } from '@/components/shared/EmptyState'
import { LoadingState } from '@/components/shared/LoadingState'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { exportToCsv } from '@/lib/export'
import { Users, Clock, FileText, CheckCircle2, Search, Download } from 'lucide-react'
import type { Pengajuan, PengajuanStatus } from '@/types'

export default function HrdDashboardPage() {
  const { data: users, isLoading: usersLoading } = useUsers()
  const { data: allAbsensi } = useAbsensiList()
  const { data: allPengajuan } = useAllPengajuan()
  const updateStatus = useUpdatePengajuanStatus()
  const [search, setSearch] = useState('')
  const [selectedPengajuan, setSelectedPengajuan] = useState<Pengajuan | null>(null)
  const [catatan, setCatatan] = useState('')
  const [actionType, setActionType] = useState<PengajuanStatus | null>(null)

  const today = new Date().toISOString().split('T')[0]
  const todayAbsensi = allAbsensi?.filter((a) => a.tanggal === today) || []
  const pendingPengajuan = allPengajuan?.filter((p) => p.status === 'pending') || []

  const filteredUsers = users?.filter(
    (u) =>
      u.role === 'karyawan' &&
      ((u.nama || '').toLowerCase().includes(search.toLowerCase()) ||
        (u.jabatan || '').toLowerCase().includes(search.toLowerCase()))
  )

  function handleConfirm() {
    if (!selectedPengajuan || !actionType) return
    updateStatus.mutate(
      { id: selectedPengajuan.id, status: actionType, catatan },
      { onSettled: () => { setSelectedPengajuan(null); setCatatan(''); setActionType(null) } }
    )
  }

  function openConfirm(p: Pengajuan, status: PengajuanStatus) {
    setSelectedPengajuan(p)
    setActionType(status)
    setCatatan('')
  }

  function handleExportKaryawan() {
    if (!filteredUsers?.length) return
    const monthStart = new Date()
    monthStart.setDate(1)
    exportToCsv(
      `data-karyawan-${new Date().toISOString().split('T')[0]}`,
      ['Nama', 'Jabatan', 'Status Hari Ini', 'Hadir Bulan Ini'],
      filteredUsers.map((u) => {
        const userToday = todayAbsensi.find((a) => a.userId === u.id)
        const userMonth = allAbsensi?.filter((a) => a.userId === u.id && a.tanggal >= monthStart.toISOString().split('T')[0])
        return [
          u.nama || '-',
          u.jabatan || '-',
          userToday ? (userToday.status === 'terlambat' ? 'Terlambat' : userToday.status) : 'Belum absen',
          `${userMonth?.length || 0} hari`,
        ]
      })
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard HRD</h1>
        <p className="text-muted-foreground">Overview seluruh karyawan</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatsCard label="Total Karyawan" value={users?.filter((u) => u.role === 'karyawan').length || 0} icon={Users} />
        <StatsCard label="Hadir Hari Ini" value={todayAbsensi.filter((a) => a.status === 'hadir').length} icon={Clock} />
        <StatsCard label="Pending Pengajuan" value={pendingPengajuan.length} icon={FileText} />
        <StatsCard label="Terlambat Hari Ini" value={todayAbsensi.filter((a) => a.status === 'terlambat').length} icon={CheckCircle2} />
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Data Karyawan</CardTitle>
          <Button variant="outline" size="sm" className="gap-2" onClick={handleExportKaryawan}>
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Cari karyawan..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          {usersLoading ? (
            <LoadingState />
          ) : (
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
                {filteredUsers?.length ? (
                  filteredUsers.map((u) => {
                    const userToday = todayAbsensi.find((a) => a.userId === u.id)
                    const monthStart = new Date()
                    monthStart.setDate(1)
                    const userMonth = allAbsensi?.filter((a) => a.userId === u.id && a.tanggal >= monthStart.toISOString().split('T')[0])
                    return (
                      <TableRow key={u.id}>
                        <TableCell className="font-medium">{u.nama || '-'}</TableCell>
                        <TableCell>{u.jabatan || '-'}</TableCell>
                        <TableCell>
                          <Badge variant="secondary" className={
                            userToday?.status === 'hadir' ? 'bg-green-100 text-green-800'
                            : userToday?.status === 'terlambat' ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                          }>
                            {userToday ? (userToday.status === 'terlambat' ? 'Terlambat' : userToday.status) : 'Belum absen'}
                          </Badge>
                        </TableCell>
                        <TableCell>{userMonth?.length || 0} hari</TableCell>
                      </TableRow>
                    )
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground">
                      {search ? 'Karyawan tidak ditemukan' : 'Tidak ada data karyawan'}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Pengajuan Pending</CardTitle>
        </CardHeader>
        <CardContent>
          {pendingPengajuan.length ? (
            <div className="space-y-3">
              {pendingPengajuan.map((p) => {
                const pengaju = users?.find((u) => u.id === p.userId)
                return (
                  <div key={p.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{p.jenis} - {pengaju?.nama || 'Unknown'}</p>
                      <p className="text-sm text-muted-foreground">{p.tanggalMulai} s/d {p.tanggalSelesai}</p>
                      <p className="text-sm text-muted-foreground">{p.alasan}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="text-green-600 border-green-600" onClick={() => openConfirm(p, 'approved')}>
                        Setujui
                      </Button>
                      <Button size="sm" variant="outline" className="text-red-600 border-red-600" onClick={() => openConfirm(p, 'rejected')}>
                        Tolak
                      </Button>
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
        actions={[
          {
            label: actionType === 'approved' ? 'Setujui' : 'Tolak',
            onClick: handleConfirm,
            className: actionType === 'approved' ? 'text-green-600 border-green-600' : 'text-red-600 border-red-600',
            variant: 'outline' as const,
            disabled: updateStatus.isPending,
          },
        ]}
      >
        <div className="space-y-4">
          <p className="text-sm">
            {actionType === 'approved' ? 'Setujui' : 'Tolak'} pengajuan {selectedPengajuan?.jenis} oleh{' '}
            {users?.find((u) => u.id === selectedPengajuan?.userId)?.nama || 'Unknown'}
          </p>
          <p className="text-sm text-muted-foreground">{selectedPengajuan?.alasan}</p>
          <div className="space-y-2">
            <label className="text-sm font-medium">Catatan</label>
            <textarea
              className="flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              placeholder="Catatan (opsional)"
            />
          </div>
        </div>
      </ConfirmDialog>
    </div>
  )
}
