import api from './axios'
import type { User, UpdateUserData, UserFilters } from '@/types'

export async function getUsers(filters?: UserFilters): Promise<User[]> {
  const res = await api.get('/users', { params: filters })
  return res.data.data ?? res.data
}

export async function updateUser(id: string, data: UpdateUserData): Promise<User> {
  const res = await api.patch(`/users/${id}`, data)
  return res.data.data ?? res.data
}
