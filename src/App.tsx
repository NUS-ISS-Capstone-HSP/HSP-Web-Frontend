import { App as AntdApp, ConfigProvider, type ThemeConfig } from 'antd'
import dayjs from 'dayjs'
import 'dayjs/locale/en'
import 'dayjs/locale/zh-cn'
import { useEffect } from 'react'
import { BrowserRouter } from 'react-router-dom'
import { AppRouter } from '@/app/router'
import { LocaleProvider, useLocale } from '@/i18n'
import { getAntdLocale, getDayjsLocale } from '@/i18n/messages'

const themeConfig: ThemeConfig = {
  token: {
    colorPrimary: '#1f7a8c',
    borderRadius: 10,
    fontSize: 14,
  },
}

function AppShell() {
  const { locale } = useLocale()

  useEffect(() => {
    dayjs.locale(getDayjsLocale(locale))
  }, [locale])

  return (
    <ConfigProvider locale={getAntdLocale(locale)} theme={themeConfig}>
      <AntdApp>
        <BrowserRouter>
          <AppRouter />
        </BrowserRouter>
      </AntdApp>
    </ConfigProvider>
  )
}

function App() {
  return (
    <LocaleProvider>
      <AppShell />
    </LocaleProvider>
  )
}

export default App
