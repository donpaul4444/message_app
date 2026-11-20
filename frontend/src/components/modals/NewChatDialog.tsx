import { Loader2, Search } from 'lucide-react'
import { useEffect, useState } from 'react'
import { getErrorMessage } from '@/api/axios'
import * as chatApi from '@/api/chat.api'
import ConversationAvatar from '@/components/chat-list/ConversationAvatar'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { useChatStore } from '@/store/chatStore'
import type { ChatUser } from '@/types/chat'

const DEBOUNCE_MS = 300

interface NewChatDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

// Search approved users and open (or create) a 1:1 chat with one of them.
export default function NewChatDialog({ open, onOpenChange }: NewChatDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-3 sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New chat</DialogTitle>
          <DialogDescription>Search people by name or email.</DialogDescription>
        </DialogHeader>
        {/* Mounted only while open, so every opening starts with a fresh search. */}
        {open ? <UserSearch onDone={() => onOpenChange(false)} /> : null}
      </DialogContent>
    </Dialog>
  )
}

function UserSearch({ onDone }: { onDone: () => void }) {
  const startDirectChat = useChatStore((s) => s.startDirectChat)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<ChatUser[]>([])
  const [searching, setSearching] = useState(false)
  const [startingId, setStartingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const q = query.trim()

  useEffect(() => {
    if (!q) return
    // Aborted when the query changes, so a slow older search can't overwrite newer results.
    const controller = new AbortController()
    const stale = () => controller.signal.aborted
    const timer = setTimeout(async () => {
      try {
        const users = await chatApi.searchUsers(q)
        if (!stale()) {
          setResults(users)
          setError(null)
        }
      } catch (err) {
        if (!stale()) setError(getErrorMessage(err, 'Search failed'))
      } finally {
        if (!stale()) setSearching(false)
      }
    }, DEBOUNCE_MS)
    return () => {
      controller.abort()
      clearTimeout(timer)
    }
  }, [q])

  function onQueryChange(value: string) {
    setQuery(value)
    setSearching(Boolean(value.trim()))
  }

  async function start(user: ChatUser) {
    setStartingId(user.id)
    setError(null)
    try {
      await startDirectChat(user.id)
      onDone()
    } catch (err) {
      setError(getErrorMessage(err, 'Could not start chat'))
      setStartingId(null)
    }
  }

  return (
    <>
      <div className="relative">
        <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          autoFocus
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Search name or email"
          className="h-9 pl-8"
        />
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <div className="-mx-2 max-h-80 min-h-24 overflow-y-auto">
        {!q ? (
          <p className="px-2 pt-6 text-center text-sm text-muted-foreground">Start typing to find someone.</p>
        ) : searching ? (
          <Loader2 className="mx-auto mt-6 size-5 animate-spin text-muted-foreground" />
        ) : results.length === 0 ? (
          <p className="px-2 pt-6 text-center text-sm text-muted-foreground">No one found.</p>
        ) : (
          results.map((user) => (
            <button
              key={user.id}
              type="button"
              disabled={startingId !== null}
              onClick={() => start(user)}
              className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left transition-colors hover:bg-muted disabled:opacity-60"
            >
              <ConversationAvatar name={user.name} src={user.avatar} className="size-9" />
              <div className="min-w-0 flex-1 leading-tight">
                <p className="truncate text-sm font-medium">{user.name}</p>
                <p className="truncate text-xs text-muted-foreground">{user.email}</p>
              </div>
              {startingId === user.id ? <Loader2 className="size-4 animate-spin text-muted-foreground" /> : null}
            </button>
          ))
        )}
      </div>
    </>
  )
}
