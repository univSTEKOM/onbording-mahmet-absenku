import { createFileRoute } from '@tanstack/react-router'
import StatusAkunPage from '@/pages/StatusAkunPage'

export const Route = createFileRoute('/_authenticated/status')({
  component: StatusAkunPage,
})
