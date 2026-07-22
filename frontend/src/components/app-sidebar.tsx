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
import { Fingerprint, LayoutDashboard, History, FileText, Users } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

const karyawanItems = [
  { title: 'Dashboard', url: '/dashboard', icon: <LayoutDashboard /> },
  { title: 'Absensi', url: '/absensi', icon: <Fingerprint /> },
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
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Fingerprint className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">Absensi Karyawan</span>
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
