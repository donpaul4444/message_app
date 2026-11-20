import { z } from 'zod'
import * as messageService from '../../services/message.service.js'
import { AppError } from '../../utils/AppError.js'
import { sendMessagePayload } from '../../validators/chat.schema.js'
import { userRoom } from '../rooms.js'

function toAckError(err) {
  if (err instanceof AppError) return { code: err.code, message: err.message }
  if (err instanceof z.ZodError) return { code: 'VALIDATION_ERROR', message: z.prettifyError(err) }
  console.error(err)
  return { code: 'INTERNAL_ERROR', message: 'Could not send message' }
}

export function registerMessageHandlers(io, socket) {
  const meId = socket.data.userId

  // client → server: { conversationId, text, tempId } with ack callback
  socket.on('message:send', async (payload, ack) => {
    const reply = typeof ack === 'function' ? ack : () => {}
    try {
      const { conversationId, text, tempId } = sendMessagePayload.parse(payload)
      const { message, memberIds } = await messageService.sendMessage(meId, { conversationId, text })

      reply({ ok: true, message })

      // Everyone else in the chat gets it; my other tabs get it too, with tempId so they can dedupe.
      const others = memberIds.filter((id) => id !== meId).map(userRoom)
      if (others.length) io.to(others).emit('message:new', { message })
      socket.to(userRoom(meId)).emit('message:new', { message, tempId })
    } catch (err) {
      reply({ ok: false, error: toAckError(err) })
    }
  })
}
