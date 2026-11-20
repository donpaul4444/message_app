// Sample data for the admin panel UI. Replace with admin REST endpoints later.

export type UserStatus = 'active' | 'blocked'

export interface AdminUserRow {
  id: string
  name: string
  email: string
  avatar: string
  status: UserStatus
  messageCount: number
  joinedAt: string
  lastActiveAt: string
}

const ago = (minutes: number) => new Date(Date.now() - minutes * 60_000).toISOString()
const HOUR = 60
const DAY = 24 * HOUR

export const mockAdminUsers: AdminUserRow[] = [
  {
    id: 'ravi',
    name: 'Ravi Kumar',
    email: 'ravi.kumar@example.com',
    avatar: '',
    status: 'active',
    messageCount: 128,
    joinedAt: ago(40 * DAY),
    lastActiveAt: ago(4),
  },
  {
    id: 'anjali',
    name: 'Anjali Menon',
    email: 'anjali.menon@example.com',
    avatar: '',
    status: 'active',
    messageCount: 86,
    joinedAt: ago(32 * DAY),
    lastActiveAt: ago(35),
  },
  {
    id: 'arjun',
    name: 'Arjun Nair',
    email: 'arjun.nair@example.com',
    avatar: '',
    status: 'active',
    messageCount: 42,
    joinedAt: ago(21 * DAY),
    lastActiveAt: ago(DAY + 3 * HOUR),
  },
  {
    id: 'sneha',
    name: 'Sneha Joseph',
    email: 'sneha.joseph@example.com',
    avatar: '',
    status: 'blocked',
    messageCount: 7,
    joinedAt: ago(12 * DAY),
    lastActiveAt: ago(9 * DAY),
  },
  {
    id: 'rahul',
    name: 'Rahul Varma',
    email: 'rahul.varma@example.com',
    avatar: '',
    status: 'active',
    messageCount: 19,
    joinedAt: ago(5 * DAY),
    lastActiveAt: ago(2 * HOUR),
  },
]

export const mockAdminStats = {
  conversations: 14,
  messagesToday: 57,
}
