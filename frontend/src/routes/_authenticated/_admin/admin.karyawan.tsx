import { createFileRoute } from '@tanstack/react-router'
import AdminKaryawanPage from '@/pages/AdminKaryawanPage'

export const Route = createFileRoute('/_authenticated/_admin/admin/karyawan')({
  component: AdminKaryawanPage,
})
