import api from './axios'
import type { LoginRequest, RegisterRequest } from '@/types'

export async function login(data: LoginRequest) {
  const res = await api.post('/api/auth/login', data)
  return res.data
}

export async function register(data: RegisterRequest): Promise<void> {
  await api.post('/api/auth/register', data)
}
