import * as authService from '../services/auth.service.js'
import { clearAuthCookie, setAuthCookie, signToken } from '../utils/jwt.js'

export async function googleLogin(req, res) {
  const user = await authService.loginWithGoogle(req.validated.body.credential)
  setAuthCookie(res, signToken(user.id))
  res.json({ user })
}

export async function me(req, res) {
  res.json({ user: req.user })
}

export async function logout(req, res) {
  clearAuthCookie(res)
  res.json({ success: true })
}
