import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { LoadingState } from '@/components/shared/LoadingState'
import { EmptyState } from '@/components/shared/EmptyState'
import { toast } from 'sonner'
import api from '@/api/axios'
import type { User } from '@/types'
import { CheckCircle2, XCircle, RefreshCw, Trash2, ChevronRight, Ban } from 'lucide-react'

export default function HrdVerifikasiPage() {
  const queryClient = useQueryClient()
  const [rejectTarget, setRejectTarget] = useState<User | null>(null)
  const [rejectNote, setRejectNote] = useState('')
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null)
  const [detailTarget, setDetailTarget] = useState<User | null>(null)
  const [noteTarget, setNoteTarget] = useState<User | null>(null)
  const [additionalNote, setAdditionalNote] = useState('')

  const { data: pendingUsers, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['users', 'pending'],
    queryFn: () => api.get('/api/users/pending').then((r) => r.data as User[]),
  })

  const approveMutation = useMutation({
    mutationFn: (id: string) => api.patch(`/api/users/${id}/status`, { status: 'approved' }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['users'] }); toast.success('User berhasil disetujui') },
  })

  const rejectMutation = useMutation({
    mutationFn: ({ id, note }: { id: string; note: string }) => api.patch(`/api/users/${id}/status`, { status: 'rejected', note }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['users'] }); setRejectTarget(null); setRejectNote(''); toast.success('User ditolak') },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/api/users/${id}`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['users'] }); setDeleteTarget(null); toast.success('User berhasil dihapus') },
  })

  const noteMutation = useMutation({
    mutationFn: ({ id, note }: { id: string; note: string }) => api.post(`/api/users/${id}/notes`, { note }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['users'] }); setNoteTarget(null); setAdditionalNote(''); toast.success('Catatan ditambahkan') },
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Verifikasi Karyawan</h1>
          <p className="text-muted-foreground">Tinjau dan setujui pendaftaran karyawan baru</p>
        </div>
        <Button variant="outline" size="icon" onClick={() => refetch()} disabled={isFetching}>
          <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      {isLoading ? (
        <LoadingState />
      ) : !pendingUsers?.length ? (
        <EmptyState message="Tidak ada pengguna yang menunggu verifikasi" />
      ) : (
        <div className="grid gap-4">
          {pendingUsers.map((u) => (
            <Card key={u.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-lg">
                      {u.nama?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                    <div>
                      <p className="font-semibold">{u.nama}</p>
                      <p className="text-sm text-muted-foreground">{u.email}</p>
                      <p className="text-xs text-muted-foreground">{u.jabatan} &middot; Mendaftar {new Date(u.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-0 shrink-0">Pending</Badge>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button size="sm" className="gap-1.5" onClick={() => approveMutation.mutate(u.id)} disabled={approveMutation.isPending}>
                    <CheckCircle2 className="h-4 w-4" /> Setujui
                  </Button>
                  <Button size="sm" variant="outline" className="gap-1.5 text-destructive hover:text-destructive" onClick={() => setRejectTarget(u)}>
                    <XCircle className="h-4 w-4" /> Tolak
                  </Button>
                  <Button size="sm" variant="ghost" className="gap-1.5" onClick={() => setDetailTarget(u)}>
                    <ChevronRight className="h-4 w-4" /> Detail
                  </Button>
                  <Button size="sm" variant="ghost" className="gap-1.5 text-destructive ml-auto" onClick={() => setDeleteTarget(u)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!rejectTarget} onOpenChange={(o) => { if (!o) setRejectTarget(null) }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tolak {rejectTarget?.nama}</DialogTitle>
            <DialogDescription>Berikan alasan penolakan agar user dapat memperbaiki pendaftarannya.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Label>Catatan Penolakan</Label>
            <Textarea
              value={rejectNote}
              onChange={(e) => setRejectNote(e.target.value)}
              placeholder="Jelaskan alasan penolakan..."
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectTarget(null)}>Batal</Button>
            <Button variant="destructive" onClick={() => rejectTarget && rejectMutation.mutate({ id: rejectTarget.id, note: rejectNote })} disabled={!rejectNote.trim() || rejectMutation.isPending}>
              Tolak User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!detailTarget} onOpenChange={(o) => { if (!o) setDetailTarget(null) }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Detail {detailTarget?.nama}</DialogTitle>
          </DialogHeader>
          {detailTarget && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-muted-foreground">Nama</span><span className="font-medium">{detailTarget.nama}</span>
                <span className="text-muted-foreground">Email</span><span>{detailTarget.email}</span>
                <span className="text-muted-foreground">Jabatan</span><span>{detailTarget.jabatan || '-'}</span>
                <span className="text-muted-foreground">Telepon</span><span>{detailTarget.phone || '-'}</span>
                <span className="text-muted-foreground">Alamat</span><span>{detailTarget.alamat || '-'}</span>
                <span className="text-muted-foreground">Tanggal Daftar</span><span>{new Date(detailTarget.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
              </div>
              {detailTarget.rejectionNotes?.length > 0 && (
                <div className="pt-3 border-t">
                  <p className="text-sm font-medium mb-2">Riwayat Verifikasi</p>
                  <div className="space-y-2">
                    {detailTarget.rejectionNotes.map((n) => (
                      <div key={n.createdAt} className="flex gap-2 text-sm">
                        <XCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                        <div>
                          <p>{n.note}</p>
                          <p className="text-xs text-muted-foreground">{new Date(n.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex gap-2 pt-2">
                <Button size="sm" className="gap-1.5" onClick={() => { approveMutation.mutate(detailTarget.id); setDetailTarget(null) }}>
                  <CheckCircle2 className="h-4 w-4" /> Setujui
                </Button>
                <Button size="sm" variant="outline" className="gap-1.5 text-destructive hover:text-destructive" onClick={() => { setRejectTarget(detailTarget); setDetailTarget(null) }}>
                  <Ban className="h-4 w-4" /> Tolak
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!noteTarget} onOpenChange={(o) => { if (!o) setNoteTarget(null) }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tambah Catatan untuk {noteTarget?.nama}</DialogTitle>
            <DialogDescription>Catatan ini akan ditambahkan ke riwayat verifikasi user.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Label>Catatan</Label>
            <Textarea
              value={additionalNote}
              onChange={(e) => setAdditionalNote(e.target.value)}
              placeholder="Tulis catatan tambahan..."
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNoteTarget(null)}>Batal</Button>
            <Button onClick={() => noteTarget && noteMutation.mutate({ id: noteTarget.id, note: additionalNote })} disabled={!additionalNote.trim() || noteMutation.isPending}>
              Simpan Catatan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => { if (!o) setDeleteTarget(null) }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus {deleteTarget?.nama}?</AlertDialogTitle>
            <AlertDialogDescription>Data user dan seluruh data terkait (absensi, pengajuan) akan dihapus permanen.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive hover:bg-destructive/90" onClick={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}>
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
