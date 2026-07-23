import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'

export default function KaryawanRoute() {
  const { user } = useAuth()
  if (user?.role === 'admin') return <Navigate to="/hrd/dashboard" replace />
  return <Outlet />
}
