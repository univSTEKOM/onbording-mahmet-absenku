import { useCallback, useMemo, useRef, useEffect } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { getAuthClient } from '@/lib/auth-client'
import api from '@/api/axios'
import type { User, LoginRequest, RegisterRequest } from '@/types'

function mergeUserData(sessionUser: Record<string, unknown> | null | undefined, profile: Record<string, unknown> | null | undefined): User | null {
  if (!sessionUser && !profile) return null
  const base = sessionUser || {} as Record<string, unknown>
  const p = profile || {} as Record<string, unknown>
  return {
    id: String(p.id ?? base.id),
    email: (p.email as string) ?? (base.email as string) ?? '',
    nama: (p.nama as string) ?? (base.name as string) ?? '',
    jabatan: (p.jabatan as string) ?? (base.jabatan as string) ?? '',
    role: (p.role as User['role']) ?? (base.role as User['role']) ?? 'karyawan',
    status: (p.status as User['status']) ?? (base.status as User['status']) ?? 'approved',
    rejectionNotes: (p.rejectionNotes as User['rejectionNotes']) ?? [],
    foto: (p.foto as string) ?? (base.image as string) ?? '',
    faceDescriptor: (p.faceDescriptor as string) ?? (base.faceDescriptor as string) ?? '',
    phone: (p.phone as string) ?? (base.phone as string) ?? '',
    alamat: (p.alamat as string) ?? (base.alamat as string) ?? '',
    createdAt: (p.createdAt as string) ?? (base.createdAt as string) ?? '',
  }
}

async function fetchProfile(): Promise<Record<string, unknown> | null> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 8000)
  try {
    const res = await api.get('/api/me', { signal: controller.signal })
    const profileData = (res.data as Record<string, unknown>)?.user as Record<string, unknown> | undefined
    return profileData && typeof profileData === 'object' && Object.keys(profileData).length > 0 ? profileData : null
  } finally {
    clearTimeout(timeout)
  }
}

export function useAuth() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const authClientRef = useRef<ReturnType<typeof getAuthClient> | null>(null)
  if (!authClientRef.current) {
    authClientRef.current = getAuthClient()
  }
  const authClient = authClientRef.current

  const { data: session, isPending: sessionPending, refetch } = authClient.useSession()
  const sessionUserId = session?.user?.id

  const profileQuery = useQuery({
    queryKey: ['auth', 'profile', sessionUserId],
    queryFn: fetchProfile,
    enabled: !!sessionUserId,
    staleTime: 30000,
    retry: 1,
  })

  const user = useMemo(() => mergeUserData(session?.user, profileQuery.data), [session, profileQuery.data])

  const login = useCallback(async (data: LoginRequest) => {
    const client = authClientRef.current!
    const { data: result, error } = await client.signIn.email({
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
    await authClientRef.current!.signOut()
    queryClient.removeQueries({ queryKey: ['auth'] })
    navigate({ to: '/login' })
  }, [navigate, queryClient])

  const updateUser = useCallback(async (data: Partial<User>) => {
    if (!sessionUserId) return
    const body: Record<string, unknown> = {}
    if (data.nama !== undefined) body.nama = data.nama
    if (data.jabatan !== undefined) body.jabatan = data.jabatan
    if (data.foto !== undefined) body.foto = data.foto
    if (data.phone !== undefined) body.phone = data.phone
    if (data.alamat !== undefined) body.alamat = data.alamat
    if (data.faceDescriptor !== undefined) body.faceDescriptor = data.faceDescriptor
    delete body.password
    await api.patch(`/users/${sessionUserId}`, body)

    await queryClient.invalidateQueries({ queryKey: ['auth', 'profile', sessionUserId] })
    await refetch()
    toast.success('Profil berhasil diperbarui')
  }, [sessionUserId, queryClient, refetch])

  const isLoading = sessionPending || (!!sessionUserId && profileQuery.isLoading)

  /* Periodic session check — detects deletion by admin */
  useEffect(() => {
    const id = setInterval(() => refetch(), 5 * 60 * 1000)
    return () => clearInterval(id)
  }, [refetch])

  return {
    user,
    isLoading,
    login,
    register,
    logout,
    updateUser,
    refetch,
    isAdmin: user?.role === 'admin',
  }
}
