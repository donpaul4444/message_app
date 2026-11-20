import { blockedError, getUserById, pendingError } from '../services/auth.service.js'
import { AppError } from '../utils/AppError.js'
import { AUTH_COOKIE, clearAuthCookie, verifyToken } from '../utils/jwt.js'

// Reads the JWT cookie and returns the user. 401 if not signed in, 403 if blocked.
async function loadSessionUser(req, res) {
  const payload = verifyToken(req.cookies[AUTH_COOKIE])
  if (!payload) throw AppError.unauthorized()

  const user = await getUserById(payload.sub)
  if (!user) throw AppError.unauthorized('User no longer exists')
  if (user.status === 'blocked') {
    clearAuthCookie(res)
    throw blockedError()
  }
  return user
}

// Any signed-in, non-blocked user, including ones still waiting for approval.
// Only for routes a pending user needs (e.g. GET /auth/me to see their status).
export async function requireSession(req, res, next) {
  req.user = await loadSessionUser(req, res)
  next()
}

// Default for app routes: signed in AND approved by an admin.
export async function requireAuth(req, res, next) {
  const user = await loadSessionUser(req, res)
  if (user.status !== 'approved') throw pendingError()
  req.user = user
  next()
}

// Use after requireAuth on admin-only routes.
export function requireAdmin(req, res, next) {
  if (req.user?.role !== 'admin') throw AppError.forbidden('Admin access required', 'ADMIN_ONLY')
  next()
}
