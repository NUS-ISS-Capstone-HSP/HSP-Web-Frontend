export interface UserProfile {
  id?: string
  name: string
  role?: string
}

export interface AuthState {
  token: string | null
  user: UserProfile | null
  setToken: (token: string, user?: UserProfile | null) => void
  logout: () => void
}
