import { Router } from 'express'
import * as chat from '../controllers/chat.controller.js'
import { requireAuth } from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'
import { searchUsersSchema } from '../validators/chat.schema.js'

const router = Router()

router.use(requireAuth)
router.get('/search', validate(searchUsersSchema), chat.searchUsers)

export default router
