import { useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { authClient } from '@/lib/auth-client'
import api from '@/api/axios'
import type { User, LoginRequest, RegisterRequest } from '@/types'

function mapSessionUser(sessionUser: Record<string, unknown> | null | undefined): User | null {
  if (!sessionUser) return null
  return {
    id: Number(sessionUser.id),
    email: sessionUser.email as string,
    password: '',
    nama: (sessionUser.name as string) || '',
    jabatan: (sessionUser.jabatan as string) || '',
    role: (sessionUser.role as User['role']) || 'karyawan',
    foto: (sessionUser.image as string) || '',
    phone: (sessionUser.phone as string) || '',
    alamat: (sessionUser.alamat as string) || '',
    createdAt: (sessionUser.createdAt as string) || '',
  }
}

export function useAuth() {
  const navigate = useNavigate()
  const { data: session, isPending, refetch } = authClient.useSession()

  const user = useMemo(() => mapSessionUser(session?.user), [session])

  const login = useCallback(async (data: LoginRequest) => {
    const { error } = await authClient.signIn.email({
      email: data.email,
      password: data.password,
    })
    if (error) {
      throw { response: { data: { message: error.message || 'Email atau password salah' } } }
    }
    toast.success('Login berhasil')
  }, [])

  const register = useCallback(async (data: RegisterRequest) => {
    const res = await api.post('/api/register', data)
    toast.success('Registrasi berhasil')
    return res.data
  }, [])

  const logout = useCallback(async () => {
    await authClient.signOut()
    navigate('/login')
  }, [navigate])

  const updateUser = useCallback(async (data: Partial<User>) => {
    if (!user?.id) return
    const body: Record<string, unknown> = {}
    if (data.nama !== undefined) body.nama = data.nama
    if (data.jabatan !== undefined) body.jabatan = data.jabatan
    if (data.foto !== undefined) body.foto = data.foto
    if (data.phone !== undefined) body.phone = data.phone
    if (data.alamat !== undefined) body.alamat = data.alamat
    await api.patch(`/users/${user.id}`, body)
    refetch()
    toast.success('Profil berhasil diperbarui')
  }, [user?.id, refetch])

  return {
    user,
    token: null,
    isLoading: isPending,
    login,
    register,
    logout,
    updateUser,
    isAdmin: user?.role === 'admin',
  }
}
