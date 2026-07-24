import { createFileRoute } from '@tanstack/react-router'
import HrdDetailKaryawanPage from '@/pages/HrdDetailKaryawanPage'

export const Route = createFileRoute('/_authenticated/_admin/hrd/profile')({
  component: HrdDetailKaryawanPage,
})
