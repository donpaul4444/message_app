export type UserRole = 'user' | 'admin'

// pending = waiting for an admin to approve; approved = can use the app; blocked = no access
export type UserStatus = 'pending' | 'approved' | 'blocked'

export interface User {
  id: string
  email: string
  name: string
  avatar: string
  role: UserRole
  status: UserStatus
  lastSeen: string
  createdAt: string
  updatedAt: string
}
