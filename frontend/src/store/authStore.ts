import { create } from 'zustand'
import * as authApi from '@/api/auth.api'
import type { User } from '@/types/user'

type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated'

interface AuthState {
  user: User | null
  status: AuthStatus
  checkSession: () => Promise<void>
  loginWithGoogle: (credential: string) => Promise<void>
  logout: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  status: 'loading',

  // Called once on app start: the httpOnly cookie is sent automatically,
  // so /auth/me tells us whether the user is still signed in.
  checkSession: async () => {
    try {
      const user = await authApi.getMe()
      set({ user, status: 'authenticated' })
    } catch {
      set({ user: null, status: 'unauthenticated' })
    }
  },

  loginWithGoogle: async (credential) => {
    const user = await authApi.googleLogin(credential)
    set({ user, status: 'authenticated' })
  },

  logout: async () => {
    try {
      await authApi.logout()
    } finally {
      set({ user: null, status: 'unauthenticated' })
    }
  },
}))
