import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/shared/EmptyState'
import { UserLink } from '@/components/pengguna/UserLink'
import { toast } from 'sonner'
import api from '@/api/axios'
import type { User } from '@/types'
import { CheckCircle2, XCircle, RefreshCw, Trash2, Ban, UserPlus, Clock } from 'lucide-react'

export default function AdminVerifikasiPage() {
  var queryClient = useQueryClient()
  var [rejectTarget, setRejectTarget] = useState<User | null>(null)
  var [rejectNote, setRejectNote] = useState('')
  var [deleteTarget, setDeleteTarget] = useState<User | null>(null)
  var [detailTarget, setDetailTarget] = useState<User | null>(null)

  var { data: pendingUsers, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['users', 'pending'],
    queryFn: function() { return api.get('/api/users/pending').then(function(r) { return r.data as User[] }) },
  })

  var approveMutation = useMutation({
    mutationFn: function(id: string) { return api.patch('/api/users/' + id + '/status', { status: 'approved' }) },
    onSuccess: function() { queryClient.invalidateQueries({ queryKey: ['users'] }); toast.success('User berhasil disetujui') },
  })

  var rejectMutation = useMutation({
    mutationFn: function(p: { id: string; note: string }) { return api.patch('/api/users/' + p.id + '/status', { status: 'rejected', note: p.note }) },
    onSuccess: function() { queryClient.invalidateQueries({ queryKey: ['users'] }); setRejectTarget(null); setRejectNote(''); toast.success('User ditolak') },
  })

  var deleteMutation = useMutation({
    mutationFn: function(id: string) { return api.delete('/api/users/' + id) },
    onSuccess: function() { queryClient.invalidateQueries({ queryKey: ['users'] }); setDeleteTarget(null); toast.success('User berhasil dihapus') },
  })

  return (
    <div className="space-y-5 md:space-y-6">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight">Verifikasi Karyawan</h1>
          <p className="text-xs md:text-sm text-muted-foreground">Tinjau dan setujui pendaftaran karyawan baru</p>
        </div>
        <Button variant="outline" size="icon" onClick={function() { refetch() }} disabled={isFetching}>
          <RefreshCw className={'h-4 w-4 ' + (isFetching ? 'animate-spin' : '')} />
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }, function(_, i) { return { id: 'vr-sk-' + i } }).map(function(item) {
            return <Skeleton key={item.id} className="h-28 w-full rounded-xl" />
          })}
        </div>
      ) : !pendingUsers || pendingUsers.length === 0 ? (
        <EmptyState message="Tidak ada pengguna yang menunggu verifikasi" icon={UserPlus} />
      ) : (
        <div className="grid gap-3">
          {pendingUsers.map(function(u) {
            return (
              <Card key={u.id} className="hover:border-primary/30 transition-colors">
                <CardContent className="p-4 md:p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <UserLink user={u} />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold truncate">{u.nama}</p>
                        <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                        <p className="text-[11px] text-muted-foreground truncate">
                          {u.jabatan}
                          <span className="mx-1">&middot;</span>
                          Mendaftar {new Date(u.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                        </p>
                      </div>
                    </div>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 shrink-0">
                      <Clock className="h-3 w-3" />
                      Pending
                    </span>
                  </div>
                  <div className="flex gap-2 mt-3 pt-3 border-t border-border/50">
                    <Button
                      size="sm"
                      className="gap-1.5 flex-1"
                      onClick={function() { approveMutation.mutate(u.id) }}
                      disabled={approveMutation.isPending}
                    >
                      <CheckCircle2 className="h-4 w-4" /> Setujui
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1.5 flex-1 text-destructive hover:text-destructive"
                      onClick={function() { setRejectTarget(u) }}
                    >
                      <XCircle className="h-4 w-4" /> Tolak
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1.5"
                      onClick={function() { setDetailTarget(u) }}
                    >
                      Detail
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-destructive hover:text-destructive"
                      onClick={function() { setDeleteTarget(u) }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      <Dialog open={!!rejectTarget} onOpenChange={function(o) { if (!o) setRejectTarget(null); setRejectNote('') }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tolak {rejectTarget?.nama}</DialogTitle>
            <DialogDescription>Berikan alasan penolakan agar user dapat memperbaiki pendaftarannya.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Label>Catatan Penolakan</Label>
            <Textarea
              value={rejectNote}
              onChange={function(e) { setRejectNote(e.target.value) }}
              placeholder="Jelaskan alasan penolakan..."
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={function() { setRejectTarget(null); setRejectNote('') }}>Batal</Button>
            <Button variant="destructive" onClick={function() { if (rejectTarget) rejectMutation.mutate({ id: rejectTarget.id, note: rejectNote }) }} disabled={!rejectNote.trim() || rejectMutation.isPending}>
              Tolak User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!detailTarget} onOpenChange={function(o) { if (!o) setDetailTarget(null) }}>
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
              {detailTarget.rejectionNotes && detailTarget.rejectionNotes.length > 0 && (
                <div className="pt-3 border-t">
                  <p className="text-sm font-medium mb-2">Riwayat Verifikasi</p>
                  <div className="space-y-2">
                    {detailTarget.rejectionNotes.map(function(n) {
                      return (
                        <div key={n.createdAt} className="flex gap-2 text-sm">
                          <XCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                          <div>
                            <p>{n.note}</p>
                            <p className="text-xs text-muted-foreground">{new Date(n.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
              <div className="flex gap-2 pt-2">
                <Button size="sm" className="gap-1.5" onClick={function() { approveMutation.mutate(detailTarget.id); setDetailTarget(null) }}>
                  <CheckCircle2 className="h-4 w-4" /> Setujui
                </Button>
                <Button size="sm" variant="outline" className="gap-1.5 text-destructive hover:text-destructive" onClick={function() { setRejectTarget(detailTarget); setDetailTarget(null) }}>
                  <Ban className="h-4 w-4" /> Tolak
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteTarget} onOpenChange={function(o) { if (!o) setDeleteTarget(null) }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus {deleteTarget?.nama}?</AlertDialogTitle>
            <AlertDialogDescription>Data user dan seluruh data terkait (absensi, pengajuan) akan dihapus permanen.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive hover:bg-destructive/90" onClick={function() { if (deleteTarget) deleteMutation.mutate(deleteTarget.id) }}>
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
