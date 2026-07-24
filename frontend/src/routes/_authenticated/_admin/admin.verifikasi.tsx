import { createFileRoute } from '@tanstack/react-router'
import AdminVerifikasiPage from '@/pages/AdminVerifikasiPage'

export const Route = createFileRoute('/_authenticated/_admin/admin/verifikasi')({
  component: AdminVerifikasiPage,
})
