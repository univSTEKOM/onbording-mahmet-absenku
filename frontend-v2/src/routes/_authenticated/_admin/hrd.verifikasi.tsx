import { createFileRoute } from '@tanstack/react-router'
import HrdVerifikasiPage from '@/pages/HrdVerifikasiPage'

export const Route = createFileRoute('/_authenticated/_admin/hrd/verifikasi')({
  component: HrdVerifikasiPage,
})
