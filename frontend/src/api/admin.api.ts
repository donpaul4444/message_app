import { api } from '@/api/axios'
import type { User } from '@/types/user'

export async function listUsers(): Promise<User[]> {
  const { data } = await api.get<{ users: User[] }>('/admin/users')
  return data.users
}

// "approved" = approve request / unblock; "blocked" = reject request / block
export async function setUserStatus(userId: string, status: 'approved' | 'blocked'): Promise<User> {
  const { data } = await api.patch<{ user: User }>(`/admin/users/${userId}/status`, { status })
  return data.user
}
