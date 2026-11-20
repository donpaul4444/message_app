import { User } from '../models/User.js'

const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

// Approved users matching name/email, excluding me. Pending/blocked users never show up.
export async function searchUsers(meId, q) {
  const pattern = new RegExp(escapeRegex(q), 'i')
  return User.find({
    _id: { $ne: meId },
    status: 'approved',
    $or: [{ name: pattern }, { email: pattern }],
  })
    .select('name email avatar')
    .sort({ name: 1 })
    .limit(20)
}
