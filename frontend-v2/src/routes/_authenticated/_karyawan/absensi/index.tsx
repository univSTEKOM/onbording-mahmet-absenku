import { createFileRoute } from '@tanstack/react-router'
import AbsensiPage from '@/pages/AbsensiPage'

export const Route = createFileRoute('/_authenticated/_karyawan/absensi/')({
  component: AbsensiPage,
})
