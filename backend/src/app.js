import cookieParser from 'cookie-parser'
import cors from 'cors'
import express from 'express'
import helmet from 'helmet'
import morgan from 'morgan'
import { env } from './config/env.js'
import { errorHandler, notFound } from './middleware/errorHandler.js'
import { apiLimiter } from './middleware/rateLimit.js'
import routes from './routes/index.js'

const app = express()

app.set('trust proxy', 1)
if (!env.isProd) app.use(morgan('dev'))
app.use(helmet())
app.use(cors({ origin: env.CLIENT_URL, credentials: true }))
app.use(express.json({ limit: '100kb' }))
app.use(cookieParser())

app.use('/api/v1', apiLimiter, routes)

app.use(notFound)
app.use(errorHandler)

export default app
