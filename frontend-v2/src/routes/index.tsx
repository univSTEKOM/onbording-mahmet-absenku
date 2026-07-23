import { createFileRoute } from '@tanstack/react-router'
import { RoleDashboard } from '@/components/shared/RoleDashboard'

export const Route = createFileRoute('/')({
  component: RoleDashboard,
})
