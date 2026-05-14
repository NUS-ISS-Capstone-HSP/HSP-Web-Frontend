import type { RouteObject } from 'react-router-dom'
import { Navigate } from 'react-router-dom'
import { RouteShell } from '@/app/router/RouteShell'
import { AppLayout } from '@/layouts/AppLayout'
import { BillingPage } from '@/pages/billing'
import { DashboardPage } from '@/pages/dashboard'
import { DispatchPage } from '@/pages/dispatch'
import { LoginPage } from '@/pages/login'
import { NotFoundPage } from '@/pages/not-found'
import { OrdersPage } from '@/pages/orders'
import { ServiceRecordsPage } from '@/pages/service-records'
import { SupportPage } from '@/pages/support'
import { WorkersPage } from '@/pages/workers'

export const routes: RouteObject[] = [
  {
    path: '/login',
    element: (
      <RouteShell meta={{ titleKey: 'route.login' }}>
        <LoginPage />
      </RouteShell>
    ),
  },
  {
    path: '/',
    element: (
      <RouteShell meta={{ titleKey: 'route.console', requiresAuth: true }}>
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
          <RouteShell meta={{ titleKey: 'route.dashboard', requiresAuth: true }}>
            <DashboardPage />
          </RouteShell>
        ),
      },
      {
        path: 'orders',
        element: (
          <RouteShell meta={{ titleKey: 'route.orders', requiresAuth: true }}>
            <OrdersPage />
          </RouteShell>
        ),
      },
      {
        path: 'workers',
        element: (
          <RouteShell meta={{ titleKey: 'route.workers', requiresAuth: true }}>
            <WorkersPage />
          </RouteShell>
        ),
      },
      {
        path: 'dispatch',
        element: (
          <RouteShell meta={{ titleKey: 'route.dispatch', requiresAuth: true }}>
            <DispatchPage />
          </RouteShell>
        ),
      },
      {
        path: 'service-records',
        element: (
          <RouteShell meta={{ titleKey: 'route.serviceRecords', requiresAuth: true }}>
            <ServiceRecordsPage />
          </RouteShell>
        ),
      },
      {
        path: 'billing',
        element: (
          <RouteShell meta={{ titleKey: 'route.billing', requiresAuth: true }}>
            <BillingPage />
          </RouteShell>
        ),
      },
      {
        path: 'support',
        element: (
          <RouteShell meta={{ titleKey: 'route.support', requiresAuth: true }}>
            <SupportPage />
          </RouteShell>
        ),
      },
    ],
  },
  {
    path: '*',
    element: (
      <RouteShell meta={{ titleKey: 'route.notFound' }}>
        <NotFoundPage />
      </RouteShell>
    ),
  },
]
