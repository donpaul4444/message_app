import rateLimit from 'express-rate-limit'

const handler = (req, res) => {
  res.status(429).json({ error: { code: 'RATE_LIMITED', message: 'Too many requests, try again later' } })
}

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 1000,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  handler,
})

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  handler,
})
