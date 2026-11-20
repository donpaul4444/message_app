import { Server } from 'socket.io'
import { env } from '../config/env.js'
import { socketAuth } from './auth.js'
import { registerMessageHandlers } from './handlers/message.handlers.js'
import { userRoom } from './rooms.js'

let io = null

export function initSocket(httpServer) {
  io = new Server(httpServer, {
    cors: { origin: env.CLIENT_URL, credentials: true },
  })

  io.use(socketAuth)

  io.on('connection', (socket) => {
    socket.join(userRoom(socket.data.userId))
    registerMessageHandlers(io, socket)
  })

  return io
}

// Null until initSocket runs (e.g. in scripts/tests).
export function getIO() {
  return io
}

// Kick a user's live connections, e.g. right after an admin blocks them.
export function disconnectUser(userId) {
  io?.in(userRoom(userId)).disconnectSockets(true)
}
