import type { RouteObject } from 'react-router-dom'
import { Navigate } from 'react-router-dom'
import { RouteShell } from '@/app/router/RouteShell'
import { AppLayout } from '@/layouts/AppLayout'
import { DashboardPage } from '@/pages/dashboard'
import { LoginPage } from '@/pages/login'
import { NotFoundPage } from '@/pages/not-found'

export const routes: RouteObject[] = [
  {
    path: '/login',
    element: (
      <RouteShell meta={{ title: '登录' }}>
        <LoginPage />
      </RouteShell>
    ),
  },
  {
    path: '/',
    element: (
      <RouteShell meta={{ title: '控制台', requiresAuth: true }}>
        <AppLayout />
      </RouteShell>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard" replace />,
      },
      {
        path: 'dashboard',
        element: (
          <RouteShell meta={{ title: '仪表盘', requiresAuth: true }}>
            <DashboardPage />
          </RouteShell>
        ),
      },
    ],
  },
  {
    path: '*',
    element: (
      <RouteShell meta={{ title: '页面不存在' }}>
        <NotFoundPage />
      </RouteShell>
    ),
  },
]
