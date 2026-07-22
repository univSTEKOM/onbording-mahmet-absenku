import { useLocation } from 'react-router-dom'
import { NavMain } from '@/components/nav-main'
import { NavUser } from '@/components/nav-user'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
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
            <SidebarMenuButton size="lg">
              <Logo variant="icon" className="size-8 shrink-0 rounded-lg" />
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">AbsenKu</span>
                <span className="truncate text-xs text-muted-foreground">{user?.role === 'admin' ? 'HRD' : 'Karyawan'}</span>
              </div>
            </SidebarMenuButton>
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
