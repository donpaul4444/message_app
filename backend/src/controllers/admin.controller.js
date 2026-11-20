import * as adminService from '../services/admin.service.js'

export async function listUsers(req, res) {
  const users = await adminService.listUsers(req.validated.query)
  res.json({ users })
}

export async function setStatus(req, res) {
  const { params, body } = req.validated
  const user = await adminService.setUserStatus(req.user, params.userId, body.status)
  res.json({ user })
}
