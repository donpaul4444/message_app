import * as conversationService from '../services/conversation.service.js'
import * as messageService from '../services/message.service.js'
import * as userService from '../services/user.service.js'

export async function searchUsers(req, res) {
  const users = await userService.searchUsers(req.user.id, req.validated.query.q)
  res.json({ users })
}

export async function listConversations(req, res) {
  res.json({ conversations: await conversationService.listConversations(req.user.id) })
}

export async function createDirect(req, res) {
  const conversation = await conversationService.getOrCreateDirect(req.user.id, req.validated.body.userId)
  res.json({ conversation })
}

export async function getConversation(req, res) {
  res.json({ conversation: await conversationService.getConversation(req.user.id, req.validated.params.id) })
}

export async function listMessages(req, res) {
  const { params, query } = req.validated
  res.json(await messageService.listMessages(req.user.id, params.id, query))
}

export async function markRead(req, res) {
  res.json(await conversationService.markRead(req.user.id, req.validated.params.id))
}
