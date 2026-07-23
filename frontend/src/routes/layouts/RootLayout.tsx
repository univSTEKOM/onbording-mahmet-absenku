import { Outlet } from 'react-router-dom'
import { Toaster } from 'sonner'
import { ThemeProvider } from '@/components/theme-provider'
import { UserProvider } from '@/lib/user-context'
import { TooltipProvider } from '@/components/ui/tooltip'
import { ErrorBoundary } from '@/components/shared/ErrorBoundary'

export default function RootLayout() {
  return (
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
  )
}
