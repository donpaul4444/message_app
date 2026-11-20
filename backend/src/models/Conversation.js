import mongoose from 'mongoose'

const memberSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    lastReadAt: { type: Date, default: () => new Date(0) },
  },
  { _id: false },
)

const conversationSchema = new mongoose.Schema(
  {
    // Only "direct" (1:1) for now; the field leaves room for groups later.
    type: { type: String, enum: ['direct'], default: 'direct' },
    members: { type: [memberSchema], required: true },
    // Sorted "userIdA:userIdB" for direct chats. Unique, so the same pair can never get two conversations.
    directKey: { type: String, unique: true, sparse: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    // Denormalized for a fast chat list.
    lastMessage: {
      type: new mongoose.Schema(
        {
          text: String,
          sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
          createdAt: Date,
        },
        { _id: false },
      ),
      default: null,
    },
  },
  { timestamps: true },
)

conversationSchema.index({ 'members.user': 1, updatedAt: -1 })

export function directKeyFor(userIdA, userIdB) {
  return [String(userIdA), String(userIdB)].sort().join(':')
}

export const Conversation = mongoose.model('Conversation', conversationSchema)
