import { useAuth } from '@/hooks/useAuth'
import DashboardPage from '@/pages/DashboardPage'
import AdminDashboardPage from '@/pages/AdminDashboardPage'

export default function RoleDashboard() {
  const { user } = useAuth()
  if (user?.role === 'admin') return <AdminDashboardPage />
  return <DashboardPage />
}
