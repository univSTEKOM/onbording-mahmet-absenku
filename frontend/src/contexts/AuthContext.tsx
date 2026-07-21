import { createContext, useState, useEffect, useMemo, useCallback, type ReactNode } from 'react'
import { toast } from 'sonner'
import type { User, LoginRequest, RegisterRequest } from '@/types'
import api from '@/api/axios'

interface AuthContextType {
  user: User | null
  token: string | null
  isLoading: boolean
  login: (data: LoginRequest) => Promise<void>
  register: (data: RegisterRequest) => Promise<void>
  logout: () => void
  updateUser: (data: Partial<User>) => void
  isAdmin: boolean
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const savedToken = localStorage.getItem('token')
    const savedUser = localStorage.getItem('user')
    if (savedToken && savedUser) {
      setToken(savedToken)
      setUser(JSON.parse(savedUser))
    }
    setIsLoading(false)
  }, [])

  const login = useCallback(async (data: LoginRequest) => {
    const res = await api.post('/api/auth/login', data)
    setUser(res.data.user)
    setToken(res.data.token)
    localStorage.setItem('token', res.data.token)
    localStorage.setItem('user', JSON.stringify(res.data.user))
    toast.success('Login berhasil')
  }, [])

  const register = useCallback(async (data: RegisterRequest) => {
    await api.post('/api/auth/register', data)
    toast.success('Registrasi berhasil')
  }, [])

  const updateUser = useCallback((data: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return prev
      const updated = { ...prev, ...data }
      localStorage.setItem('user', JSON.stringify(updated))
      return updated
    })
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }, [])

  const value = useMemo(
    () => ({ user, token, isLoading, login, register, logout, updateUser, isAdmin: user?.role === 'admin' }),
    [user, token, isLoading, login, register, logout, updateUser]
  )

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
