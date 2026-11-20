import { formatDistanceToNowStrict, format } from 'date-fns'
import { ArrowLeft, MessageSquare, MessagesSquare, Search, UserX, Users } from 'lucide-react'
import { useMemo, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import ConversationAvatar from '@/components/chat-list/ConversationAvatar'
import { Button, buttonVariants } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { mockAdminStats, mockAdminUsers, type AdminUserRow } from '@/utils/mockAdminData'

// Admin panel (UI only, sample data). Later: guard with an admin role and load from the API.
export default function AdminPage() {
  const [users, setUsers] = useState<AdminUserRow[]>(mockAdminUsers)
  const [query, setQuery] = useState('')

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    return users.filter((u) => !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q))
  }, [users, query])

  const toggleBlocked = (id: string) =>
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, status: u.status === 'blocked' ? 'active' : 'blocked' } : u)),
    )

  const blockedCount = users.filter((u) => u.status === 'blocked').length

  return (
    <div className="min-h-dvh bg-muted/40">
      <header className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b bg-background px-4 py-3 md:px-8">
        <div>
          <h1 className="text-lg font-semibold">Admin panel</h1>
          <p className="text-xs text-muted-foreground">Manage users and see app activity</p>
        </div>
        <Link to="/" className={buttonVariants({ variant: 'outline', size: 'sm' })}>
          <ArrowLeft />
          Back to chats
        </Link>
      </header>

      <main className="mx-auto max-w-6xl space-y-6 px-4 py-6 md:px-8">
        {/* Stats */}
        <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard icon={<Users />} label="Total users" value={users.length} />
          <StatCard icon={<MessagesSquare />} label="Conversations" value={mockAdminStats.conversations} />
          <StatCard icon={<MessageSquare />} label="Messages today" value={mockAdminStats.messagesToday} />
          <StatCard icon={<UserX />} label="Blocked users" value={blockedCount} />
        </section>

        {/* Users */}
        <section className="rounded-xl border bg-background">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3">
            <h2 className="font-medium">Users</h2>
            <div className="relative w-full sm:w-64">
              <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search name or email"
                className="h-9 pl-8"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="border-b text-left text-xs text-muted-foreground">
                  <th className="px-4 py-2.5 font-medium">User</th>
                  <th className="px-4 py-2.5 font-medium">Status</th>
                  <th className="px-4 py-2.5 text-right font-medium">Messages</th>
                  <th className="px-4 py-2.5 font-medium">Joined</th>
                  <th className="px-4 py-2.5 font-medium">Last active</th>
                  <th className="px-4 py-2.5 text-right font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((u) => (
                  <tr key={u.id} className="border-b last:border-0">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <ConversationAvatar name={u.name} src={u.avatar} className="size-9" />
                        <div className="min-w-0 leading-tight">
                          <p className="truncate font-medium">{u.name}</p>
                          <p className="truncate text-xs text-muted-foreground">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          'rounded-full px-2 py-0.5 text-xs font-medium',
                          u.status === 'blocked'
                            ? 'bg-destructive/10 text-destructive'
                            : 'bg-secondary text-secondary-foreground',
                        )}
                      >
                        {u.status === 'blocked' ? 'Blocked' : 'Active'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">{u.messageCount}</td>
                    <td className="px-4 py-3 text-muted-foreground">{format(new Date(u.joinedAt), 'MMM d, yyyy')}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {formatDistanceToNowStrict(new Date(u.lastActiveAt), { addSuffix: true })}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        size="sm"
                        variant={u.status === 'blocked' ? 'outline' : 'destructive'}
                        onClick={() => toggleBlocked(u.id)}
                      >
                        {u.status === 'blocked' ? 'Unblock' : 'Block'}
                      </Button>
                    </td>
                  </tr>
                ))}
                {visible.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">
                      No users match your search.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  )
}

function StatCard({ icon, label, value }: { icon: ReactNode; label: string; value: number }) {
  return (
    <div className="rounded-xl border bg-background p-4">
      <div className="flex items-center gap-2 text-muted-foreground [&_svg]:size-4">
        {icon}
        <span className="text-xs font-medium">{label}</span>
      </div>
      <p className="mt-2 text-2xl font-semibold tabular-nums">{value}</p>
    </div>
  )
}
