import { createFileRoute, redirect } from '@tanstack/react-router'
import AdminDetailKaryawanPage from '@/pages/AdminDetailKaryawanPage'
import api from '@/api/axios'

export const Route = createFileRoute('/_authenticated/_admin/admin/profile')({
  beforeLoad: async () => {
    try {
      const res = await api.get('/api/auth/get-session')
      if (res.data?.user?.role !== 'admin') throw redirect({ to: '/dashboard' })
    } catch (error) {
      if (error instanceof Error && 'code' in error) throw error
      throw redirect({ to: '/login' })
    }
  },
  component: AdminDetailKaryawanPage,
})
