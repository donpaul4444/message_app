import { User } from '../models/User.js'
import { AUTH_COOKIE, verifyToken } from '../utils/jwt.js'

function readCookie(header, name) {
  for (const part of (header ?? '').split(';')) {
    const [key, ...rest] = part.trim().split('=')
    if (key === name) return decodeURIComponent(rest.join('='))
  }
  return undefined
}

// Same cookie as REST. Only signed-in, approved users may open a socket.
export async function socketAuth(socket, next) {
  try {
    const payload = verifyToken(readCookie(socket.request.headers.cookie, AUTH_COOKIE))
    if (!payload) return next(new Error('UNAUTHORIZED'))

    const user = await User.findById(payload.sub).select('status')
    if (!user) return next(new Error('UNAUTHORIZED'))
    if (user.status !== 'approved') return next(new Error('NOT_APPROVED'))

    socket.data.userId = user.id
    next()
  } catch (err) {
    next(err)
  }
}
