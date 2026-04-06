import { App as AntdApp, ConfigProvider, type ThemeConfig } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'
import { BrowserRouter } from 'react-router-dom'
import { AppRouter } from '@/app/router'

dayjs.locale('zh-cn')

const themeConfig: ThemeConfig = {
  token: {
    colorPrimary: '#1f7a8c',
    borderRadius: 10,
    fontSize: 14,
  },
}

function App() {
  return (
    <ConfigProvider locale={zhCN} theme={themeConfig}>
      <AntdApp>
        <BrowserRouter>
          <AppRouter />
        </BrowserRouter>
      </AntdApp>
    </ConfigProvider>
  )
}

export default App
