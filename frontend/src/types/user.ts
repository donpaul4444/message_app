export type UserRole = 'user' | 'admin'

export interface User {
  id: string
  email: string
  name: string
  avatar: string
  role: UserRole
  lastSeen: string
  createdAt: string
  updatedAt: string
}
