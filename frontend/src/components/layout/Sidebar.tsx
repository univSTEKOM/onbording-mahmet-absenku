import { Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Fingerprint,
  History,
  FileText,
  PlusCircle,
  User,
  Users,
} from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { SheetContent } from '@/components/ui/sheet'
import { cn } from '@/lib/utils'

const karyawanMenu = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { label: 'Absensi', path: '/absensi', icon: Fingerprint },
  { label: 'Riwayat', path: '/absensi/riwayat', icon: History },
  { label: 'Pengajuan', path: '/pengajuan', icon: FileText },
  { label: 'Ajukan Baru', path: '/pengajuan/baru', icon: PlusCircle },
]

const adminMenu = [
  { label: 'Dashboard HRD', path: '/hrd/dashboard', icon: Users },
  { label: 'Riwayat', path: '/hrd/riwayat', icon: History },
  { label: 'Kelola Karyawan', path: '/hrd/karyawan', icon: User },
]

function SidebarContent({ onNav }: { onNav?: () => void }) {
  const location = useLocation()
  const isAdmin = location.pathname.startsWith('/hrd')
  const menu = isAdmin ? adminMenu : karyawanMenu

  return (
    <div className="flex h-full flex-col">
      <div className="p-4 border-b">
        <p className="text-sm font-semibold tracking-tight">Absensi Karyawan</p>
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

export function MobileSidebar() {
  return (
    <SheetContent side="left" className="w-64 p-0">
      <SidebarContent onNav={() => document.body.click()} />
    </SheetContent>
  )
}
