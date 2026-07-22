import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider, Outlet } from 'react-router-dom'
import { Toaster } from 'sonner'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from '@/components/theme-provider'
import { UserProvider } from '@/lib/user-context'
import { TooltipProvider } from '@/components/ui/tooltip'
import { ErrorBoundary } from '@/components/shared/ErrorBoundary'
import { toast } from 'sonner'
import './index.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 0, refetchOnWindowFocus: true },
    mutations: {
      onError: (error: unknown) => {
        const err = error as { response?: { data?: { message?: string } } }
        toast.error(err?.response?.data?.message || (error instanceof Error ? error.message : 'Terjadi kesalahan'))
      },
    },
  },
})

function RootLayout() {
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

const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      { index: true, lazy: () => import("./pages/WelcomePage").then(m => ({ Component: m.default })) },
      { path: "login", lazy: () => import("./pages/LoginPage").then(m => ({ Component: m.default })) },
      { path: "register", lazy: () => import("./pages/RegisterPage").then(m => ({ Component: m.default })) },
    ],
  },
])

createRoot(document.getElementById('root')!).render(
  <QueryClientProvider client={queryClient}>
    <RouterProvider router={router} />
  </QueryClientProvider>,
)
