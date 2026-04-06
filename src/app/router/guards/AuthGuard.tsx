import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/store/auth'

interface AuthGuardProps {
  children: ReactNode
  requiresAuth?: boolean
}

export function AuthGuard({ children, requiresAuth = false }: AuthGuardProps) {
  const token = useAuthStore((state) => state.token)
  const location = useLocation()

  if (!requiresAuth || token) {
    return children
  }

  return (
    <Navigate
      to="/login"
      replace
      state={{ from: `${location.pathname}${location.search}` }}
    />
  )
}
