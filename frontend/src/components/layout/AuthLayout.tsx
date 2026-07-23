import { Navigate } from '@tanstack/react-router'
import type { ReactNode } from 'react'
import { useAuth } from '@/hooks/useAuth'

export default function AuthLayout({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth()

  if (isLoading) return null
  if (user) {
    const isOnboarding = user.status === 'pending' || user.status === 'rejected'
    return <Navigate to={isOnboarding ? '/status' : user.role === 'admin' ? '/hrd/dashboard' : '/dashboard'} replace />
  }

  return (
    <div className="min-h-svh flex items-center justify-center bg-muted p-4">
      {children}
    </div>
  )
}
