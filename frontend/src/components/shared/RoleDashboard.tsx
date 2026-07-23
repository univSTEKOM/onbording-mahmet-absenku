import { useAuth } from '@/hooks/useAuth'
import DashboardPage from '@/pages/DashboardPage'
import HrdDashboardPage from '@/pages/HrdDashboardPage'

export default function RoleDashboard() {
  const { user } = useAuth()
  if (user?.role === 'admin') return <HrdDashboardPage />
  return <DashboardPage />
}
