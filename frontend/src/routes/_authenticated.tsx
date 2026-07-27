import { useState, useEffect } from 'react'
import { createFileRoute, Navigate, Outlet, useLocation, Link } from '@tanstack/react-router'
import { useAuth } from '@/hooks/useAuth'
import { FilterProvider, useFilterContext } from '@/lib/filter-context'
import { AuthContextProvider } from '@/lib/auth-context'
import { cn } from '@/lib/utils'
import { AppSidebar } from '@/components/app-sidebar'
import { ThemeToggle } from '@/components/ThemeToggle'
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { ErrorBoundary } from '@/components/shared/ErrorBoundary'
import { Loader2 } from 'lucide-react'
import { TourProvider } from '@/components/tour/TourProvider'

export const Route = createFileRoute('/_authenticated')({
  component: AuthenticatedLayout,
})

const LOADING_TIMEOUT_MS = 10000

function LoadingScreen({ timedOut }: { timedOut?: boolean }) {
  return (
    <div className="flex min-h-svh">
      <div className="hidden md:flex w-64 flex-col border-r bg-sidebar p-4 gap-4">
        <Skeleton className="h-8 w-32" />
        <div className="space-y-2">
          {function() {
            let skIdx = 0
            return Array.from({ length: 4 }).map(function() {
              skIdx++
              return <Skeleton key={`sk-item-${skIdx}`} className="h-9 w-full rounded-lg" />
            })
          }()}
        </div>
        <div className="mt-auto flex items-center gap-3">
          <Skeleton className="h-9 w-9 rounded-full" />
          <div className="space-y-1.5 flex-1">
            <Skeleton className="h-3.5 w-24" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
      </div>
      <div className="flex-1 flex flex-col">
        <header className="flex h-14 items-center gap-2 border-b px-4">
          <Skeleton className="h-5 w-5 rounded" />
          <Skeleton className="h-4 w-px" />
          <div className="flex-1" />
          <Skeleton className="h-8 w-8 rounded-md" />
        </header>
        <main className="flex-1 flex items-center justify-center p-6">
          <div className="flex flex-col items-center gap-3 text-muted-foreground">
            {timedOut ? (
              <>
                <p className="text-sm">Koneksi terputus. Mungkin sesi Anda berakhir.</p>
                <Link to="/login" className="text-sm text-primary underline underline-offset-4">
                  Kembali ke login
                </Link>
              </>
            ) : (
              <>
                <Loader2 className="h-8 w-8 animate-spin" />
                <p className="text-sm">Memuat data...</p>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}

function AuthenticatedLayout() {
  const { user, isLoading } = useAuth()
  const location = useLocation()
  const [timedOut, setTimedOut] = useState(false)

  useEffect(() => {
    if (!isLoading) { setTimedOut(false); return }
    const id = setTimeout(() => setTimedOut(true), LOADING_TIMEOUT_MS)
    return () => clearTimeout(id)
  }, [isLoading])

  if (isLoading) return <LoadingScreen timedOut={timedOut} />
  if (!user) return <Navigate to="/login" replace />
  if (['pending', 'rejected'].includes(user.status) && location.pathname !== '/status' && location.pathname !== '/profil') return <Navigate to="/status" replace />
  if (user.status === 'approved' && location.pathname === '/status') return <Navigate to="/dashboard" replace />

  return (
    <ErrorBoundary>
      <FilterProvider>
        <AuthContextProvider value={{ user }}>
          <SidebarProvider>
            <TourProvider role={user.role} status={user.status}>
              <AuthenticatedLayoutContent />
            </TourProvider>
          </SidebarProvider>
        </AuthContextProvider>
      </FilterProvider>
    </ErrorBoundary>
  )
}

function AuthenticatedLayoutContent() {
  const { isFilterOpen } = useFilterContext()
  return (
    <>
      <AppSidebar />
      <SidebarInset className={cn('relative', isFilterOpen && 'blur-sm transition-all duration-200')}>
        <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <div className="flex-1" />
          <ThemeToggle />
        </header>
        <main className="flex-1 p-4 md:p-6 overflow-auto">
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
        </main>
      </SidebarInset>
    </>
  )
}
