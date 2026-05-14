import { createContext } from 'react'
import type { AppLocale } from '@/i18n/messages'

export interface LocaleContextValue {
  locale: AppLocale
  setLocale: (locale: AppLocale) => void
  t: (key: string, vars?: Record<string, string | number>) => string
  td: (value?: string | null) => string
}

export const LocaleContext = createContext<LocaleContextValue | null>(null)
