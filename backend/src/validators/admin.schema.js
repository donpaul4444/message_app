import mongoose from 'mongoose'
import { z } from 'zod'

const objectId = z.string().refine((id) => mongoose.isValidObjectId(id), 'Invalid id')

export const listUsersSchema = z.object({
  query: z.object({
    q: z.string().trim().max(100).optional(),
  }),
})

// Admins approve (pending/blocked → approved) or block/reject (→ blocked).
export const setStatusSchema = z.object({
  params: z.object({ userId: objectId }),
  body: z.object({ status: z.enum(['approved', 'blocked']) }),
})
