import mongoose from 'mongoose'

export const MAX_MESSAGE_LENGTH = 4000

const messageSchema = new mongoose.Schema(
  {
    conversation: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation', required: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['text'], default: 'text' }, // extend later: image, file, ...
    text: { type: String, required: true, trim: true, maxlength: MAX_MESSAGE_LENGTH },
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        return {
          id: ret._id.toString(),
          conversationId: ret.conversation.toString(),
          senderId: ret.sender.toString(),
          type: ret.type,
          text: ret.text,
          createdAt: ret.createdAt,
        }
      },
    },
  },
)

// History is paginated by _id (newest first), so this index serves "before <messageId>" queries.
messageSchema.index({ conversation: 1, _id: -1 })

export const Message = mongoose.model('Message', messageSchema)
