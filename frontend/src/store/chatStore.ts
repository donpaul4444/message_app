import { create } from 'zustand'
import type { Conversation, Message } from '@/types/chat'
import { MOCK_ME_ID, mockConversations, mockMessages } from '@/utils/mockData'

// UI-only store backed by sample data for now.
// Later: load conversations/messages via REST and update from socket events.
interface ChatState {
  meId: string
  conversations: Conversation[]
  messages: Record<string, Message[]> // conversationId → messages (oldest first)
  activeConversationId: string | null
  selectConversation: (id: string | null) => void
  sendMessage: (conversationId: string, text: string) => void
}

export const useChatStore = create<ChatState>((set) => ({
  meId: MOCK_ME_ID,
  conversations: mockConversations,
  messages: mockMessages,
  activeConversationId: null,

  selectConversation: (id) =>
    set((state) => ({
      activeConversationId: id,
      conversations: id
        ? state.conversations.map((c) => (c.id === id ? { ...c, unreadCount: 0 } : c))
        : state.conversations,
    })),

  sendMessage: (conversationId, text) => {
    const createdAt = new Date().toISOString()
    const message: Message = {
      id: `temp-${Date.now()}`,
      conversationId,
      senderId: MOCK_ME_ID,
      text,
      createdAt,
    }

    set((state) => ({
      messages: {
        ...state.messages,
        [conversationId]: [...(state.messages[conversationId] ?? []), message],
      },
      conversations: state.conversations.map((c) =>
        c.id === conversationId
          ? { ...c, lastMessage: { text, senderId: MOCK_ME_ID, createdAt }, updatedAt: createdAt }
          : c,
      ),
    }))
  },
}))
