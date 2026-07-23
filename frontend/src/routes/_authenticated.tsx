import { createFileRoute, Navigate, Outlet } from '@tanstack/react-router'
import { useAuth } from '@/hooks/useAuth'
import { FilterProvider } from '@/lib/filter-context'
import { AppSidebar } from '@/components/app-sidebar'
import { ThemeToggle } from '@/components/ThemeToggle'
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'

export const Route = createFileRoute('/_authenticated')({
  component: AuthenticatedLayout,
})

function AuthenticatedLayout() {
  const { user, isLoading } = useAuth()

  if (isLoading) return null
  if (!user) return <Navigate to="/login" replace />
  if (['pending', 'rejected'].includes(user.status)) return <Navigate to="/status" replace />

  return (
    <FilterProvider>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset className="relative">
          <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <div className="flex-1" />
            <ThemeToggle />
          </header>
          <main className="flex-1 p-4 md:p-6 overflow-auto">
            <Outlet />
          </main>
        </SidebarInset>
      </SidebarProvider>
    </FilterProvider>
  )
}
