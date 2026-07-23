import { createFileRoute } from '@tanstack/react-router'
import RiwayatPage from '@/pages/RiwayatPage'

export const Route = createFileRoute('/_authenticated/_karyawan/absensi/riwayat')({
  component: RiwayatPage,
})
