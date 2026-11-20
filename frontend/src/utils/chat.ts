import { differenceInCalendarDays, format, isToday, isYesterday } from 'date-fns'
import type { ChatUser, Conversation } from '@/types/chat'

export function getInitials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]!.toUpperCase())
    .join('')
}

// The other person in a 1:1 chat.
export function getOtherUser(conversation: Conversation, meId: string): ChatUser | undefined {
  return conversation.members.find((m) => m.user.id !== meId)?.user
}

// Chat list: "10:42 AM", "Yesterday", "Mon", "12/11/26"
export function formatListTime(iso: string) {
  const date = new Date(iso)
  if (isToday(date)) return format(date, 'h:mm a')
  if (isYesterday(date)) return 'Yesterday'
  if (differenceInCalendarDays(new Date(), date) < 7) return format(date, 'EEE')
  return format(date, 'dd/MM/yy')
}

export function formatMessageTime(iso: string) {
  return format(new Date(iso), 'h:mm a')
}

// Separator between days in the message list.
export function formatDayLabel(iso: string) {
  const date = new Date(iso)
  if (isToday(date)) return 'Today'
  if (isYesterday(date)) return 'Yesterday'
  if (differenceInCalendarDays(new Date(), date) < 7) return format(date, 'EEEE')
  return format(date, 'MMMM d, yyyy')
}
