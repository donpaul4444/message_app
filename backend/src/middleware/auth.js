import { getUserById } from '../services/auth.service.js'
import { AppError } from '../utils/AppError.js'
import { AUTH_COOKIE, verifyToken } from '../utils/jwt.js'

// Reads the JWT cookie and sets req.user, or responds 401.
export async function requireAuth(req, res, next) {
  const payload = verifyToken(req.cookies[AUTH_COOKIE])
  if (!payload) throw AppError.unauthorized()

  const user = await getUserById(payload.sub)
  if (!user) throw AppError.unauthorized('User no longer exists')

  req.user = user
  next()
}

// Use after requireAuth on admin-only routes.
export function requireAdmin(req, res, next) {
  if (req.user?.role !== 'admin') throw AppError.forbidden('Admin access required', 'ADMIN_ONLY')
  next()
}
