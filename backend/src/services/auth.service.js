import { env } from '../config/env.js'
import { googleClient } from '../config/google.js'
import { User } from '../models/User.js'
import { AppError } from '../utils/AppError.js'

async function verifyGoogleCredential(credential) {
  try {
    const ticket = await googleClient.verifyIdToken({ idToken: credential, audience: env.GOOGLE_CLIENT_ID })
    return ticket.getPayload()
  } catch {
    throw AppError.unauthorized('Invalid Google credential', 'INVALID_GOOGLE_TOKEN')
  }
}

// Verifies the Google ID token, then finds or creates the user by googleId.
// Profile fields are refreshed on every login so name/avatar changes in Google carry over.
// New users start as "pending" (schema default) until an admin approves them.
// Emails listed in ADMIN_EMAILS are promoted to an approved admin; nobody is demoted here,
// so an admin role granted some other way later isn't overwritten on login.
export async function loginWithGoogle(credential) {
  const payload = await verifyGoogleCredential(credential)

  if (!payload?.email_verified) {
    throw AppError.unauthorized('Google account email is not verified', 'EMAIL_NOT_VERIFIED')
  }

  const isAdminEmail = env.ADMIN_EMAILS.includes(payload.email.toLowerCase())

  const existing = await User.findOne({ googleId: payload.sub }).select('status')
  if (existing?.status === 'blocked' && !isAdminEmail) throw blockedError()

  return User.findOneAndUpdate(
    { googleId: payload.sub },
    {
      $set: {
        email: payload.email,
        name: payload.name || payload.email.split('@')[0],
        avatar: payload.picture || '',
        lastSeen: new Date(),
        ...(isAdminEmail && { role: 'admin', status: 'approved' }),
      },
    },
    { upsert: true, returnDocument: 'after', runValidators: true },
  )
}

export function blockedError() {
  return AppError.forbidden('Your account has been blocked by an admin', 'ACCOUNT_BLOCKED')
}

export function pendingError() {
  return AppError.forbidden('Your account is waiting for admin approval', 'APPROVAL_PENDING')
}

export async function getUserById(userId) {
  return User.findById(userId)
}
