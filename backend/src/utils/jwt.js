import jwt from 'jsonwebtoken'
import { env } from '../config/env.js'

export const AUTH_COOKIE = 'token'

export function signToken(userId) {
  return jwt.sign({ sub: userId }, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN })
}

// Returns the payload, or null if the token is missing, invalid or expired.
export function verifyToken(token) {
  if (!token) return null
  try {
    return jwt.verify(token, env.JWT_SECRET)
  } catch {
    return null
  }
}

// sameSite 'lax' works because localhost:5173 and localhost:5000 are the same site.
// If frontend and backend end up on different domains, this needs sameSite 'none' + secure.
const baseCookieOptions = {
  httpOnly: true,
  secure: env.isProd,
  sameSite: 'lax',
  path: '/',
}

export function setAuthCookie(res, token) {
  const { exp } = jwt.decode(token)
  res.cookie(AUTH_COOKIE, token, { ...baseCookieOptions, maxAge: exp * 1000 - Date.now() })
}

export function clearAuthCookie(res) {
  res.clearCookie(AUTH_COOKIE, baseCookieOptions)
}
