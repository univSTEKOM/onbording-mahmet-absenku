import { createFileRoute } from '@tanstack/react-router'
import HrdPengajuanPage from '@/pages/HrdPengajuanPage'

export const Route = createFileRoute('/_authenticated/_admin/hrd/pengajuan')({
  component: HrdPengajuanPage,
})
