import { LogOut, MessageSquarePlus, Search, ShieldUser } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Button, buttonVariants } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/store/authStore'
import { useChatStore } from '@/store/chatStore'
import { getOtherUser } from '@/utils/chat'
import ChatListItem from './ChatListItem'
import ConversationAvatar from './ConversationAvatar'

export default function ChatSidebar({ className }: { className?: string }) {
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const meId = useChatStore((s) => s.meId)
  const conversations = useChatStore((s) => s.conversations)
  const activeConversationId = useChatStore((s) => s.activeConversationId)
  const selectConversation = useChatStore((s) => s.selectConversation)

  const [query, setQuery] = useState('')

  // Sorted by latest message, then filtered by search.
  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    return [...conversations]
      .sort((a, b) => (b.lastMessage?.createdAt ?? b.updatedAt).localeCompare(a.lastMessage?.createdAt ?? a.updatedAt))
      .filter((c) => !q || (getOtherUser(c, meId)?.name ?? '').toLowerCase().includes(q))
  }, [conversations, query, meId])

  return (
    <aside className={cn('flex h-full flex-col border-r bg-background', className)}>
      {/* Header: me + actions */}
      <header className="flex items-center justify-between gap-2 border-b bg-muted/40 px-3 py-2.5">
        <div className="flex min-w-0 items-center gap-2.5">
          <ConversationAvatar name={user?.name ?? 'Me'} src={user?.avatar} className="size-9" />
          <div className="min-w-0 leading-tight">
            <p className="truncate text-sm font-medium">{user?.name}</p>
            <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
          </div>
        </div>
        <div className="flex shrink-0 items-center">
          <Button variant="ghost" size="icon" title="New chat" aria-label="New chat">
            <MessageSquarePlus />
          </Button>
          {user?.role === 'admin' ? (
            <Link
              to="/admin"
              title="Admin panel"
              aria-label="Admin panel"
              className={buttonVariants({ variant: 'ghost', size: 'icon' })}
            >
              <ShieldUser />
            </Link>
          ) : null}
          <Button variant="ghost" size="icon" title="Log out" aria-label="Log out" onClick={logout}>
            <LogOut />
          </Button>
        </div>
      </header>

      {/* Search */}
      <div className="px-3 pt-3 pb-2">
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search chats"
            className="h-9 rounded-full border-transparent bg-muted pl-8"
          />
        </div>
      </div>

      {/* Conversation list */}
      <nav className="flex-1 overflow-y-auto pb-2" aria-label="Chats">
        {visible.length === 0 ? (
          <p className="px-4 py-10 text-center text-sm text-muted-foreground">
            {query ? 'No chats match your search.' : 'No chats yet.'}
          </p>
        ) : (
          visible.map((c) => (
            <ChatListItem
              key={c.id}
              conversation={c}
              meId={meId}
              active={c.id === activeConversationId}
              onSelect={selectConversation}
            />
          ))
        )}
      </nav>
    </aside>
  )
}
