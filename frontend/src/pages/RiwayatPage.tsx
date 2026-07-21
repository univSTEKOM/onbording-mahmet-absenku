import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useAbsensiList } from '@/hooks/useAbsensi'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Search } from 'lucide-react'
import type { AbsensiStatus } from '@/types'

const statusColor: Record<AbsensiStatus, string> = {
  hadir: 'bg-green-100 text-green-800',
  terlambat: 'bg-yellow-100 text-yellow-800',
  izin: 'bg-blue-100 text-blue-800',
  sakit: 'bg-purple-100 text-purple-800',
  cuti: 'bg-orange-100 text-orange-800',
}

export default function RiwayatPage() {
  const { user } = useAuth()
  const [filterStatus, setFilterStatus] = useState('')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  const { data: absensi, isLoading } = useAbsensiList({
    userId: user?.id,
    _sort: 'tanggal',
    _order: sortOrder,
    ...(filterStatus ? { status: filterStatus } : {}),
  })

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Riwayat Kehadiran</h1>
        <p className="text-muted-foreground">
          Daftar riwayat absensi Anda
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Cari tanggal..." className="pl-9" />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Semua Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value=" ">Semua Status</SelectItem>
            <SelectItem value="hadir">Hadir</SelectItem>
            <SelectItem value="terlambat">Terlambat</SelectItem>
            <SelectItem value="izin">Izin</SelectItem>
            <SelectItem value="sakit">Sakit</SelectItem>
            <SelectItem value="cuti">Cuti</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={sortOrder}
          onValueChange={(v) => setSortOrder(v as 'asc' | 'desc')}
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Urutkan" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="desc">Terbaru</SelectItem>
            <SelectItem value="asc">Terlama</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Tanggal</TableHead>
            <TableHead>Masuk</TableHead>
            <TableHead>Pulang</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center">
                Memuat...
              </TableCell>
            </TableRow>
          ) : absensi?.length ? (
            absensi.map((a) => (
              <TableRow key={a.id}>
                <TableCell>{new Date(a.tanggal).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' })}</TableCell>
                <TableCell>{a.checkIn ? new Date(a.checkIn).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '-'}</TableCell>
                <TableCell>{a.checkOut ? new Date(a.checkOut).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '-'}</TableCell>
                <TableCell><Badge variant="secondary" className={statusColor[a.status]}>{a.status}</Badge></TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={4} className="text-center text-muted-foreground">Belum ada riwayat absensi</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
