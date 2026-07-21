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
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Users, Clock, FileText, CheckCircle2, Search } from 'lucide-react'
import type { Pengajuan, PengajuanStatus } from '@/types'

export default function HrdDashboardPage() {
  const { data: users } = useUsers()
  const { data: allAbsensi } = useAbsensiList()
  const { data: allPengajuan } = useAllPengajuan()
  const updateStatus = useUpdatePengajuanStatus()
  const [search, setSearch] = useState('')
  const [selectedPengajuan, setSelectedPengajuan] =
    useState<Pengajuan | null>(null)
  const [catatan, setCatatan] = useState('')

  const today = new Date().toISOString().split('T')[0]
  const todayAbsensi = allAbsensi?.filter((a) => a.tanggal === today) || []
  const pendingPengajuan =
    allPengajuan?.filter((p) => p.status === 'pending') || []

  const filteredUsers = users?.filter(
    (u) =>
      u.role === 'karyawan' &&
      (u.nama.toLowerCase().includes(search.toLowerCase()) ||
        u.jabatan.toLowerCase().includes(search.toLowerCase()))
  )

  function handleApproveReject(
    id: number,
    status: PengajuanStatus
  ) {
    updateStatus.mutate({ id, status, catatan })
    setSelectedPengajuan(null)
    setCatatan('')
  }

  const stats = [
    {
      label: 'Total Karyawan',
      value: users?.filter((u) => u.role === 'karyawan').length || 0,
      icon: Users,
    },
    {
      label: 'Hadir Hari Ini',
      value: todayAbsensi.filter((a) => a.status === 'hadir').length,
      icon: Clock,
    },
    {
      label: 'Pending Pengajuan',
      value: pendingPengajuan.length,
      icon: FileText,
    },
    {
      label: 'Terlambat Hari Ini',
      value: todayAbsensi.filter((a) => a.status === 'terlambat').length,
      icon: CheckCircle2,
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard HRD</h1>
        <p className="text-muted-foreground">Overview seluruh karyawan</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {stats.map((s) => {
          const Icon = s.icon
          return (
            <Card key={s.label}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  {s.label}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{s.value}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Data Karyawan</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari karyawan..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
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
                  const userToday = todayAbsensi.find(
                    (a) => a.userId === u.id
                  )
                  const monthStart = new Date()
                  monthStart.setDate(1)
                  const userMonth = allAbsensi?.filter(
                    (a) =>
                      a.userId === u.id &&
                      a.tanggal >=
                        monthStart.toISOString().split('T')[0]
                  )
                  return (
                    <TableRow key={u.id}>
                      <TableCell className="font-medium">
                        {u.nama}
                      </TableCell>
                      <TableCell>{u.jabatan}</TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={
                            userToday?.status === 'hadir'
                              ? 'bg-green-100 text-green-800'
                              : userToday?.status === 'terlambat'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-gray-100 text-gray-800'
                          }
                        >
                          {userToday
                            ? userToday.status === 'terlambat'
                              ? 'Terlambat'
                              : userToday.status
                            : 'Belum absen'}
                        </Badge>
                      </TableCell>
                      <TableCell>{userMonth?.length || 0} hari</TableCell>
                    </TableRow>
                  )
                })
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-center text-muted-foreground"
                  >
                    Tidak ada data karyawan
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
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
                const pengaju = users?.find(
                  (u) => u.id === p.userId
                )
                return (
                  <div
                    key={p.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div>
                      <p className="font-medium">
                        {p.jenis} - {pengaju?.nama || 'Unknown'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {p.tanggalMulai} s/d {p.tanggalSelesai}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {p.alasan}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-green-600 border-green-600"
                        onClick={() => {
                          setSelectedPengajuan(p)
                          setCatatan('')
                        }}
                      >
                        Setujui
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 border-red-600"
                        onClick={() => {
                          setSelectedPengajuan(p)
                          setCatatan('')
                        }}
                      >
                        Tolak
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">
              Tidak ada pengajuan yang menunggu
            </p>
          )}
        </CardContent>
      </Card>

      <Dialog
        open={!!selectedPengajuan}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedPengajuan(null)
            setCatatan('')
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Konfirmasi Pengajuan</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm">
              Pengajuan {selectedPengajuan?.jenis} oleh{' '}
              {users?.find((u) => u.id === selectedPengajuan?.userId)
                ?.nama || 'Unknown'}
            </p>
            <p className="text-sm text-muted-foreground">
              {selectedPengajuan?.alasan}
            </p>
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
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setSelectedPengajuan(null)
                setCatatan('')
              }}
            >
              Batal
            </Button>
            <Button
              variant="outline"
              className="text-green-600 border-green-600"
              onClick={() =>
                handleApproveReject(selectedPengajuan!.id, 'approved')
              }
              disabled={updateStatus.isPending}
            >
              Setujui
            </Button>
            <Button
              variant="outline"
              className="text-red-600 border-red-600"
              onClick={() =>
                handleApproveReject(selectedPengajuan!.id, 'rejected')
              }
              disabled={updateStatus.isPending}
            >
              Tolak
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
