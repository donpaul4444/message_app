import { create } from 'zustand'
import { getErrorMessage } from '@/api/axios'
import * as chatApi from '@/api/chat.api'
import { socket } from '@/socket/socket'
import { useAuthStore } from '@/store/authStore'
import type { Conversation, Message } from '@/types/chat'

const SEND_TIMEOUT_MS = 10_000

interface ConversationMessages {
  items: Message[] // oldest first
  hasMore: boolean
  loading: boolean
  loaded: boolean
}

interface ChatState {
  conversations: Conversation[]
  conversationsLoaded: boolean
  error: string | null
  connectionLost: boolean
  messages: Record<string, ConversationMessages>
  activeConversationId: string | null

  loadConversations: () => Promise<void>
  openConversation: (id: string | null) => void
  loadOlderMessages: (id: string) => Promise<void>
  startDirectChat: (userId: string) => Promise<void>
  sendMessage: (conversationId: string, text: string) => void
  retryMessage: (conversationId: string, tempId: string) => void
  receiveMessage: (message: Message, tempId?: string) => void
  setConnectionLost: (lost: boolean) => void
  resync: () => Promise<void>
  reset: () => void
}

const meId = () => useAuthStore.getState().user?.id

const emptyMessages: ConversationMessages = { items: [], hasMore: false, loading: false, loaded: false }

const initialState = {
  conversations: [] as Conversation[],
  conversationsLoaded: false,
  error: null as string | null,
  connectionLost: false,
  messages: {} as Record<string, ConversationMessages>,
  activeConversationId: null as string | null,
}

export const useChatStore = create<ChatState>((set, get) => {
  const patchMessages = (id: string, patch: (m: ConversationMessages) => Partial<ConversationMessages>) =>
    set((s) => {
      const current = s.messages[id] ?? emptyMessages
      return { messages: { ...s.messages, [id]: { ...current, ...patch(current) } } }
    })

  const patchConversation = (id: string, patch: (c: Conversation) => Partial<Conversation>) =>
    set((s) => ({ conversations: s.conversations.map((c) => (c.id === id ? { ...c, ...patch(c) } : c)) }))

  const upsertConversation = (conversation: Conversation) =>
    set((s) => ({
      conversations: s.conversations.some((c) => c.id === conversation.id)
        ? s.conversations.map((c) => (c.id === conversation.id ? conversation : c))
        : [conversation, ...s.conversations],
    }))

  const setLastMessage = (message: Message) =>
    patchConversation(message.conversationId, () => ({
      lastMessage: { text: message.text, senderId: message.senderId, createdAt: message.createdAt },
      updatedAt: message.createdAt,
    }))

  const markReadNow = (id: string) => {
    patchConversation(id, () => ({ unreadCount: 0 }))
    chatApi.markRead(id).catch(() => {})
  }

  // Latest page of a conversation. Keeps local messages the page doesn't have yet
  // (my unconfirmed ones, or live ones that arrived while this request was in flight).
  const fetchLatest = async (id: string) => {
    patchMessages(id, () => ({ loading: true }))
    try {
      const page = await chatApi.listMessages(id)
      const newest = page.messages.at(-1)?.createdAt ?? ''
      patchMessages(id, (m) => ({
        items: [
          ...page.messages,
          ...m.items.filter((x) => !page.messages.some((p) => p.id === x.id) && (x.status || x.createdAt > newest)),
        ],
        hasMore: page.hasMore,
        loaded: true,
        loading: false,
      }))
    } catch (err) {
      patchMessages(id, () => ({ loading: false }))
      set({ error: getErrorMessage(err, 'Could not load messages') })
    }
  }

  const emitSend = (message: Message) => {
    socket
      .timeout(SEND_TIMEOUT_MS)
      .emit('message:send', { conversationId: message.conversationId, text: message.text, tempId: message.id }, (err, res) => {
        const id = message.conversationId
        if (err || !res.ok) {
          patchMessages(id, (m) => ({
            items: m.items.map((x) => (x.id === message.id ? { ...x, status: 'failed' } : x)),
          }))
          return
        }
        patchMessages(id, (m) => ({ items: m.items.map((x) => (x.id === message.id ? res.message : x)) }))
        setLastMessage(res.message)
      })
  }

  return {
    ...initialState,

    loadConversations: async () => {
      try {
        const conversations = await chatApi.listConversations()
        set({ conversations, conversationsLoaded: true, error: null })
      } catch (err) {
        set({ conversationsLoaded: true, error: getErrorMessage(err, 'Could not load chats') })
      }
    },

    openConversation: (id) => {
      set({ activeConversationId: id })
      if (!id) return
      if (!get().messages[id]?.loaded) fetchLatest(id)
      const conversation = get().conversations.find((c) => c.id === id)
      if (conversation?.unreadCount) markReadNow(id)
    },

    loadOlderMessages: async (id) => {
      const current = get().messages[id]
      const oldest = current?.items.find((m) => !m.status)
      if (!current?.hasMore || current.loading || !oldest) return
      patchMessages(id, () => ({ loading: true }))
      try {
        const page = await chatApi.listMessages(id, oldest.id)
        patchMessages(id, (m) => ({ items: [...page.messages, ...m.items], hasMore: page.hasMore, loading: false }))
      } catch (err) {
        patchMessages(id, () => ({ loading: false }))
        set({ error: getErrorMessage(err, 'Could not load older messages') })
      }
    },

    startDirectChat: async (userId) => {
      const conversation = await chatApi.getOrCreateDirect(userId)
      upsertConversation(conversation)
      get().openConversation(conversation.id)
    },

    // Optimistic: show immediately, replace with the saved message on ack, or mark failed.
    sendMessage: (conversationId, text) => {
      const senderId = meId()
      if (!senderId) return
      const message: Message = {
        id: `temp-${crypto.randomUUID()}`,
        conversationId,
        senderId,
        text,
        createdAt: new Date().toISOString(),
        status: 'sending',
      }
      patchMessages(conversationId, (m) => ({ items: [...m.items, message] }))
      setLastMessage(message)
      emitSend(message)
    },

    retryMessage: (conversationId, tempId) => {
      const failed = get().messages[conversationId]?.items.find((m) => m.id === tempId)
      if (!failed) return
      patchMessages(conversationId, (m) => ({ items: m.items.filter((x) => x.id !== tempId) }))
      get().sendMessage(conversationId, failed.text)
    },

    // From the socket: a message someone sent me, or one I sent from another tab.
    receiveMessage: (message, tempId) => {
      const id = message.conversationId
      const { messages, conversations, activeConversationId } = get()

      // Only chats that are loaded or loading keep messages in memory; others load on open.
      if (messages[id] && (messages[id].loaded || messages[id].loading)) {
        patchMessages(id, (m) => {
          if (m.items.some((x) => x.id === message.id)) return {}
          if (tempId && m.items.some((x) => x.id === tempId)) {
            return { items: m.items.map((x) => (x.id === tempId ? message : x)) }
          }
          return { items: [...m.items, message] }
        })
      }

      // First message of a chat someone just started with me: fetch it for the list.
      if (!conversations.some((c) => c.id === id)) {
        chatApi.getConversation(id).then(upsertConversation).catch(() => {})
        return
      }

      setLastMessage(message)
      if (message.senderId === meId()) return
      if (id === activeConversationId) markReadNow(id)
      else patchConversation(id, (c) => ({ unreadCount: c.unreadCount + 1 }))
    },

    setConnectionLost: (lost) => set({ connectionLost: lost }),

    // After a reconnect: refetch the list and the open chat so nothing missed is lost.
    resync: async () => {
      const active = get().activeConversationId
      set((s) => ({
        messages: Object.fromEntries(
          Object.entries(s.messages).map(([id, m]) => [id, id === active ? m : { ...emptyMessages }]),
        ),
      }))
      await get().loadConversations()
      if (active) {
        await fetchLatest(active)
        if (get().conversations.find((c) => c.id === active)?.unreadCount) markReadNow(active)
      }
    },

    reset: () => set({ ...initialState }),
  }
})
