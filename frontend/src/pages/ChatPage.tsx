import ChatSidebar from '@/components/chat-list/ChatSidebar'
import ChatWindow from '@/components/chat-window/ChatWindow'
import { useChatSocket } from '@/hooks/useChatSocket'
import { cn } from '@/lib/utils'
import { useChatStore } from '@/store/chatStore'

// WhatsApp-style layout: chat list on the left, open conversation on the right.
// On small screens only one pane is shown at a time.
export default function ChatPage() {
  useChatSocket()
  const hasActive = useChatStore((s) => s.activeConversationId !== null)

  return (
    <div className="flex h-dvh overflow-hidden bg-background">
      <ChatSidebar className={cn('w-full md:w-80 lg:w-96 md:flex md:shrink-0', hasActive ? 'hidden' : 'flex')} />
      <main className={cn('min-w-0 flex-1 md:flex', hasActive ? 'flex' : 'hidden')}>
        <ChatWindow />
      </main>
    </div>
  )
}
