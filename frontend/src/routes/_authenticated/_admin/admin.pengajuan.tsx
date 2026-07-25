import { createFileRoute, redirect } from '@tanstack/react-router'
import AdminPengajuanPage from '@/pages/AdminPengajuanPage'
import api from '@/api/axios'

export const Route = createFileRoute('/_authenticated/_admin/admin/pengajuan')({
  beforeLoad: async () => {
    try {
      const res = await api.get('/api/auth/get-session')
      if (res.data?.user?.role !== 'admin') throw redirect({ to: '/dashboard' })
    } catch {
      throw redirect({ to: '/login' })
    }
  },
  component: AdminPengajuanPage,
})
