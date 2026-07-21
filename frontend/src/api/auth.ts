import api from './axios'
import type { LoginRequest, RegisterRequest, LoginResponse } from '@/types'

export async function login(data: LoginRequest): Promise<LoginResponse> {
  const res = await api.post('/api/auth/login', data)
  return res.data
}

export async function register(data: RegisterRequest): Promise<void> {
  await api.post('/api/auth/register', data)
}
