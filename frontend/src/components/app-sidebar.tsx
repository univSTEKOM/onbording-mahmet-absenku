import { useLocation } from 'react-router-dom'
import { NavMain } from '@/components/nav-main'
import { NavUser } from '@/components/nav-user'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import { LayoutDashboard, History, FileText, Users } from 'lucide-react'
import { Logo } from '@/components/Logo'
import { useAuth } from '@/hooks/useAuth'

const karyawanItems = [
  { title: 'Dashboard', url: '/dashboard', icon: <LayoutDashboard /> },
  { title: 'Absensi', url: '/absensi', icon: <LayoutDashboard /> },
  { title: 'Riwayat', url: '/absensi/riwayat', icon: <History /> },
  { title: 'Pengajuan', url: '/pengajuan', icon: <FileText /> },
]

const adminItems = [
  { title: 'Dashboard HRD', url: '/hrd/dashboard', icon: <LayoutDashboard /> },
  { title: 'Riwayat', url: '/hrd/riwayat', icon: <History /> },
  { title: 'Pengajuan', url: '/hrd/pengajuan', icon: <FileText /> },
  { title: 'Kelola Karyawan', url: '/hrd/karyawan', icon: <Users /> },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useAuth()
  const location = useLocation()
  const items = user?.role === 'admin' ? adminItems : karyawanItems

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex items-center px-3 py-2">
              <Logo className="h-7 w-auto max-w-full" />
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={items.map((item) => ({
          title: item.title,
          url: item.url,
          icon: item.icon,
          isActive: location.pathname === item.url,
        }))} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  )
}
