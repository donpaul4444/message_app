import { isSameDay } from 'date-fns'
import { Loader2 } from 'lucide-react'
import { Fragment, useEffect, useLayoutEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import type { Message } from '@/types/chat'
import { formatDayLabel } from '@/utils/chat'
import MessageBubble from './MessageBubble'

// Messages from the same sender within this window are grouped into one "run".
const RUN_GAP_MS = 5 * 60_000
// Within this distance of the bottom, new messages auto-scroll into view.
const NEAR_BOTTOM_PX = 150

interface MessageListProps {
  conversationId: string
  messages: Message[]
  loaded: boolean
  loading: boolean
  hasMore: boolean
  meId: string
  onLoadOlder: () => void
  onRetry: (tempId: string) => void
}

export default function MessageList({
  conversationId,
  messages,
  loaded,
  loading,
  hasMore,
  meId,
  onLoadOlder,
  onRetry,
}: MessageListProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const nearBottom = useRef(true)
  const prevConversationId = useRef<string | null>(null)
  const prevLastId = useRef<string | undefined>(undefined)
  const restoreFromBottom = useRef<number | null>(null) // set while loading older messages

  const lastMessage = messages.at(-1)

  // Keep the view steady when older messages are prepended.
  useLayoutEffect(() => {
    const el = containerRef.current
    if (el && restoreFromBottom.current !== null) {
      el.scrollTop = el.scrollHeight - restoreFromBottom.current
      restoreFromBottom.current = null
    }
  }, [messages])

  // Scroll to the bottom on opening a chat, and for new messages when already near the bottom
  // (or when I sent it). Reading older history isn't interrupted by incoming messages.
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const switched = prevConversationId.current !== conversationId || prevLastId.current === undefined
    const appended = lastMessage?.id !== prevLastId.current
    prevConversationId.current = conversationId
    prevLastId.current = lastMessage?.id
    if (!lastMessage) return
    if (switched) {
      el.scrollTop = el.scrollHeight
      nearBottom.current = true
    } else if (appended && (nearBottom.current || lastMessage.senderId === meId)) {
      el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
    }
  }, [conversationId, lastMessage, meId])

  function handleScroll() {
    const el = containerRef.current
    if (el) nearBottom.current = el.scrollHeight - el.scrollTop - el.clientHeight < NEAR_BOTTOM_PX
  }

  function loadOlder() {
    const el = containerRef.current
    if (el) restoreFromBottom.current = el.scrollHeight - el.scrollTop
    onLoadOlder()
  }

  return (
    <div ref={containerRef} onScroll={handleScroll} className="flex-1 overflow-y-auto bg-muted/60 px-3 py-4 md:px-8">
      {!loaded ? (
        <Loader2 className="mx-auto mt-10 size-5 animate-spin text-muted-foreground" />
      ) : messages.length === 0 ? (
        <p className="mt-10 text-center text-sm text-muted-foreground">No messages yet. Say hi! 👋</p>
      ) : (
        <>
          {hasMore ? (
            <div className="mb-2 flex justify-center">
              <Button variant="outline" size="sm" className="bg-background" onClick={loadOlder} disabled={loading}>
                {loading ? <Loader2 className="animate-spin" /> : null}
                Load older messages
              </Button>
            </div>
          ) : null}

          {messages.map((message, i) => {
            const prev = messages[i - 1]
            const newDay = !prev || !isSameDay(new Date(prev.createdAt), new Date(message.createdAt))
            const firstInRun =
              newDay ||
              !prev ||
              prev.senderId !== message.senderId ||
              new Date(message.createdAt).getTime() - new Date(prev.createdAt).getTime() > RUN_GAP_MS

            return (
              <Fragment key={message.id}>
                {newDay ? <DaySeparator label={formatDayLabel(message.createdAt)} /> : null}
                <MessageBubble
                  message={message}
                  mine={message.senderId === meId}
                  firstInRun={firstInRun}
                  onRetry={() => onRetry(message.id)}
                />
              </Fragment>
            )
          })}
        </>
      )}
    </div>
  )
}

function DaySeparator({ label }: { label: string }) {
  return (
    <div className="my-3 flex justify-center">
      <span className="rounded-md bg-background px-2.5 py-1 text-xs text-muted-foreground shadow-xs">{label}</span>
    </div>
  )
}
