import { createFileRoute, Navigate, Outlet } from '@tanstack/react-router'
import { useAuth } from '@/hooks/useAuth'

export const Route = createFileRoute('/_authenticated/_admin')({
  component: AdminGuard,
})

function AdminGuard() {
  const { user } = useAuth()
  if (user?.role !== 'admin') return <Navigate to="/dashboard" replace />
  return <Outlet />
}
