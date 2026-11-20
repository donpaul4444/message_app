import { ArrowLeft } from 'lucide-react'
import ConversationAvatar from '@/components/chat-list/ConversationAvatar'
import { Button } from '@/components/ui/button'
import type { Conversation } from '@/types/chat'
import { getOtherUser } from '@/utils/chat'

interface ChatHeaderProps {
  conversation: Conversation
  meId: string
  onBack: () => void
}

export default function ChatHeader({ conversation, meId, onBack }: ChatHeaderProps) {
  const other = getOtherUser(conversation, meId)
  const name = other?.name ?? 'Unknown'

  return (
    <header className="flex items-center gap-2 border-b bg-muted/40 px-2 py-2 md:px-4">
      <Button variant="ghost" size="icon" className="md:hidden" aria-label="Back to chats" onClick={onBack}>
        <ArrowLeft />
      </Button>
      <ConversationAvatar name={name} src={other?.avatar} className="size-10" />
      <div className="min-w-0 leading-tight">
        <p className="truncate font-medium">{name}</p>
        <p className="truncate text-xs text-muted-foreground">{other?.email}</p>
      </div>
    </header>
  )
}
