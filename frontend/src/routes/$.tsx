import { createFileRoute, Navigate } from '@tanstack/react-router'
import { useAuth } from '@/hooks/useAuth'

export const Route = createFileRoute('/$')({
  component: CatchAllRedirect,
})

function CatchAllRedirect() {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (['pending', 'rejected'].includes(user.status)) return <Navigate to="/status" replace />
  if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />
  return <Navigate to="/dashboard" replace />
}

