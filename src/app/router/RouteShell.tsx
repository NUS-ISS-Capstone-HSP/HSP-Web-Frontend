import { useEffect, type ReactNode } from 'react'
import { AuthGuard } from '@/app/router/guards/AuthGuard'
import type { RouteMeta } from '@/types/router'

const APP_TITLE = 'HSP 管理后台'

interface RouteShellProps {
  children: ReactNode
  meta?: RouteMeta
}

export function RouteShell({ children, meta }: RouteShellProps) {
  useEffect(() => {
    document.title = meta?.title ? `${meta.title} | ${APP_TITLE}` : APP_TITLE
  }, [meta?.title])

  return <AuthGuard requiresAuth={meta?.requiresAuth}>{children}</AuthGuard>
}
