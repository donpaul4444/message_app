import { cn } from '@/lib/utils'
import type { Conversation } from '@/types/chat'
import { formatListTime, getOtherUser } from '@/utils/chat'
import ConversationAvatar from './ConversationAvatar'

interface ChatListItemProps {
  conversation: Conversation
  meId: string
  active: boolean
  onSelect: (id: string) => void
}

export default function ChatListItem({ conversation, meId, active, onSelect }: ChatListItemProps) {
  const other = getOtherUser(conversation, meId)
  const name = other?.name ?? 'Unknown'
  const last = conversation.lastMessage
  const hasUnread = conversation.unreadCount > 0

  return (
    <button
      type="button"
      onClick={() => onSelect(conversation.id)}
      className={cn(
        'flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-muted/70',
        active && 'bg-muted',
      )}
    >
      <ConversationAvatar name={name} src={other?.avatar} />

      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <p className="truncate font-medium text-foreground">{name}</p>
          {last ? (
            <span className={cn('shrink-0 text-xs', hasUnread ? 'font-medium text-foreground' : 'text-muted-foreground')}>
              {formatListTime(last.createdAt)}
            </span>
          ) : null}
        </div>

        <div className="mt-0.5 flex items-center justify-between gap-2">
          <p className="truncate text-sm text-muted-foreground">
            {last ? `${last.senderId === meId ? 'You: ' : ''}${last.text}` : 'No messages yet'}
          </p>
          {hasUnread ? (
            <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-primary px-1.5 text-[0.7rem] font-semibold text-primary-foreground">
              {conversation.unreadCount}
            </span>
          ) : null}
        </div>
      </div>
    </button>
  )
}
