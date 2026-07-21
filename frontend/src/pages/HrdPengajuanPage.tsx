import { useState, useId } from 'react'
import { useUsers } from '@/hooks/useUsers'
import { useAllPengajuan, useUpdatePengajuanStatus } from '@/hooks/usePengajuan'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { EmptyState } from '@/components/shared/EmptyState'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { pengajuanJenisLabel, pengajuanStatusBadge, pengajuanStatusLabel } from '@/lib/constants'
import { Search, RefreshCw, CheckCircle2, XCircle } from 'lucide-react'
import type { Pengajuan, PengajuanStatus } from '@/types'

export default function HrdPengajuanPage() {
  const { data: users } = useUsers()
  const { data: allPengajuan, isLoading, refetch, isFetching } = useAllPengajuan()
  const updateStatus = useUpdatePengajuanStatus()
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const skId = useId()
  const [selectedPengajuan, setSelectedPengajuan] = useState<Pengajuan | null>(null)
  const [catatan, setCatatan] = useState('')
  const [actionType, setActionType] = useState<PengajuanStatus | null>(null)

  const filtered = allPengajuan?.filter((p) => {
    const pengaju = users?.find((u) => u.id === p.userId)
    const matchNama = (pengaju?.nama || '').toLowerCase().includes(search.toLowerCase())
    const matchAlasan = p.alasan.toLowerCase().includes(search.toLowerCase())
    const matchStatus = !filterStatus || p.status === filterStatus
    return (matchNama || matchAlasan) && matchStatus
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Pengajuan</h1>
          <p className="text-muted-foreground">Kelola pengajuan izin & cuti karyawan</p>
        </div>
        <Button variant="outline" size="sm" className="gap-2" onClick={() => refetch()} disabled={isFetching}>
          <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} /> Refresh
        </Button>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Cari karyawan atau alasan..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v === ' ' ? '' : v || '')}>
          <SelectTrigger className="w-[130px]"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value=" ">Semua</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Disetujui</SelectItem>
            <SelectItem value="rejected">Ditolak</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }, (_, i) => ({ id: `${skId}-s${i}` })).map((item) => <Skeleton key={item.id} className="h-12 w-full rounded-lg" />)}
        </div>
      ) : filtered?.length ? (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Karyawan</TableHead>
                <TableHead>Jenis</TableHead>
                <TableHead>Tanggal</TableHead>
                <TableHead>Alasan</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((p) => {
                const pengaju = users?.find((u) => u.id === p.userId)
                return (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{pengaju?.nama || '-'}</TableCell>
                    <TableCell>{pengajuanJenisLabel[p.jenis]}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {new Date(p.tanggalMulai).toLocaleDateString('id-ID')} — {new Date(p.tanggalSelesai).toLocaleDateString('id-ID')}
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">{p.alasan}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={pengajuanStatusBadge[p.status]}>{pengajuanStatusLabel[p.status]}</Badge>
                    </TableCell>
                    <TableCell>
                      {p.status === 'pending' ? (
                        <div className="flex gap-1">
                          <Button size="sm" variant="ghost" className="text-green-600 h-8 w-8 p-0" onClick={() => openConfirm(p, 'approved')}>
                            <CheckCircle2 className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost" className="text-red-600 h-8 w-8 p-0" onClick={() => openConfirm(p, 'rejected')}>
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">{p.catatan || '-'}</span>
                      )}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      ) : (
        <EmptyState message={search ? 'Tidak ditemukan' : 'Belum ada pengajuan'} />
      )}

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
