import { createFileRoute, Navigate, Outlet } from '@tanstack/react-router'
import { useAuth } from '@/hooks/useAuth'

export const Route = createFileRoute('/_authenticated/_karyawan')({
  component: KaryawanGuard,
})

function KaryawanGuard() {
  const { user } = useAuth()
  if (user?.role === 'admin') return <Navigate to="/admin/dashboard" replace />
  return <Outlet />
}

