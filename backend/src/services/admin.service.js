import { User } from '../models/User.js'
import { disconnectUser } from '../socket/index.js'
import { AppError } from '../utils/AppError.js'

const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

// All users, newest first, optionally filtered by name/email.
export async function listUsers({ q }) {
  const filter = q
    ? { $or: [{ name: new RegExp(escapeRegex(q), 'i') }, { email: new RegExp(escapeRegex(q), 'i') }] }
    : {}
  return User.find(filter).sort({ createdAt: -1 }).limit(500)
}

// Approve a request / unblock ("approved"), or reject a request / block ("blocked").
// Admins can't change their own status or another admin's.
export async function setUserStatus(actor, userId, status) {
  if (actor.id === userId) throw AppError.badRequest('You cannot change your own status', 'CANNOT_CHANGE_SELF')

  const user = await User.findById(userId)
  if (!user) throw AppError.notFound('User not found', 'USER_NOT_FOUND')
  if (user.role === 'admin') throw AppError.forbidden('Admin accounts cannot be changed', 'CANNOT_CHANGE_ADMIN')

  user.status = status
  await user.save()
  if (status !== 'approved') disconnectUser(user.id) // cut off live chat immediately
  return user
}
