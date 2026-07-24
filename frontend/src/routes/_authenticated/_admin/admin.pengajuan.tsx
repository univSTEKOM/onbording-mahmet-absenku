import { createFileRoute } from '@tanstack/react-router'
import AdminPengajuanPage from '@/pages/AdminPengajuanPage'

export const Route = createFileRoute('/_authenticated/_admin/admin/pengajuan')({
  component: AdminPengajuanPage,
})
