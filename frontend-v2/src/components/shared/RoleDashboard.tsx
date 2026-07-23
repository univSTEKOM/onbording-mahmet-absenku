import { useAuth } from '@/hooks/useAuth'
import { Navigate } from '@tanstack/react-router'

export function RoleDashboard() {
  const { user, isLoading } = useAuth()
  if (isLoading) return null
  if (user?.role === 'admin') return <Navigate to="/hrd/dashboard" replace />
  return <Navigate to="/dashboard" replace />
}
