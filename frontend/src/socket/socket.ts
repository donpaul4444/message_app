import { io, type Socket } from 'socket.io-client'
import type { Message } from '@/types/chat'

interface ServerToClientEvents {
  'message:new': (payload: { message: Message; tempId?: string }) => void
}

export type SendAck =
  | { ok: true; message: Message }
  | { ok: false; error: { code: string; message: string } }

interface ClientToServerEvents {
  'message:send': (payload: { conversationId: string; text: string; tempId: string }, ack: (res: SendAck) => void) => void
}

// One shared connection. The auth cookie is sent automatically (withCredentials).
// Connected by the chat page while signed in; disconnected on leave/logout.
export const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(import.meta.env.VITE_API_URL, {
  withCredentials: true,
  autoConnect: false,
})
