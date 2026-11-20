import { Router } from 'express'
import * as admin from '../controllers/admin.controller.js'
import { requireAdmin, requireAuth } from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'
import { listUsersSchema, setStatusSchema } from '../validators/admin.schema.js'

const router = Router()

// Every route here is admin-only.
router.use(requireAuth, requireAdmin)

router.get('/users', validate(listUsersSchema), admin.listUsers)
router.patch('/users/:userId/status', validate(setStatusSchema), admin.setStatus)

export default router
