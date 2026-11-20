// Shape of every error response from the backend.
export interface ApiErrorBody {
  error: {
    code: string
    message: string
  }
}
