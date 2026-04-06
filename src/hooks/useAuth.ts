import { useAuthStore } from '@/store/auth'

export function useIsAuthenticated() {
  return useAuthStore((state) => Boolean(state.token))
}

export function useCurrentUser() {
  return useAuthStore((state) => state.user)
}
