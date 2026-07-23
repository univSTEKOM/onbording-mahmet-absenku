import { createFileRoute } from '@tanstack/react-router'
import PengajuanListPage from '@/pages/PengajuanListPage'

export const Route = createFileRoute('/_authenticated/_karyawan/pengajuan/')({
  component: PengajuanListPage,
})
