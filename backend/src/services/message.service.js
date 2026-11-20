import { Conversation } from '../models/Conversation.js'
import { Message } from '../models/Message.js'
import { getMemberConversation } from './conversation.service.js'

// Cursor pagination: newest `limit` messages older than `before` (a message id).
// Returned oldest-first so the client can render them directly.
export async function listMessages(meId, conversationId, { before, limit }) {
  await getMemberConversation(meId, conversationId)

  const docs = await Message.find({
    conversation: conversationId,
    ...(before && { _id: { $lt: before } }),
  })
    .sort({ _id: -1 })
    .limit(limit + 1)

  const hasMore = docs.length > limit
  return { messages: docs.slice(0, limit).reverse(), hasMore }
}

// Save first, then the caller emits. Returns the saved message and the member ids to notify.
export async function sendMessage(meId, { conversationId, text }) {
  const conversation = await getMemberConversation(meId, conversationId)

  const message = await Message.create({ conversation: conversation._id, sender: meId, text })

  // Update the chat-list preview and bump updatedAt (sort order). My own message counts as read.
  await Conversation.updateOne(
    { _id: conversation._id, 'members.user': meId },
    {
      $set: {
        lastMessage: { text: message.text, sender: meId, createdAt: message.createdAt },
        'members.$.lastReadAt': message.createdAt,
      },
    },
  )

  return { message, memberIds: conversation.members.map((m) => m.user.toString()) }
}
