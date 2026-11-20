import { Router } from 'express'
import * as chat from '../controllers/chat.controller.js'
import { requireAuth } from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'
import { conversationIdSchema, createDirectSchema, listMessagesSchema } from '../validators/chat.schema.js'

const router = Router()

// Signed in + approved. Membership is checked in the services.
router.use(requireAuth)

router.get('/', chat.listConversations)
router.post('/direct', validate(createDirectSchema), chat.createDirect)
router.get('/:id', validate(conversationIdSchema), chat.getConversation)
router.get('/:id/messages', validate(listMessagesSchema), chat.listMessages)
router.post('/:id/read', validate(conversationIdSchema), chat.markRead)

export default router
