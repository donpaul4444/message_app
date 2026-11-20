import { Router } from 'express'
import mongoose from 'mongoose'
import adminRoutes from './admin.routes.js'
import authRoutes from './auth.routes.js'
import conversationsRoutes from './conversations.routes.js'
import usersRoutes from './users.routes.js'

const router = Router()

router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    uptime: Math.round(process.uptime()),
  })
})

router.use('/auth', authRoutes)
router.use('/admin', adminRoutes)
router.use('/users', usersRoutes)
router.use('/conversations', conversationsRoutes)

export default router
