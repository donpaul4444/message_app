import mongoose from 'mongoose'
import { z } from 'zod'
import { MAX_MESSAGE_LENGTH } from '../models/Message.js'

const objectId = z.string().refine((id) => mongoose.isValidObjectId(id), 'Invalid id')

// ---- REST ----

export const searchUsersSchema = z.object({
  query: z.object({ q: z.string().trim().min(1, 'Type something to search').max(100) }),
})

export const createDirectSchema = z.object({
  body: z.object({ userId: objectId }),
})

export const conversationIdSchema = z.object({
  params: z.object({ id: objectId }),
})

export const listMessagesSchema = z.object({
  params: z.object({ id: objectId }),
  query: z.object({
    before: objectId.optional(),
    limit: z.coerce.number().int().min(1).max(100).default(30),
  }),
})

// ---- Socket payloads ----

export const sendMessagePayload = z.object({
  conversationId: objectId,
  text: z.string().trim().min(1, 'Message is empty').max(MAX_MESSAGE_LENGTH),
  tempId: z.string().max(100),
})
