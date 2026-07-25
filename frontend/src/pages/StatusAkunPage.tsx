import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useNavigate } from '@tanstack/react-router'
import { Clock, AlertTriangle, XCircle, ArrowRight, RefreshCw, FileText } from 'lucide-react'

const statusConfig = {
  pending: {
    icon: Clock,
    label: 'Menunggu Verifikasi',
    desc: 'Akun Anda sedang ditinjau oleh admin.',
    gradient: 'from-amber-500/20 to-amber-600/10',
    iconColor: 'text-amber-600',
  },
  rejected: {
    icon: XCircle,
    label: 'Ditolak',
    desc: 'Akun Anda ditolak. Perbaiki data dan ajukan ulang.',
    gradient: 'from-red-500/20 to-red-600/10',
    iconColor: 'text-red-600',
  },
}

export default function StatusAkunPage() {
  const { user } = useAuth()
  const navigate = useNavigate()

  if (!user) return null

  const cfg = statusConfig[user.status]
  if (!cfg) return null

  const Icon = cfg.icon

  return (
    <div className="max-w-lg mx-auto space-y-5 animate-in fade-in duration-500">
      <div className="text-center space-y-1.5 pt-4">
        <h1 className="text-xl md:text-2xl font-bold tracking-tight">Status Akun</h1>
        <p className="text-sm text-muted-foreground">Halaman monitoring status pendaftaran Anda</p>
      </div>

      <Card>
        <CardContent className="pt-8 pb-7 text-center space-y-5">
          <div className={`mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br ${cfg.gradient}`}>
            <Icon className={`h-10 w-10 ${cfg.iconColor}`} />
          </div>

          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold bg-primary/10 text-primary">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              {cfg.label}
            </div>
            <p className="text-sm text-muted-foreground pt-1">{cfg.desc}</p>
          </div>
        </CardContent>
      </Card>

      {user.status === 'pending' && (
        <Card className="bg-muted/30">
          <CardContent className="py-6 text-center space-y-3">
            <RefreshCw className="h-7 w-7 text-muted-foreground mx-auto animate-spin" />
            <div className="space-y-1">
              <p className="text-sm font-medium">Dalam antrean verifikasi</p>
              <p className="text-xs text-muted-foreground">
                Admin akan memproses pendaftaran Anda segera. Anda akan mendapat notifikasi setelah akun diverifikasi.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {user.status === 'rejected' && user.rejectionNotes && user.rejectionNotes.length > 0 && (
        <Card>
          <CardContent className="pt-6 pb-5">
            <h3 className="text-sm font-semibold flex items-center gap-2 mb-4">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              Catatan dari Admin
            </h3>
            <div className="space-y-3">
              {user.rejectionNotes.map((note, i) => (
                <div key={note.createdAt + String(i)} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="w-6 h-6 rounded-full bg-destructive/10 flex items-center justify-center shrink-0">
                      <XCircle className="h-3 w-3 text-destructive" />
                    </div>
                    {i < user.rejectionNotes.length - 1 && <div className="w-px flex-1 bg-border" />}
                  </div>
                  <div className="pb-3">
                    <p className="text-sm">{note.note}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {new Date(note.createdAt).toLocaleDateString('id-ID', {
                        day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {user.status === 'rejected' && (
        <Button className="w-full gap-2 h-12 text-sm rounded-xl" onClick={() => navigate({ to: '/profil' })}>
          <FileText className="h-4 w-4" />
          Perbarui Profil
          <ArrowRight className="h-4 w-4" />
        </Button>
      )}
    </div>
  )
}
