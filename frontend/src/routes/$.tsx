import { createFileRoute, Navigate, useLocation } from '@tanstack/react-router'
import { useAuth } from '@/hooks/useAuth'
import WelcomePage from '@/pages/WelcomePage'

export const Route = createFileRoute('/$')({
  component: CatchAllRedirect,
})

function CatchAllRedirect() {
  const { user } = useAuth()
  const location = useLocation()

  if (location.pathname === '/') {
    if (!user) return <WelcomePage />
    if (['pending', 'rejected'].includes(user.status)) return <Navigate to="/status" replace />
    return <Navigate to={user.role === 'admin' ? '/admin/dashboard' : '/dashboard'} replace />
  }

  if (!user) return <Navigate to="/login" replace />
  if (['pending', 'rejected'].includes(user.status)) return <Navigate to="/status" replace />
  if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />
  return <Navigate to="/dashboard" replace />
}

