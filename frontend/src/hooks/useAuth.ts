import { useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { authClient } from '@/lib/auth-client'
import api from '@/api/axios'
import type { User, LoginRequest, RegisterRequest } from '@/types'

function mapSessionUser(sessionUser: Record<string, unknown> | null | undefined): User | null {
  if (!sessionUser) return null
  return {
    id: String(sessionUser.id),
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

/* Hitung session query key dari hook definition */
function getSessionQueryKey(): readonly unknown[] {
  const def = authClient.useSession
  if (typeof def === 'function' && 'getQueryKey' in (def as unknown as Record<string, unknown>)) {
    return ((def as unknown as Record<string, unknown>).getQueryKey as () => readonly unknown[])()
  }
  return ['session']
}

export function useAuth() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { data: session, isPending, refetch } = authClient.useSession()

  const user = useMemo(() => mapSessionUser(session?.user), [session])

  const login = useCallback(async (data: LoginRequest) => {
    const { data: result, error } = await authClient.signIn.email({
      email: data.email,
      password: data.password,
    })
    if (error) {
      throw { response: { data: { message: error.message || 'Email atau password salah' } } }
    }
    await refetch()
    toast.success('Login berhasil')
    return result
  }, [refetch])

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

    /* Update TanStack Query cache langsung agar UI berubah tanpa nunggu refetch */
    const key = getSessionQueryKey()
    queryClient.setQueryData(key, (old: unknown) => {
      if (!old || typeof old !== 'object') return old
      const d = old as { data?: { user?: Record<string, unknown> } }
      if (!d.data?.user) return old
      return {
        ...d,
        data: {
          ...d.data,
          user: {
            ...d.data.user,
            ...(data.nama !== undefined ? { name: data.nama } : {}),
            ...(data.jabatan !== undefined ? { jabatan: data.jabatan } : {}),
            ...(data.phone !== undefined ? { phone: data.phone } : {}),
            ...(data.alamat !== undefined ? { alamat: data.alamat } : {}),
            ...(data.foto !== undefined ? { image: data.foto } : {}),
          },
        },
      }
    })

    toast.success('Profil berhasil diperbarui')
  }, [user?.id, queryClient])

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
