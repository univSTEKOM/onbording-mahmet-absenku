import { createFileRoute } from '@tanstack/react-router'
import HrdDashboardPage from '@/pages/HrdDashboardPage'

export const Route = createFileRoute('/_authenticated/_admin/hrd/dashboard')({
  component: HrdDashboardPage,
})
