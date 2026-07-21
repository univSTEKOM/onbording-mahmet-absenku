import api from './axios'
import type { User } from '@/types'

export async function getUsers(): Promise<User[]> {
  const res = await api.get('/users')
  return res.data
}

export async function getUser(id: number): Promise<User> {
  const res = await api.get(`/users/${id}`)
  return res.data
}

export async function updateUser(id: number, data: Partial<User>): Promise<User> {
  const res = await api.patch(`/users/${id}`, data)
  return res.data
}
