import { createFileRoute } from '@tanstack/react-router'
import AdminRiwayatPage from '@/pages/AdminRiwayatPage'

export const Route = createFileRoute('/_authenticated/_admin/admin/riwayat')({
  component: AdminRiwayatPage,
})
