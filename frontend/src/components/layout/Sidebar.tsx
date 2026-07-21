import { Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Fingerprint,
  History,
  FileText,
  PlusCircle,
  User,
  Users,
  LogOut,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet'
import { useAuth } from '@/hooks/useAuth'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'

const karyawanMenu = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { label: 'Absensi', path: '/absensi', icon: Fingerprint },
  { label: 'Riwayat', path: '/absensi/riwayat', icon: History },
  { label: 'Pengajuan', path: '/pengajuan', icon: FileText },
  { label: 'Ajukan Baru', path: '/pengajuan/baru', icon: PlusCircle },
  { label: 'Profil', path: '/profil', icon: User },
]

const adminMenu = [
  { label: 'Dashboard HRD', path: '/hrd/dashboard', icon: Users },
  { label: 'Riwayat', path: '/hrd/riwayat', icon: History },
  { label: 'Kelola Karyawan', path: '/hrd/karyawan', icon: User },
  { label: 'Profil', path: '/profil', icon: User },
]

function SidebarContent({ onNav }: { onNav?: () => void }) {
  const { user, logout } = useAuth()
  const location = useLocation()
  const menu = user?.role === 'admin' ? adminMenu : karyawanMenu
  const initials = user?.nama
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <div className="flex h-full flex-col">
      <div className="p-4 border-b">
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9">
            <AvatarFallback className="text-xs">{initials}</AvatarFallback>
          </Avatar>
          <div className="text-left">
            <p className="text-sm font-medium">{user?.nama}</p>
            <p className="text-xs text-muted-foreground capitalize">{user?.role}</p>
          </div>
        </div>
      </div>
      <ScrollArea className="flex-1 p-3">
        <nav className="space-y-1">
          {menu.map((item) => {
            const Icon = item.icon
            const active = location.pathname === item.path
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={onNav}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors',
                  active
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            )
          })}
        </nav>
      </ScrollArea>
      <div className="p-3 border-t">
        <Button variant="ghost" className="w-full justify-start gap-3 text-muted-foreground" onClick={logout}>
          <LogOut className="h-4 w-4" /> Logout
        </Button>
      </div>
    </div>
  )
}

export function DesktopSidebar() {
  return (
    <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:border-r lg:bg-card">
      <SidebarContent />
    </aside>
  )
}

export function MobileSidebar({ children }: { children?: React.ReactNode }) {
  return (
    <Sheet>
      <SheetTrigger>{children || <div />}</SheetTrigger>
      <SheetContent side="left" className="w-64 p-0">
        <SidebarContent onNav={() => document.body.click()} />
      </SheetContent>
    </Sheet>
  )
}
