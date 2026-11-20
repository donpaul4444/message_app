// Chat types. These match the backend responses (see CLAUDE.md → API / Socket Events).
// One-to-one chats only for now.

export interface ChatUser {
  id: string
  name: string
  email: string
  avatar: string
}

export interface ConversationMember {
  user: ChatUser
  lastReadAt: string
}

export interface LastMessage {
  text: string
  senderId: string
  createdAt: string
}

export interface Conversation {
  id: string
  type: 'direct'
  members: ConversationMember[]
  lastMessage: LastMessage | null
  unreadCount: number
  createdAt: string
  updatedAt: string
}

export interface Message {
  id: string // a temp id ("temp-…") until the server confirms it
  conversationId: string
  senderId: string
  text: string
  createdAt: string
  status?: 'sending' | 'failed' // client-only, for my optimistic messages
}
