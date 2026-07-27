import { createFileRoute, Navigate, Outlet } from '@tanstack/react-router'
import { useAuthContext } from '@/lib/auth-context'

export const Route = createFileRoute('/_authenticated/_admin')({
  component: AdminGuard,
})

function AdminGuard() {
  const { user } = useAuthContext()
  if (!user || user.role !== 'admin') return <Navigate to="/dashboard" replace />
  return <Outlet />
}
