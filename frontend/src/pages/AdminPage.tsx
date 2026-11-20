import { format, formatDistanceToNowStrict } from 'date-fns'
import { ArrowLeft, Check, Clock, Loader2, RefreshCw, Search, UserX, Users, X } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import * as adminApi from '@/api/admin.api'
import { getErrorMessage } from '@/api/axios'
import ConversationAvatar from '@/components/chat-list/ConversationAvatar'
import { Button, buttonVariants } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/store/authStore'
import type { User } from '@/types/user'

type NewStatus = 'approved' | 'blocked'

export default function AdminPage() {
  const me = useAuthStore((s) => s.user)
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [pendingId, setPendingId] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      setUsers(await adminApi.listUsers())
      setError(null)
    } catch (err) {
      setError(getErrorMessage(err, 'Could not load users'))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void Promise.resolve().then(load)
  }, [load])

  const requests = users.filter((u) => u.status === 'pending')
  const members = useMemo(() => {
    const q = query.trim().toLowerCase()
    return users
      .filter((u) => u.status !== 'pending')
      .filter((u) => !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q))
  }, [users, query])
  const blockedCount = users.filter((u) => u.status === 'blocked').length

  async function changeStatus(user: User, status: NewStatus) {
    setPendingId(user.id)
    setError(null)
    try {
      const updated = await adminApi.setUserStatus(user.id, status)
      setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)))
    } catch (err) {
      setError(getErrorMessage(err, 'Could not update user'))
    } finally {
      setPendingId(null)
    }
  }

  return (
    <div className="min-h-dvh bg-muted/40">
      <header className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b bg-background px-4 py-3 md:px-8">
        <div>
          <h1 className="text-lg font-semibold">Admin panel</h1>
          <p className="text-xs text-muted-foreground">Approve sign-ups and manage users</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            disabled={loading}
            onClick={() => {
              setLoading(true)
              load()
            }}
          >
            <RefreshCw className={cn(loading && 'animate-spin')} />
            Refresh
          </Button>
          <Link to="/" className={buttonVariants({ variant: 'outline', size: 'sm' })}>
            <ArrowLeft />
            Back to chats
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-6 px-4 py-6 md:px-8">
        <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard icon={<Users />} label="Total users" value={loading ? '–' : users.length} />
          <StatCard icon={<Clock />} label="Pending requests" value={loading ? '–' : requests.length} />
          <StatCard icon={<UserX />} label="Blocked users" value={loading ? '–' : blockedCount} />
        </section>

        {error ? (
          <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-2.5 text-sm text-destructive">
            {error}
          </p>
        ) : null}

        {/* Pending sign-up requests */}
        <section className="rounded-xl border bg-background">
          <div className="border-b px-4 py-3">
            <h2 className="font-medium">Pending requests</h2>
            <p className="text-xs text-muted-foreground">People who signed in and are waiting for access</p>
          </div>
          {loading ? (
            <Loader2 className="mx-auto my-8 size-5 animate-spin text-muted-foreground" />
          ) : requests.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-muted-foreground">No pending requests.</p>
          ) : (
            <ul>
              {requests.map((u) => (
                <li key={u.id} className="flex flex-wrap items-center gap-3 border-b px-4 py-3 last:border-0">
                  <UserCell user={u} />
                  <span className="ml-auto text-xs text-muted-foreground">
                    requested {formatDistanceToNowStrict(new Date(u.createdAt), { addSuffix: true })}
                  </span>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="destructive"
                      disabled={pendingId === u.id}
                      onClick={() => changeStatus(u, 'blocked')}
                    >
                      <X />
                      Reject
                    </Button>
                    <Button size="sm" disabled={pendingId === u.id} onClick={() => changeStatus(u, 'approved')}>
                      {pendingId === u.id ? <Loader2 className="animate-spin" /> : <Check />}
                      Approve
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Approved + blocked users */}
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
                  <th className="px-4 py-2.5 font-medium">Joined</th>
                  <th className="px-4 py-2.5 font-medium">Last sign-in</th>
                  <th className="px-4 py-2.5 text-right font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">
                      <Loader2 className="mx-auto size-5 animate-spin" />
                    </td>
                  </tr>
                ) : members.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">
                      {query ? 'No users match your search.' : 'No users yet.'}
                    </td>
                  </tr>
                ) : (
                  members.map((u) => (
                    <tr key={u.id} className="border-b last:border-0">
                      <td className="px-4 py-3">
                        <UserCell user={u} isMe={u.id === me?.id} />
                      </td>
                      <td className="px-4 py-3">
                        <StatusPill user={u} />
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {format(new Date(u.createdAt), 'MMM d, yyyy')}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {formatDistanceToNowStrict(new Date(u.lastSeen), { addSuffix: true })}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {u.role === 'admin' ? (
                          <span className="text-xs text-muted-foreground">—</span>
                        ) : (
                          <Button
                            size="sm"
                            variant={u.status === 'blocked' ? 'outline' : 'destructive'}
                            disabled={pendingId === u.id}
                            onClick={() => changeStatus(u, u.status === 'blocked' ? 'approved' : 'blocked')}
                          >
                            {pendingId === u.id ? <Loader2 className="animate-spin" /> : null}
                            {u.status === 'blocked' ? 'Unblock' : 'Block'}
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  )
}

function UserCell({ user, isMe }: { user: User; isMe?: boolean }) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <ConversationAvatar name={user.name} src={user.avatar} className="size-9" />
      <div className="min-w-0 leading-tight">
        <p className="flex items-center gap-1.5 truncate font-medium">
          {user.name}
          {isMe ? <span className="text-xs font-normal text-muted-foreground">(you)</span> : null}
        </p>
        <p className="truncate text-xs text-muted-foreground">{user.email}</p>
      </div>
    </div>
  )
}

function StatusPill({ user }: { user: User }) {
  const isAdmin = user.role === 'admin'
  const label = isAdmin ? 'Admin' : user.status === 'blocked' ? 'Blocked' : 'Active'
  return (
    <span
      className={cn(
        'rounded-full px-2 py-0.5 text-xs font-medium',
        isAdmin && 'bg-primary text-primary-foreground',
        !isAdmin && user.status === 'blocked' && 'bg-destructive/10 text-destructive',
        !isAdmin && user.status !== 'blocked' && 'bg-secondary text-secondary-foreground',
      )}
    >
      {label}
    </span>
  )
}

function StatCard({ icon, label, value }: { icon: ReactNode; label: string; value: ReactNode }) {
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
