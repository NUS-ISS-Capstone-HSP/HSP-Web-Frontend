import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import type { AuthState } from '@/types/auth'

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      setToken: (token, user) =>
        set((state) => ({
          token,
          user: user ?? state.user,
        })),
      logout: () =>
        set({
          token: null,
          user: null,
        }),
    }),
    {
      name: 'hsp-auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        token: state.token,
        user: state.user,
      }),
    },
  ),
)
