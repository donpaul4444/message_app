import axios from 'axios'
import type { ApiErrorBody } from '@/types/api'

export const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api/v1`,
  withCredentials: true,
})

export function getErrorMessage(err: unknown, fallback = 'Something went wrong'): string {
  if (axios.isAxiosError<ApiErrorBody>(err)) {
    if (err.response?.data?.error?.message) return err.response.data.error.message
    if (!err.response) return 'Cannot reach the server. Is the backend running?'
  }
  return fallback
}
