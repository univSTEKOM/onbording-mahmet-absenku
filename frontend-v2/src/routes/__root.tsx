import { createRootRoute, Outlet } from '@tanstack/react-router'
import { Toaster } from 'sonner'
import { ThemeProvider } from '@/components/theme-provider'
import { UserProvider } from '@/lib/user-context'
import { TooltipProvider } from '@/components/ui/tooltip'
import { ErrorBoundary } from '@/components/shared/ErrorBoundary'

export const Route = createRootRoute({
  component: () => (
    <ThemeProvider defaultTheme="system">
      <UserProvider>
        <TooltipProvider>
          <ErrorBoundary>
            <Outlet />
            <Toaster position="top-right" richColors />
          </ErrorBoundary>
        </TooltipProvider>
      </UserProvider>
    </ThemeProvider>
  ),
})
