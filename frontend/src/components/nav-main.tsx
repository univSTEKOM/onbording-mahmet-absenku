import { Link } from '@tanstack/react-router'
import { Badge } from '@/components/ui/badge'
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'

export function NavMain({
  items,
}: {
  items: {
    title: string
    url: string
    icon: React.ReactNode
    isActive?: boolean
    badge?: string | number
  }[]
}) {
  return (
    <SidebarGroup>
      <SidebarMenu>
        {items.map((item) => (
          <SidebarMenuItem
            key={item.title}
            data-slot={
              item.title === 'Riwayat' ? 'nav-riwayat' :
              item.title === 'Pengajuan' ? 'nav-pengajuan' :
              item.title === 'Verifikasi Karyawan' ? 'nav-verifikasi' :
              undefined
            }
          >
            <SidebarMenuButton
              isActive={item.isActive}
              render={<Link to={item.url} />}
            >
              {item.icon}
              <span className="flex-1">{item.title}</span>
              {item.badge ? (
                <Badge className="ml-auto h-5 min-w-5 rounded-full px-1 text-[10px] leading-none flex items-center justify-center bg-primary text-primary-foreground">
                  {item.badge}
                </Badge>
              ) : null}
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}
