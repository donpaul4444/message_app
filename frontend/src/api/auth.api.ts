import { api } from '@/api/axios'
import type { User } from '@/types/user'

export async function googleLogin(credential: string): Promise<User> {
  const { data } = await api.post<{ user: User }>('/auth/google', { credential })
  return data.user
}

export async function getMe(): Promise<User> {
  const { data } = await api.get<{ user: User }>('/auth/me')
  return data.user
}

export async function logout(): Promise<void> {
  await api.post('/auth/logout')
}
