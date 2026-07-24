import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import type { User } from '@/types'

interface ProfileInfoCardProps {
  user: User
}

function formatTanggal(date: string) {
  return new Date(date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}

const roleLabel: Record<string, string> = { admin: 'Admin', karyawan: 'Karyawan' }
const statusLabel: Record<string, string> = { pending: 'Pending', approved: 'Terverifikasi', rejected: 'Ditolak' }
const statusBadge: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border-0',
  approved: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-0',
  rejected: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-0',
}

export function ProfileInfoCard({ user }: ProfileInfoCardProps) {
  const initials = user.nama?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
          <Avatar className="h-20 w-20 ring-2 ring-border shrink-0">
            <AvatarImage src={user.foto && !user.foto.startsWith('[') ? user.foto : undefined} />
            <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
          </Avatar>
          <div className="text-center sm:text-left flex-1 min-w-0">
            <h2 className="text-xl font-semibold truncate">{user.nama}</h2>
            <div className="flex items-center gap-2 mt-1 justify-center sm:justify-start flex-wrap">
              <Badge variant="secondary" className={user.role === 'admin' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-0' : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400 border-0'}>
                {roleLabel[user.role] || user.role}
              </Badge>
              <Badge variant="secondary" className={statusBadge[user.status] || ''}>
                {statusLabel[user.status] || user.status}
              </Badge>
            </div>
          </div>
        </div>

        <Separator className="my-5" />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground text-xs">Email</p>
            <p className="font-medium mt-0.5 break-all">{user.email}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs">Jabatan</p>
            <p className="font-medium mt-0.5">{user.jabatan || '-'}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs">Telepon</p>
            <p className="font-medium mt-0.5">{user.phone || '-'}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs">Terdaftar</p>
            <p className="font-medium mt-0.5">{user.createdAt ? formatTanggal(user.createdAt) : '-'}</p>
          </div>
        </div>

        <Separator className="my-4" />

        <div>
          <p className="text-muted-foreground text-xs mb-1">Alamat</p>
          <p className="text-sm">{user.alamat || '-'}</p>
        </div>

        {user.rejectionNotes && user.rejectionNotes.length > 0 && (
          <>
            <Separator className="my-4" />
            <div>
              <p className="text-muted-foreground text-xs mb-2">Catatan Penolakan</p>
              <div className="space-y-2">
                {user.rejectionNotes.map((note, i) => (
                  <div key={i} className="text-sm p-3 rounded-lg bg-destructive/5 border border-destructive/20">
                    <p>{note.note}</p>
                    <p className="text-xs text-muted-foreground mt-1">{formatTanggal(note.createdAt)}</p>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
