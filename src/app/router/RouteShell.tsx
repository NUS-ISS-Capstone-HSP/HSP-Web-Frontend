import { useEffect, type ReactNode } from 'react'
import { AuthGuard } from '@/app/router/guards/AuthGuard'
import { useLocale } from '@/i18n'
import type { RouteMeta } from '@/types/router'

interface RouteShellProps {
  children: ReactNode
  meta?: RouteMeta
}

export function RouteShell({ children, meta }: RouteShellProps) {
  const { t } = useLocale()

  useEffect(() => {
    const appTitle = t('app.title')
    document.title = meta?.titleKey ? `${t(meta.titleKey)} | ${appTitle}` : appTitle
  }, [meta?.titleKey, t])

  return <AuthGuard requiresAuth={meta?.requiresAuth}>{children}</AuthGuard>
}
