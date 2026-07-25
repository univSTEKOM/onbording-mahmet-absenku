import { useState, useRef, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
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
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { toast } from 'sonner'
import api from '@/api/axios'
import type { User } from '@/types'
import { CheckCircle2, XCircle, RefreshCw, Trash2, UserPlus, Clock, Briefcase, CalendarDays, Mail, Phone, MapPin } from 'lucide-react'

interface VerifikasiUserCardProps {
  user: User
  onApprove: (id: string) => void
  onReject: (user: User) => void
  onDetail: (user: User) => void
  onDelete: (user: User) => void
  isApproving: boolean
}

function VerifikasiUserCard(p: VerifikasiUserCardProps) {
  var u = p.user
  var nameRef = useRef<HTMLParagraphElement>(null)
  var [isOverflow, setIsOverflow] = useState(false)

  useEffect(function() {
    var el = nameRef.current
    if (el) setIsOverflow(el.scrollWidth > el.clientWidth)
  }, [u.nama])

  var initials = (u.nama || '?').charAt(0).toUpperCase()
  var joinedDate = u.createdAt
    ? new Date(u.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
    : '-'

  return (
    <div
      className="group flex flex-col lg:flex-row rounded-xl border border-border hover:border-primary/30 transition-all duration-200 cursor-pointer hover:-translate-y-0.5"
      onClick={function() { p.onDetail(u) }}
    >
      <div className="flex flex-1 min-w-0 rounded-t-xl lg:rounded-l-xl lg:rounded-tr-none bg-card">
        <div className="flex items-start gap-2.5 p-3.5 flex-1 min-w-0">
          <Avatar className="h-9 w-9 ring-2 ring-amber-200 dark:ring-amber-800/50 shrink-0">
            <AvatarImage src={u.foto && !u.foto.startsWith('[') ? u.foto : undefined} />
            <AvatarFallback className="bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400 text-xs">
              {initials}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <div className="min-w-0 flex-1 overflow-hidden">
                <p
                  ref={nameRef}
                  className={'text-sm font-semibold whitespace-nowrap ' + (isOverflow ? 'marquee' : 'truncate')}
                  title={u.nama}
                >
                  {u.nama || '-'}
                </p>
              </div>
              <span className="inline-flex items-center gap-1 rounded-full text-[10px] font-medium px-2 py-0.5 shrink-0 bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                <Clock className="h-2.5 w-2.5" />
                Pending
              </span>
            </div>
            <p className="text-xs text-muted-foreground truncate flex items-center gap-1">
              <Mail className="h-3 w-3 shrink-0" />
              {u.email}
            </p>
            <div className="flex flex-wrap items-center gap-x-2.5 gap-y-0.5 mt-0.5 text-[11px] text-muted-foreground">
              {u.jabatan && (
                <span className="flex items-center gap-1">
                  <Briefcase className="h-3 w-3 shrink-0" />
                  {u.jabatan}
                </span>
              )}
              <span className="flex items-center gap-1">
                <CalendarDays className="h-3 w-3 shrink-0" />
                Mendaftar {joinedDate}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-x-2.5 gap-y-0.5 mt-0.5 text-[11px] text-muted-foreground">
              {u.phone && (
                <span className="flex items-center gap-1 truncate max-w-[160px]">
                  <Phone className="h-3 w-3 shrink-0" />
                  {u.phone}
                </span>
              )}
              {u.alamat && (
                <span className="flex items-center gap-1 truncate max-w-[200px]">
                  <MapPin className="h-3 w-3 shrink-0" />
                  {u.alamat}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="hidden lg:flex flex-col rounded-r-xl overflow-hidden border-l border-border/40 w-12">
        <button
          type="button"
          className="flex-1 flex items-center justify-center bg-emerald-600 hover:bg-emerald-700 text-white transition-colors min-h-[48px]"
          onClick={function(e) { e.stopPropagation(); p.onApprove(u.id) }}
          disabled={p.isApproving}
        >
          <CheckCircle2 className="h-4 w-4" />
        </button>
        <button
          type="button"
          className="flex-1 flex items-center justify-center bg-red-600 hover:bg-red-700 text-white transition-colors border-t border-white/20 min-h-[48px]"
          onClick={function(e) { e.stopPropagation(); p.onReject(u) }}
        >
          <XCircle className="h-4 w-4" />
        </button>
        <button
          type="button"
          className="flex items-center justify-center bg-red-600/60 hover:bg-red-600/80 text-white transition-colors border-t border-white/20 min-h-[36px]"
          onClick={function(e) { e.stopPropagation(); p.onDelete(u) }}
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      <div className="flex lg:hidden rounded-b-xl overflow-hidden border-t border-border/40">
        <button
          type="button"
          className="flex-1 flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 text-[11px] font-medium transition-colors min-h-[42px]"
          onClick={function(e) { e.stopPropagation(); p.onApprove(u.id) }}
          disabled={p.isApproving}
        >
          <CheckCircle2 className="h-4 w-4" /> Setujui
        </button>
        <button
          type="button"
          className="flex-1 flex items-center justify-center gap-1.5 bg-red-600 hover:bg-red-700 text-white py-2.5 text-[11px] font-medium transition-colors border-l border-white/20 min-h-[42px]"
          onClick={function(e) { e.stopPropagation(); p.onReject(u) }}
        >
          <XCircle className="h-4 w-4" /> Tolak
        </button>
        <button
          type="button"
          className="flex-1 flex items-center justify-center gap-1.5 bg-red-600/60 hover:bg-red-600/80 text-white py-2.5 text-[11px] font-medium transition-colors border-l border-white/20 min-h-[42px]"
          onClick={function(e) { e.stopPropagation(); p.onDelete(u) }}
        >
          <Trash2 className="h-4 w-4" /> Hapus
        </button>
      </div>
    </div>
  )
}

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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-2.5">
          {Array.from({ length: 4 }, function(_, i) { return { id: 'vr-sk-' + i } }).map(function(item) {
            return <Skeleton key={item.id} className="h-24 w-full rounded-xl" />
          })}
        </div>
      ) : !pendingUsers || pendingUsers.length === 0 ? (
        <EmptyState message="Tidak ada pengguna yang menunggu verifikasi" icon={UserPlus} />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-2.5">
          {pendingUsers.map(function(u) {
            return (
              <VerifikasiUserCard
                key={u.id}
                user={u}
                onApprove={function(id) { approveMutation.mutate(id) }}
                onReject={function(user) { setRejectTarget(user) }}
                onDetail={function(user) { setDetailTarget(user) }}
                onDelete={function(user) { setDeleteTarget(user) }}
                isApproving={approveMutation.isPending}
              />
            )
          })}
        </div>
      )}

      <style>{`
        @keyframes marquee {
          0%, 10% { transform: translateX(0); }
          45%, 55% { transform: translateX(calc(-100% + 150px)); }
          90%, 100% { transform: translateX(0); }
        }
        .marquee {
          animation: marquee 8s ease-in-out infinite;
          display: inline-block;
          white-space: nowrap;
          padding-right: 4px;
        }
        .marquee:hover {
          animation-play-state: paused;
        }
      `}</style>

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
        <DialogContent className="sm:max-w-md gap-0 p-0">
          <DialogHeader className="px-6 pt-6 pb-0">
            <DialogTitle>Detail</DialogTitle>
          </DialogHeader>
          {detailTarget && function(u) {
            var initials = (u.nama || '?').charAt(0).toUpperCase()
            var joinedDate = u.createdAt
              ? new Date(u.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
              : '-'

            var fields = [
              { icon: Mail, label: 'Email', value: u.email },
              { icon: Briefcase, label: 'Jabatan', value: u.jabatan || '-' },
              { icon: Phone, label: 'Telepon', value: u.phone || '-' },
              { icon: MapPin, label: 'Alamat', value: u.alamat || '-' },
              { icon: CalendarDays, label: 'Terdaftar', value: joinedDate },
            ]

            return (
              <>
                <div className="px-6 py-5">
                  <div className="flex items-center gap-3.5 mb-5 pb-4 border-b border-border/50">
                    <Avatar className="h-12 w-12 ring-2 ring-amber-200 dark:ring-amber-800/50 shrink-0">
                      <AvatarImage src={u.foto && !u.foto.startsWith('[') ? u.foto : undefined} />
                      <AvatarFallback className="bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400 text-base font-semibold">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="text-base font-semibold truncate">{u.nama}</p>
                      <span className="inline-flex items-center gap-1 rounded-full text-[10px] font-medium px-2 py-0.5 bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 mt-0.5">
                        <Clock className="h-2.5 w-2.5" />
                        Pending
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {fields.map(function(f) {
                      var Icon = f.icon
                      return (
                        <div key={f.label} className="flex items-center gap-3 text-sm">
                          <div className="w-7 h-7 rounded-md bg-muted flex items-center justify-center shrink-0">
                            <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-[11px] text-muted-foreground leading-none mb-0.5">{f.label}</p>
                            <p className="font-medium truncate">{f.value}</p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {u.rejectionNotes && u.rejectionNotes.length > 0 && (
                  <div className="px-6 pb-3">
                    <div className="p-3 rounded-lg bg-destructive/5 border border-destructive/20">
                      <p className="text-xs font-semibold text-destructive mb-2 flex items-center gap-1.5">
                        <XCircle className="h-3.5 w-3.5" />
                        Riwayat Penolakan
                      </p>
                      <div className="space-y-2">
                        {u.rejectionNotes.map(function(n) {
                          return (
                            <div key={n.createdAt} className="text-xs">
                              <p>{n.note}</p>
                              <p className="text-[10px] text-muted-foreground mt-0.5">
                                {new Date(n.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </>
            )
          }(detailTarget)}
          <div className="flex border-t border-border/40 rounded-b-xl overflow-hidden">
            <button
              type="button"
              className="flex-1 flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white py-3 text-xs font-medium transition-colors min-h-[44px]"
              onClick={function() { if (detailTarget) { approveMutation.mutate(detailTarget.id); setDetailTarget(null) } }}
              disabled={approveMutation.isPending}
            >
              <CheckCircle2 className="h-4 w-4" /> Setujui
            </button>
            <button
              type="button"
              className="flex-1 flex items-center justify-center gap-1.5 bg-red-600 hover:bg-red-700 text-white py-3 text-xs font-medium transition-colors border-l border-white/20 min-h-[44px]"
              onClick={function() { if (detailTarget) { setRejectTarget(detailTarget); setDetailTarget(null) } }}
            >
              <XCircle className="h-4 w-4" /> Tolak
            </button>
            <button
              type="button"
              className="flex-1 flex items-center justify-center gap-1.5 bg-red-600/60 hover:bg-red-600/80 text-white py-3 text-xs font-medium transition-colors border-l border-white/20 min-h-[44px]"
              onClick={function() { if (detailTarget) { setDeleteTarget(detailTarget); setDetailTarget(null) } }}
            >
              <Trash2 className="h-4 w-4" /> Hapus
            </button>
          </div>
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
