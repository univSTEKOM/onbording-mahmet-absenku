import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'

export default function AdminRoute() {
  const { user } = useAuth()

  if (user?.role !== 'admin') return <Navigate to="/dashboard" replace />
  if (user?.status !== 'approved') return <Navigate to="/status" replace />

  return <Outlet />
}
