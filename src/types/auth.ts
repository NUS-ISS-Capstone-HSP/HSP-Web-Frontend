export interface UserProfile {
  id?: string | number
  name: string
  email?: string
  role?: string
  status?: string
}

export interface AuthState {
  token: string | null
  user: UserProfile | null
  setToken: (token: string, user?: UserProfile | null) => void
  logout: () => void
}
