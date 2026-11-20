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
// Emails listed in ADMIN_EMAILS are promoted to admin; nobody is demoted here,
// so an admin role granted some other way later isn't overwritten on login.
export async function loginWithGoogle(credential) {
  const payload = await verifyGoogleCredential(credential)

  if (!payload?.email_verified) {
    throw AppError.unauthorized('Google account email is not verified', 'EMAIL_NOT_VERIFIED')
  }

  const isAdminEmail = env.ADMIN_EMAILS.includes(payload.email.toLowerCase())

  return User.findOneAndUpdate(
    { googleId: payload.sub },
    {
      $set: {
        email: payload.email,
        name: payload.name || payload.email.split('@')[0],
        avatar: payload.picture || '',
        lastSeen: new Date(),
        ...(isAdminEmail && { role: 'admin' }),
      },
    },
    { upsert: true, returnDocument: 'after', runValidators: true },
  )
}

export async function getUserById(userId) {
  return User.findById(userId)
}
