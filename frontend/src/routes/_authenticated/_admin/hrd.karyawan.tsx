import { createFileRoute } from '@tanstack/react-router'
import HrdKaryawanPage from '@/pages/HrdKaryawanPage'

export const Route = createFileRoute('/_authenticated/_admin/hrd/karyawan')({
  component: HrdKaryawanPage,
})
