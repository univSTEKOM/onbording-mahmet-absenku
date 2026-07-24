import { createFileRoute, Navigate, Outlet } from '@tanstack/react-router'
import { useAuthContext } from '@/lib/auth-context'

export const Route = createFileRoute('/_authenticated/_karyawan')({
  component: KaryawanGuard,
})

function KaryawanGuard() {
  const { user } = useAuthContext()
  if (!user || user.role !== 'karyawan') return <Navigate to="/admin/dashboard" replace />
  return <Outlet />
}

