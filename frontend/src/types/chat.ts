// Chat types. These mirror the backend data model (see CLAUDE.md → Data Model),
// with populated users and a client-side unreadCount. One-to-one chats only for now.

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
  members: ConversationMember[]
  lastMessage: LastMessage | null
  unreadCount: number
  createdAt: string
  updatedAt: string
}

export interface Message {
  id: string
  conversationId: string
  senderId: string
  text: string
  createdAt: string
}
