import { createFileRoute } from '@tanstack/react-router'
import HrdRiwayatPage from '@/pages/HrdRiwayatPage'

export const Route = createFileRoute('/_authenticated/_admin/hrd/riwayat')({
  component: HrdRiwayatPage,
})
