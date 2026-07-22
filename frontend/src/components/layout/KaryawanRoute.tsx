import { Navigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import type { ReactNode } from 'react'

export default function KaryawanRoute({ children }: { children: ReactNode }) {
  const { user } = useAuth()

  if (user?.role === 'admin') return <Navigate to="/hrd/dashboard" replace />
  if (user?.status !== 'approved') return <Navigate to="/status" replace />

  return children
}
