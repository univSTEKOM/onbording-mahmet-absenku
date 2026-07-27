import { createFileRoute, redirect } from '@tanstack/react-router'
import AdminVerifikasiPage from '@/pages/AdminVerifikasiPage'
import api from '@/api/axios'

export const Route = createFileRoute('/_authenticated/_admin/admin/verifikasi')({
  beforeLoad: async () => {
    try {
      const res = await api.get('/api/auth/get-session')
      if (res.data?.user?.role !== 'admin') throw redirect({ to: '/dashboard' })
    } catch (e) {
      if (e instanceof redirect) throw e
      throw redirect({ to: '/login' })
    }
  },
  component: AdminVerifikasiPage,
})
