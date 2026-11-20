import { useEffect } from 'react'
import { socket } from '@/socket/socket'
import { useAuthStore } from '@/store/authStore'
import { useChatStore } from '@/store/chatStore'

// Connects the socket while the chat page is mounted, loads the chat list,
// wires incoming events into the store, and resyncs after a reconnect.
export function useChatSocket() {
  useEffect(() => {
    const chat = useChatStore.getState()
    const checkSession = useAuthStore.getState().checkSession
    let connectedBefore = false

    const onConnect = () => {
      chat.setConnectionLost(false)
      if (connectedBefore) chat.resync()
      connectedBefore = true
    }
    const onDisconnect = (reason: string) => {
      chat.setConnectionLost(true)
      // Kicked by the server (e.g. an admin blocked this account): re-check the session,
      // which sends a blocked user to the login page. Otherwise Socket.IO reconnects by itself.
      if (reason === 'io server disconnect') checkSession()
    }
    const onConnectError = (err: Error) => {
      if (err.message === 'UNAUTHORIZED' || err.message === 'NOT_APPROVED') checkSession()
    }

    socket.on('connect', onConnect)
    socket.on('disconnect', onDisconnect)
    socket.on('connect_error', onConnectError)
    socket.on('message:new', ({ message, tempId }) => chat.receiveMessage(message, tempId))

    chat.loadConversations()
    socket.connect()

    return () => {
      socket.off('connect', onConnect)
      socket.off('disconnect', onDisconnect)
      socket.off('connect_error', onConnectError)
      socket.off('message:new')
      socket.disconnect()
      chat.reset()
    }
  }, [])
}
