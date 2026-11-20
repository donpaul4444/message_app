import { api } from '@/api/axios'
import type { ChatUser, Conversation, Message } from '@/types/chat'

export async function searchUsers(q: string): Promise<ChatUser[]> {
  const { data } = await api.get<{ users: ChatUser[] }>('/users/search', { params: { q } })
  return data.users
}

export async function listConversations(): Promise<Conversation[]> {
  const { data } = await api.get<{ conversations: Conversation[] }>('/conversations')
  return data.conversations
}

export async function getConversation(id: string): Promise<Conversation> {
  const { data } = await api.get<{ conversation: Conversation }>(`/conversations/${id}`)
  return data.conversation
}

// Returns the existing 1:1 chat with this user, or creates one.
export async function getOrCreateDirect(userId: string): Promise<Conversation> {
  const { data } = await api.post<{ conversation: Conversation }>('/conversations/direct', { userId })
  return data.conversation
}

export interface MessagesPage {
  messages: Message[] // oldest first
  hasMore: boolean
}

export async function listMessages(conversationId: string, before?: string): Promise<MessagesPage> {
  const { data } = await api.get<MessagesPage>(`/conversations/${conversationId}/messages`, {
    params: { before, limit: 30 },
  })
  return data
}

export async function markRead(conversationId: string): Promise<void> {
  await api.post(`/conversations/${conversationId}/read`)
}
