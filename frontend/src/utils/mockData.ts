// Sample data for building the UI before the API is wired up.
// Replace with REST calls (GET /conversations, GET /conversations/:id/messages) later.
import type { ChatUser, Conversation, Message } from '@/types/chat'

export const MOCK_ME_ID = 'me'

// Timestamps are relative to "now" so Today / Yesterday labels always look right.
const ago = (minutes: number) => new Date(Date.now() - minutes * 60_000).toISOString()
const HOUR = 60
const DAY = 24 * HOUR

const user = (id: string, name: string, email: string): ChatUser => ({ id, name, email, avatar: '' })

export const mockUsers: Record<string, ChatUser> = {
  me: user('me', 'You', 'you@example.com'),
  ravi: user('ravi', 'Ravi Kumar', 'ravi.kumar@example.com'),
  anjali: user('anjali', 'Anjali Menon', 'anjali.menon@example.com'),
}

// [senderId, text, minutesAgo]
type Seed = [string, string, number]

const seedMessages: Record<string, Seed[]> = {
  'c-ravi': [
    ['ravi', 'Hey! Are you free this evening?', 2 * DAY + 30],
    ['me', 'Mostly yes, what’s up?', 2 * DAY + 25],
    ['ravi', 'Thinking of trying that new café near MG Road', 2 * DAY + 24],
    ['me', 'Sounds good 👍', 2 * DAY + 20],
    ['me', 'Can we push it to tomorrow though? Got a deadline today.', 3 * HOUR],
    ['ravi', 'Sure, no problem', 2 * HOUR + 50],
    ['ravi', 'Tomorrow 6pm then?', 6],
    ['ravi', 'Also bring the charger I left at your place 😅', 4],
  ],
  'c-anjali': [
    ['anjali', 'Did you get a chance to look at the design draft?', 5 * HOUR],
    ['me', 'Yes! Left a few comments on the onboarding screens', 4 * HOUR],
    ['anjali', 'Thanks, I’ll go through them', 4 * HOUR - 5],
    ['me', 'The new colour palette looks great btw', 35],
  ],
}

export const mockMessages: Record<string, Message[]> = Object.fromEntries(
  Object.entries(seedMessages).map(([conversationId, seeds]) => [
    conversationId,
    seeds.map(([senderId, text, minsAgo], i) => ({
      id: `${conversationId}-m${i}`,
      conversationId,
      senderId,
      text,
      createdAt: ago(minsAgo),
    })),
  ]),
)

const conversation = (id: string, otherUserId: string, unreadCount: number): Conversation => {
  const messages = mockMessages[id] ?? []
  const last = messages.at(-1)
  return {
    id,
    members: [
      { user: mockUsers.me!, lastReadAt: ago(0) },
      { user: mockUsers[otherUserId]!, lastReadAt: ago(0) },
    ],
    unreadCount,
    lastMessage: last ? { text: last.text, senderId: last.senderId, createdAt: last.createdAt } : null,
    createdAt: messages[0]?.createdAt ?? ago(0),
    updatedAt: last?.createdAt ?? ago(0),
  }
}

export const mockConversations: Conversation[] = [
  conversation('c-ravi', 'ravi', 2),
  conversation('c-anjali', 'anjali', 0),
]
