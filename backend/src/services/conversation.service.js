import { Conversation, directKeyFor } from '../models/Conversation.js'
import { Message } from '../models/Message.js'
import { User } from '../models/User.js'
import { AppError } from '../utils/AppError.js'

const MEMBER_FIELDS = 'name email avatar'

// Shape sent to clients (matches frontend `Conversation` type).
function toDTO(conversation, unreadCount) {
  const c = conversation
  return {
    id: c._id.toString(),
    type: c.type,
    members: c.members.map((m) => ({ user: m.user, lastReadAt: m.lastReadAt })),
    lastMessage: c.lastMessage
      ? { text: c.lastMessage.text, senderId: c.lastMessage.sender.toString(), createdAt: c.lastMessage.createdAt }
      : null,
    unreadCount,
    createdAt: c.createdAt,
    updatedAt: c.updatedAt,
  }
}

function myMember(conversation, meId) {
  return conversation.members.find((m) => String(m.user._id ?? m.user) === String(meId))
}

// Messages from others newer than my lastReadAt.
async function countUnread(conversation, meId) {
  const me = myMember(conversation, meId)
  return Message.countDocuments({
    conversation: conversation._id,
    sender: { $ne: meId },
    createdAt: { $gt: me?.lastReadAt ?? new Date(0) },
  })
}

// Throws 404 (not 403) for non-members so conversation ids can't be probed.
export async function getMemberConversation(meId, conversationId) {
  const conversation = await Conversation.findOne({ _id: conversationId, 'members.user': meId })
  if (!conversation) throw AppError.notFound('Conversation not found', 'CONVERSATION_NOT_FOUND')
  return conversation
}

// My chat list, newest activity first. A chat someone else started with me
// only appears once it has a message.
export async function listConversations(meId) {
  const conversations = await Conversation.find({
    'members.user': meId,
    $or: [{ lastMessage: { $ne: null } }, { createdBy: meId }],
  })
    .sort({ updatedAt: -1 })
    .limit(200)
    .populate('members.user', MEMBER_FIELDS)

  const unread = await Promise.all(conversations.map((c) => countUnread(c, meId)))
  return conversations.map((c, i) => toDTO(c, unread[i]))
}

export async function getConversation(meId, conversationId) {
  const conversation = await getMemberConversation(meId, conversationId)
  await conversation.populate('members.user', MEMBER_FIELDS)
  return toDTO(conversation, await countUnread(conversation, meId))
}

// Returns the existing 1:1 chat with this user, or creates it. Both must be approved.
export async function getOrCreateDirect(meId, otherUserId) {
  if (String(meId) === String(otherUserId)) {
    throw AppError.badRequest('You cannot start a chat with yourself', 'CANNOT_CHAT_SELF')
  }

  const other = await User.findOne({ _id: otherUserId, status: 'approved' }).select('_id')
  if (!other) throw AppError.notFound('User not found', 'USER_NOT_FOUND')

  const now = new Date()
  // Upsert on the unique directKey: two simultaneous requests still end up with one conversation.
  const conversation = await Conversation.findOneAndUpdate(
    { directKey: directKeyFor(meId, otherUserId) },
    {
      $setOnInsert: {
        type: 'direct',
        createdBy: meId,
        members: [
          { user: meId, lastReadAt: now },
          { user: otherUserId, lastReadAt: new Date(0) },
        ],
      },
    },
    { upsert: true, returnDocument: 'after' },
  ).populate('members.user', MEMBER_FIELDS)

  return toDTO(conversation, await countUnread(conversation, meId))
}

export async function markRead(meId, conversationId) {
  await getMemberConversation(meId, conversationId)
  const lastReadAt = new Date()
  await Conversation.updateOne(
    { _id: conversationId, 'members.user': meId },
    // timestamps: false so reading a chat doesn't bump it to the top of the list
    { $set: { 'members.$.lastReadAt': lastReadAt } },
    { timestamps: false },
  )
  return { conversationId: String(conversationId), lastReadAt }
}
