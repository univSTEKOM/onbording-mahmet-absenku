import { createFileRoute } from '@tanstack/react-router'
import PengajuanFormPage from '@/pages/PengajuanFormPage'

export const Route = createFileRoute('/_authenticated/_karyawan/pengajuan/baru')({
  component: PengajuanFormPage,
})
