import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useNavigate } from '@tanstack/react-router'
import { Clock, AlertTriangle, CheckCircle2, XCircle, ArrowRight, RefreshCw } from 'lucide-react'

const statusConfig = {
  pending: { icon: Clock, label: 'Menunggu Verifikasi', color: 'bg-yellow-100 text-yellow-800', desc: 'Akun Anda sedang ditinjau oleh admin.' },
  approved: { icon: CheckCircle2, label: 'Terverifikasi', color: 'bg-green-100 text-green-800', desc: 'Akun Anda sudah aktif. Silakan gunakan fitur lengkap.' },
  rejected: { icon: XCircle, label: 'Ditolak', color: 'bg-red-100 text-red-800', desc: 'Akun Anda ditolak. Perbaiki data dan ajukan ulang.' },
}

export default function StatusAkunPage() {
  const { user } = useAuth()
  const navigate = useNavigate()

  if (!user) return null

  const cfg = statusConfig[user.status] || statusConfig.pending
  const Icon = cfg.icon

  return (
    <div className="max-w-lg mx-auto space-y-6 pt-8">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">Status Akun</h1>
        <p className="text-muted-foreground">Halaman monitoring status pendaftaran Anda</p>
      </div>

      <Card>
        <CardContent className="pt-6 text-center space-y-4">
          <div className={`mx-auto flex h-20 w-20 items-center justify-center rounded-full ${cfg.color}`}>
            <Icon className="h-10 w-10" />
          </div>
          <Badge className={`${cfg.color} border-0 text-sm px-4 py-1.5`}>{cfg.label}</Badge>
          <p className="text-muted-foreground">{cfg.desc}</p>
        </CardContent>
      </Card>

      {user.status === 'rejected' && user.rejectionNotes && user.rejectionNotes.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <h3 className="font-semibold flex items-center gap-2 mb-4">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              Catatan dari Admin
            </h3>
            <div className="space-y-3">
              {user.rejectionNotes.map((note, i) => (
                <div key={note.createdAt + String(i)} className="flex gap-3 text-sm">
                  <div className="flex flex-col items-center">
                    <div className="w-2 h-2 rounded-full bg-destructive mt-1.5" />
                    {i < user.rejectionNotes.length - 1 && <div className="w-px flex-1 bg-border" />}
                  </div>
                  <div>
                    <p className="text-foreground">{note.note}</p>
                    <p className="text-xs text-muted-foreground">{new Date(note.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {user.status === 'pending' && (
        <Card>
          <CardContent className="pt-6 text-center space-y-3">
            <RefreshCw className="h-8 w-8 text-muted-foreground mx-auto animate-spin" />
            <p className="text-sm text-muted-foreground">Admin akan memproses pendaftaran Anda segera.</p>
          </CardContent>
        </Card>
      )}

      {user.status === 'rejected' && (
        <Button className="w-full gap-2" size="lg" onClick={() => navigate({ to: '/profil' })}>
          Perbarui Profil <ArrowRight className="h-4 w-4" />
        </Button>
      )}

      {user.status === 'approved' && (
        <Button className="w-full gap-2" size="lg" onClick={() => navigate({ to: user.role === 'admin' ? '/admin/dashboard' : '/dashboard' })}>
          Buka Dashboard <ArrowRight className="h-4 w-4" />
        </Button>
      )}
    </div>
  )
}

