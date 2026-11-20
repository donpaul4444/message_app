// Throw from services/controllers; errorHandler turns it into
// { error: { code, message } } with the given HTTP status.
export class AppError extends Error {
  constructor(status, code, message) {
    super(message)
    this.status = status
    this.code = code
  }

  static badRequest(message = 'Bad request', code = 'BAD_REQUEST') {
    return new AppError(400, code, message)
  }

  static unauthorized(message = 'Not authenticated', code = 'UNAUTHORIZED') {
    return new AppError(401, code, message)
  }

  static forbidden(message = 'Not allowed', code = 'FORBIDDEN') {
    return new AppError(403, code, message)
  }

  static notFound(message = 'Not found', code = 'NOT_FOUND') {
    return new AppError(404, code, message)
  }
}
