import { createFileRoute } from '@tanstack/react-router'
import AdminDashboardPage from '@/pages/AdminDashboardPage'

export const Route = createFileRoute('/_authenticated/_admin/admin/dashboard')({
  component: AdminDashboardPage,
})
