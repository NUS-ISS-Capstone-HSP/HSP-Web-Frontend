import { http } from '@/services/http'

export interface LoginPayload {
  email: string
  password: string
}

export interface AuthUser {
  id: number
  email: string
  role: string
  status: string
  created_at: string
  updated_at: string
  last_login_at: string | null
  worker_profile: unknown
}

export interface LoginResponse {
  access_token: string
  token_type: string
  expires_in: number
  user: AuthUser
}

export async function login(payload: LoginPayload) {
  const response = await http.post<LoginResponse>('/users/v1/auth/login', payload, {
    headers: {
      'Content-Type': 'application/json',
    },
  })

  return response.data
}
