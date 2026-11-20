import { MessagesSquare } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useChatStore } from '@/store/chatStore'
import ChatHeader from './ChatHeader'
import MessageComposer from './MessageComposer'
import MessageList from './MessageList'

export default function ChatWindow() {
  const meId = useAuthStore((s) => s.user?.id ?? '')
  const conversation = useChatStore((s) => s.conversations.find((c) => c.id === s.activeConversationId))
  const thread = useChatStore((s) => (s.activeConversationId ? s.messages[s.activeConversationId] : undefined))
  const openConversation = useChatStore((s) => s.openConversation)
  const loadOlderMessages = useChatStore((s) => s.loadOlderMessages)
  const sendMessage = useChatStore((s) => s.sendMessage)
  const retryMessage = useChatStore((s) => s.retryMessage)

  if (!conversation) return <EmptyChat />

  return (
    <div className="flex h-full flex-1 flex-col">
      <ChatHeader conversation={conversation} meId={meId} onBack={() => openConversation(null)} />
      <MessageList
        conversationId={conversation.id}
        messages={thread?.items ?? []}
        loaded={thread?.loaded ?? false}
        loading={thread?.loading ?? false}
        hasMore={thread?.hasMore ?? false}
        meId={meId}
        onLoadOlder={() => loadOlderMessages(conversation.id)}
        onRetry={(tempId) => retryMessage(conversation.id, tempId)}
      />
      <MessageComposer key={conversation.id} onSend={(text) => sendMessage(conversation.id, text)} />
    </div>
  )
}

function EmptyChat() {
  return (
    <div className="flex h-full flex-1 flex-col items-center justify-center gap-3 bg-muted/40 p-6 text-center">
      <div className="flex size-16 items-center justify-center rounded-full bg-background shadow-xs">
        <MessagesSquare className="size-8 text-muted-foreground" />
      </div>
      <h2 className="text-lg font-medium">Select a chat to start messaging</h2>
      <p className="max-w-sm text-sm text-muted-foreground">
        Pick a conversation from the list, or start a new one with the New chat button.
      </p>
    </div>
  )
}
