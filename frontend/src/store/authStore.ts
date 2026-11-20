import { create } from 'zustand'
import { isAxiosError } from 'axios'
import * as authApi from '@/api/auth.api'
import { getErrorMessage } from '@/api/axios'
import type { ApiErrorBody } from '@/types/api'
import type { User } from '@/types/user'

type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated'

interface AuthState {
  user: User | null
  status: AuthStatus
  sessionError: string | null // e.g. "blocked by an admin", shown on the login page
  checkSession: () => Promise<void>
  loginWithGoogle: (credential: string) => Promise<void>
  logout: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  status: 'loading',
  sessionError: null,

  // Called on app start (and polled while waiting for approval): the httpOnly cookie
  // is sent automatically, so /auth/me tells us whether the user is still signed in.
  checkSession: async () => {
    try {
      const user = await authApi.getMe()
      set({ user, status: 'authenticated', sessionError: null })
    } catch (err) {
      const blocked = isAxiosError<ApiErrorBody>(err) && err.response?.data?.error?.code === 'ACCOUNT_BLOCKED'
      set({ user: null, status: 'unauthenticated', sessionError: blocked ? getErrorMessage(err) : null })
    }
  },

  loginWithGoogle: async (credential) => {
    const user = await authApi.googleLogin(credential)
    set({ user, status: 'authenticated', sessionError: null })
  },

  logout: async () => {
    try {
      await authApi.logout()
    } finally {
      set({ user: null, status: 'unauthenticated' })
    }
  },
}))
