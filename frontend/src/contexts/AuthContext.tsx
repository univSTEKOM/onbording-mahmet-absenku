import { createContext, useState, useEffect, type ReactNode } from 'react'
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

  async function login(data: LoginRequest) {
    const res = await api.post('/api/auth/login', data)
    setUser(res.data.user)
    setToken(res.data.token)
    localStorage.setItem('token', res.data.token)
    localStorage.setItem('user', JSON.stringify(res.data.user))
    toast.success('Login berhasil')
  }

  async function register(data: RegisterRequest) {
    await api.post('/api/auth/register', data)
    toast.success('Registrasi berhasil')
  }

  function logout() {
    setUser(null)
    setToken(null)
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        register,
        logout,
        isAdmin: user?.role === 'admin',
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
