import { Navigate } from '@tanstack/react-router'
import type { ReactNode } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Skeleton } from '@/components/ui/skeleton'
import { Logo } from '@/components/Logo'

export default function AuthLayout({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth()

  if (isLoading) return (
    <div className="min-h-svh flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-primary/5">
      <div className="flex flex-col items-center gap-4">
        <Logo className="h-8" />
        <Skeleton className="h-10 w-72 rounded-lg" />
        <Skeleton className="h-10 w-72 rounded-lg" />
      </div>
    </div>
  )

  if (user) {
    const isOnboarding = user.status === 'pending' || user.status === 'rejected'
    return <Navigate to={isOnboarding ? '/status' : user.role === 'admin' ? '/admin/dashboard' : '/dashboard'} replace />
  }

  return <>{children}</>
}
