import { createRootRoute, Outlet } from '@tanstack/react-router'
import { Toaster } from 'sonner'
import { ThemeProvider } from '@/components/theme-provider'
import { TooltipProvider } from '@/components/ui/tooltip'
import { ErrorBoundary } from '@/components/shared/ErrorBoundary'

export const Route = createRootRoute({
  component: () => (
    <ThemeProvider defaultTheme="system">
      <TooltipProvider>
        <ErrorBoundary>
          <Outlet />
          <Toaster position="top-right" richColors />
        </ErrorBoundary>
      </TooltipProvider>
    </ThemeProvider>
  ),
})
