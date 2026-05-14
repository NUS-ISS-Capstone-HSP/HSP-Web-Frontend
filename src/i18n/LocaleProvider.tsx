import { useMemo, useState, type ReactNode } from 'react'
import { LocaleContext } from '@/i18n/context'
import {
  getStoredLocale,
  setStoredLocale,
  translateDataText,
  translateMessage,
  type AppLocale,
} from '@/i18n/messages'

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<AppLocale>(() => getStoredLocale())

  const setLocale = (nextLocale: AppLocale) => {
    setLocaleState(nextLocale)
    setStoredLocale(nextLocale)
  }

  const value = useMemo(
    () => ({
      locale,
      setLocale,
      t: (key: string, vars?: Record<string, string | number>) =>
        translateMessage(locale, key, vars),
      td: (value?: string | null) => translateDataText(locale, value),
    }),
    [locale],
  )

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
}
