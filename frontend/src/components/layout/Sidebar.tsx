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
  Menu,
  X,
} from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/useAuth'
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
  { label: 'Profil', path: '/profil', icon: User },
]

export default function Sidebar() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const [open, setOpen] = useState(false)
  const menu = user?.role === 'admin' ? adminMenu : karyawanMenu

  return (
    <>
      <button
        className="fixed top-4 left-4 z-50 lg:hidden p-2 rounded-md bg-background border shadow-sm"
        onClick={() => setOpen(!open)}
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        className={cn(
          'w-64 border-r bg-card flex flex-col fixed lg:sticky top-0 h-svh z-40 transition-transform lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        <div className="p-4 border-b flex items-center justify-between">
          <h1 className="text-lg font-bold">Absensi Karyawan</h1>
          <button
            className="lg:hidden p-1 rounded-md hover:bg-muted"
            onClick={() => setOpen(false)}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <nav className="flex-1 p-2 space-y-1">
          {menu.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors',
                  location.pathname === item.path
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-muted'
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            )
          })}
        </nav>
        <div className="p-2 border-t">
          <Button
            variant="ghost"
            className="w-full justify-start gap-3"
            onClick={logout}
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>
      </aside>
    </>
  )
}
