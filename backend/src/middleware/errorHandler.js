import mongoose from 'mongoose'
import { z } from 'zod'
import { env } from '../config/env.js'
import { AppError } from '../utils/AppError.js'

export function notFound(req, res, next) {
  next(AppError.notFound(`Route not found: ${req.method} ${req.originalUrl}`, 'ROUTE_NOT_FOUND'))
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  let status = 500
  let code = 'INTERNAL_ERROR'
  let message = 'Something went wrong'

  if (err instanceof AppError) {
    ;({ status, code, message } = err)
  } else if (err instanceof z.ZodError) {
    status = 400
    code = 'VALIDATION_ERROR'
    message = z.prettifyError(err)
  } else if (err instanceof mongoose.Error.CastError) {
    status = 400
    code = 'INVALID_ID'
    message = `Invalid ${err.path}`
  } else if (err.type === 'entity.parse.failed') {
    status = 400
    code = 'INVALID_JSON'
    message = 'Request body is not valid JSON'
  }

  if (status === 500) {
    console.error(err)
    if (!env.isProd) message = err.message
  }

  res.status(status).json({ error: { code, message } })
}
