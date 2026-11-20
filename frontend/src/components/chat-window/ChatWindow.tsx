import { MessagesSquare } from 'lucide-react'
import { useChatStore } from '@/store/chatStore'
import type { Message } from '@/types/chat'
import ChatHeader from './ChatHeader'
import MessageComposer from './MessageComposer'
import MessageList from './MessageList'

const NO_MESSAGES: Message[] = []

export default function ChatWindow() {
  const meId = useChatStore((s) => s.meId)
  const conversation = useChatStore((s) => s.conversations.find((c) => c.id === s.activeConversationId))
  const messages =
    useChatStore((s) => (s.activeConversationId ? s.messages[s.activeConversationId] : undefined)) ?? NO_MESSAGES
  const selectConversation = useChatStore((s) => s.selectConversation)
  const sendMessage = useChatStore((s) => s.sendMessage)

  if (!conversation) return <EmptyChat />

  return (
    <div className="flex h-full flex-1 flex-col">
      <ChatHeader conversation={conversation} meId={meId} onBack={() => selectConversation(null)} />
      <MessageList conversationId={conversation.id} messages={messages} meId={meId} />
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
      <p className="max-w-sm text-sm text-muted-foreground">Pick a conversation from the list on the left.</p>
    </div>
  )
}
