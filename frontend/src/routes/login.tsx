import { createFileRoute } from '@tanstack/react-router'
import AuthLayout from '@/components/layout/AuthLayout'
import LoginPage from '@/pages/LoginPage'

export const Route = createFileRoute('/login')({
  component: () => (
    <AuthLayout>
      <LoginPage />
    </AuthLayout>
  ),
})
