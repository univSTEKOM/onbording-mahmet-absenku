import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'

export default function ProtectedRoute() {
  const { user, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) return null
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />

  const allowedPaths = ['/status', '/profil']
  const isOnboarding = user.status === 'pending' || user.status === 'rejected'
  if (isOnboarding && !allowedPaths.includes(location.pathname)) {
    return <Navigate to="/status" replace />
  }

  return <Outlet />
}
