import http from 'node:http'
import app from './app.js'
import { connectDB, disconnectDB } from './config/db.js'
import { env } from './config/env.js'

const server = http.createServer(app)
// Socket.IO will be attached to `server` here (see src/socket/).

async function start() {
  try {
    await connectDB()
  } catch (err) {
    console.error('Failed to connect to MongoDB:', err.message)
    process.exit(1)
  }

  server.listen(env.PORT, () => {
    console.log(`Server running on http://localhost:${env.PORT} (${env.NODE_ENV})`)
  })
}

async function shutdown(signal) {
  console.log(`${signal} received, shutting down...`)
  server.close(async () => {
    await disconnectDB()
    process.exit(0)
  })
  setTimeout(() => process.exit(1), 10_000).unref()
}

process.on('SIGINT', () => shutdown('SIGINT'))
process.on('SIGTERM', () => shutdown('SIGTERM'))

start()
