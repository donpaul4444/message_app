import { Router } from 'express'
import * as auth from '../controllers/auth.controller.js'
import { requireSession } from '../middleware/auth.js'
import { authLimiter } from '../middleware/rateLimit.js'
import { validate } from '../middleware/validate.js'
import { googleLoginSchema } from '../validators/auth.schema.js'

const router = Router()

router.post('/google', authLimiter, validate(googleLoginSchema), auth.googleLogin)
// requireSession (not requireAuth) so pending users can check their approval status.
router.get('/me', requireSession, auth.me)
router.post('/logout', auth.logout)

export default router
