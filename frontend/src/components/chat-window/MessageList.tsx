import { isSameDay } from 'date-fns'
import { Fragment, useEffect, useRef } from 'react'
import type { Message } from '@/types/chat'
import { formatDayLabel } from '@/utils/chat'
import MessageBubble from './MessageBubble'

// Messages from the same sender within this window are grouped into one "run".
const RUN_GAP_MS = 5 * 60_000

interface MessageListProps {
  conversationId: string
  messages: Message[]
  meId: string
}

export default function MessageList({ conversationId, messages, meId }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null)

  // Jump to the bottom when opening a chat; scroll smoothly for new messages.
  const lastConversationId = useRef<string | null>(null)
  useEffect(() => {
    const switched = lastConversationId.current !== conversationId
    lastConversationId.current = conversationId
    bottomRef.current?.scrollIntoView({ block: 'end', behavior: switched ? 'instant' : 'smooth' })
  }, [conversationId, messages.length])

  return (
    <div className="flex-1 overflow-y-auto bg-muted/60 px-3 py-4 md:px-8">
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
            <MessageBubble message={message} mine={message.senderId === meId} firstInRun={firstInRun} />
          </Fragment>
        )
      })}
      <div ref={bottomRef} />
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
