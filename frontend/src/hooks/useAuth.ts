import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { authClient } from '@/lib/auth-client'
import api from '@/api/axios'
import type { User, LoginRequest, RegisterRequest } from '@/types'

function mergeUserData(sessionUser: Record<string, unknown> | null | undefined, profile: Record<string, unknown> | null): User | null {
  if (!sessionUser && !profile) return null
  const base = sessionUser || {} as Record<string, unknown>
  const p = profile || {} as Record<string, unknown>
  return {
    id: String(p.id || base.id),
    email: (p.email as string) || (base.email as string) || '',
    password: '',
    nama: (p.nama as string) || (base.name as string) || '',
    jabatan: (p.jabatan as string) || (base.jabatan as string) || '',
    role: (p.role as User['role']) || (base.role as User['role']) || 'karyawan',
    status: (p.status as User['status']) || (base.status as User['status']) || 'pending',
    rejectionNotes: (p.rejectionNotes as User['rejectionNotes']) || [],
    foto: (p.foto as string) || (base.image as string) || '',
    phone: (p.phone as string) || (base.phone as string) || '',
    alamat: (p.alamat as string) || (base.alamat as string) || '',
    createdAt: (p.createdAt as string) || (base.createdAt as string) || '',
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
  const sessionUserId = session?.user?.id
  const [profile, setProfile] = useState<Record<string, unknown> | null>(null)
  const [profileReady, setProfileReady] = useState(() => !sessionUserId)

  useEffect(() => {
    if (!sessionUserId) { setProfile(null); setProfileReady(true); return }
    let cancelled = false
    setProfileReady(false)
    api.get('/api/me').then((r) => {
      if (!cancelled) {
        setProfile((r.data as Record<string, unknown>)?.user as Record<string, unknown> || null)
      }
    }).catch(() => {
      if (!cancelled) setProfile(null)
    }).finally(() => {
      if (!cancelled) setProfileReady(true)
    })
    return () => { cancelled = true }
  }, [sessionUserId])

  const user = useMemo(() => mergeUserData(session?.user, profile), [session, profile])

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

    /* Update local profile state langsung — tanpa nunggu request ke /api/me */
    setProfile((prev) => {
      if (!prev) return prev
      return {
        ...prev,
        ...(data.nama !== undefined ? { nama: data.nama } : {}),
        ...(data.jabatan !== undefined ? { jabatan: data.jabatan } : {}),
        ...(data.phone !== undefined ? { phone: data.phone } : {}),
        ...(data.alamat !== undefined ? { alamat: data.alamat } : {}),
        ...(data.foto !== undefined ? { foto: data.foto } : {}),
      }
    })

    /* Juga update session cache supaya authClient.useSession() ikut berubah */
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
    isLoading: isPending || !profileReady,
    login,
    register,
    logout,
    updateUser,
    isAdmin: user?.role === 'admin',
  }
}
