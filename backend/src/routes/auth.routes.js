import { Router } from 'express'
import * as auth from '../controllers/auth.controller.js'
import { requireAuth } from '../middleware/auth.js'
import { authLimiter } from '../middleware/rateLimit.js'
import { validate } from '../middleware/validate.js'
import { googleLoginSchema } from '../validators/auth.schema.js'

const router = Router()

router.post('/google', authLimiter, validate(googleLoginSchema), auth.googleLogin)
router.get('/me', requireAuth, auth.me)
router.post('/logout', auth.logout)

export default router
