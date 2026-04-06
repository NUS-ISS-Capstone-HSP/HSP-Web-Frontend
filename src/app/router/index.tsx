import { useRoutes } from 'react-router-dom'
import { routes } from '@/app/router/routes'

export function AppRouter() {
  return useRoutes(routes)
}
