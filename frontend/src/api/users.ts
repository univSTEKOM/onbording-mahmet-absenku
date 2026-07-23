import api from './axios'
import type { User, UpdateUserData } from '@/types'

export async function getUsers(): Promise<User[]> {
  const res = await api.get('/users')
  return res.data
}

export async function updateUser(id: string, data: UpdateUserData): Promise<User> {
  const res = await api.patch(`/users/${id}`, data)
  return res.data
}
