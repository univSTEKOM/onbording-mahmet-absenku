import { Navigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'

export default function RoleRedirect() {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (user.status === 'pending' || user.status === 'rejected') return <Navigate to="/status" replace />
  if (user.role === 'admin') return <Navigate to="/hrd/dashboard" replace />
  return <Navigate to="/dashboard" replace />
}
