import { useQuery } from '@tanstack/react-query'
import { useLocation } from '@tanstack/react-router'
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
import { LayoutDashboard, History, FileText, Users, ShieldCheck, UserCheck } from 'lucide-react'
import { Logo } from '@/components/Logo'
import { useAuth } from '@/hooks/useAuth'
import api from '@/api/axios'
import type { User } from '@/types'

const karyawanItems = [
  { title: 'Dashboard', url: '/dashboard', icon: <LayoutDashboard /> },
  { title: 'Absensi', url: '/absensi', icon: <LayoutDashboard /> },
  { title: 'Riwayat', url: '/absensi/riwayat', icon: <History /> },
  { title: 'Pengajuan', url: '/pengajuan', icon: <FileText /> },
]

const adminItems = [
  { title: 'Admin', url: '/hrd/dashboard', icon: <LayoutDashboard /> },
  { title: 'Riwayat', url: '/hrd/riwayat', icon: <History /> },
  { title: 'Pengajuan', url: '/hrd/pengajuan', icon: <FileText /> },
  { title: 'Kelola Karyawan', url: '/hrd/karyawan', icon: <Users /> },
]

const onboardingItems = [
  { title: 'Status Akun', url: '/status', icon: <ShieldCheck /> },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user, isAdmin } = useAuth()
  const location = useLocation()
  const isOnboarding = user?.status === 'pending' || user?.status === 'rejected'

  const { data: pendingCount = 0 } = useQuery({
    queryKey: ['users', 'pending', 'count'],
    queryFn: () => api.get('/api/users/pending').then((r) => (r.data as User[]).length),
    enabled: isAdmin,
  })

  const { data: pendingPengajuanCount = 0 } = useQuery({
    queryKey: ['pengajuan', 'pending', 'count'],
    queryFn: () => api.get('/pengajuan?status=pending').then((r) => (r.data as any[]).length),
    enabled: isAdmin,
  })

  const baseItems = isOnboarding
    ? onboardingItems
    : isAdmin
      ? adminItems
      : karyawanItems

  const items = isAdmin
    ? [
        ...baseItems.slice(0, 1),
        { title: 'Verifikasi Karyawan', url: '/hrd/verifikasi', icon: <UserCheck />, badge: pendingCount > 0 ? pendingCount : undefined },
        ...baseItems.slice(1).map((item) => ({
          ...item,
          badge: item.title === 'Pengajuan' && pendingPengajuanCount > 0 ? pendingPengajuanCount : undefined,
        })),
      ]
    : baseItems

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
          badge: (item as { badge?: number }).badge,
        }))} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  )
}
