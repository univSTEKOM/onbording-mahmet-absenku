import { createFileRoute } from '@tanstack/react-router'
import AuthLayout from '@/components/layout/AuthLayout'
import RegisterPage from '@/pages/RegisterPage'

export const Route = createFileRoute('/register')({
  component: () => (
    <AuthLayout>
      <RegisterPage />
    </AuthLayout>
  ),
})
