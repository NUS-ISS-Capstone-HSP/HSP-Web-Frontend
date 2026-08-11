import {
  CreditCardOutlined,
  DashboardOutlined,
  FileDoneOutlined,
  LogoutOutlined,
  OrderedListOutlined,
  PhoneOutlined,
  SendOutlined,
  TeamOutlined,
  UserOutlined,
} from '@ant-design/icons'
import { Avatar, Button, Dropdown, Layout, Menu, Segmented, Space, Typography } from 'antd'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useLocale } from '@/i18n'
import { useAuthStore } from '@/store/auth'
import { hasWorkerManagementAccess } from '@/utils'

const { Header, Sider, Content } = Layout

const menuItems = [
  {
    key: '/dashboard',
    icon: <DashboardOutlined />,
    labelKey: 'layout.menu.dashboard',
  },
  {
    key: '/orders',
    icon: <OrderedListOutlined />,
    labelKey: 'layout.menu.orders',
  },
  {
    key: '/workers',
    icon: <TeamOutlined />,
    labelKey: 'layout.menu.workers',
  },
  {
    key: '/dispatch',
    icon: <SendOutlined />,
    labelKey: 'layout.menu.dispatch',
  },
  {
    key: '/service-records',
    icon: <FileDoneOutlined />,
    labelKey: 'layout.menu.serviceRecords',
  },
  {
    key: '/billing',
    icon: <CreditCardOutlined />,
    labelKey: 'layout.menu.billing',
  },
  {
    key: '/support',
    icon: <PhoneOutlined />,
    labelKey: 'layout.menu.support',
  },
]

export function AppLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const { locale, setLocale, t, td } = useLocale()
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)
  const canManageWorkers = hasWorkerManagementAccess(user)
  const visibleMenuItems = menuItems.filter((item) => canManageWorkers || item.key !== '/workers')

  const selectedKey =
    visibleMenuItems.find((item) => location.pathname.startsWith(item.key))?.key ?? ''
  const currentTitle =
    t(visibleMenuItems.find((item) => item.key === selectedKey)?.labelKey ?? 'layout.defaultTitle')

  return (
    <Layout style={{ minHeight: '100vh', background: 'transparent' }}>
      <Sider
        width={248}
        theme="dark"
        breakpoint="lg"
        collapsedWidth={72}
        style={{
          background: 'linear-gradient(180deg, #102a43 0%, #0f172a 100%)',
          boxShadow: '12px 0 32px rgba(15, 23, 42, 0.18)',
        }}
      >
        <div
          style={{
            height: 72,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-start',
            color: '#fff',
            fontWeight: 700,
            letterSpacing: 0.4,
            padding: '0 20px',
            fontSize: 18,
          }}
        >
          {t('layout.brand')}
        </div>
        <Menu
          mode="inline"
          theme="dark"
          selectedKeys={[selectedKey]}
          items={visibleMenuItems.map((item) => ({
            key: item.key,
            icon: item.icon,
            label: t(item.labelKey),
          }))}
          onClick={({ key }) => navigate(key)}
          style={{
            background: 'transparent',
            borderInlineEnd: 'none',
            paddingInline: 12,
          }}
        />
      </Sider>
      <Layout style={{ background: 'transparent' }}>
        <Header
          style={{
            background: 'rgba(255, 255, 255, 0.72)',
            backdropFilter: 'blur(16px)',
            padding: '0 24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '1px solid rgba(148, 163, 184, 0.18)',
            position: 'sticky',
            top: 0,
            zIndex: 10,
          }}
        >
          <Space direction="vertical" size={0}>
            <Typography.Title level={5} style={{ margin: 0 }}>
              {currentTitle}
            </Typography.Title>
          </Space>
          <Space size={12}>
            <Segmented
              value={locale}
              onChange={(value) => setLocale(value as 'zh-CN' | 'en-US')}
              options={[
                { label: t('layout.locale.zh'), value: 'zh-CN' },
                { label: t('layout.locale.en'), value: 'en-US' },
              ]}
            />
            <Dropdown
              menu={{
                items: [
                  {
                    key: 'logout',
                    icon: <LogoutOutlined />,
                    label: t('layout.logout'),
                    onClick: () => {
                      logout()
                      navigate('/login', { replace: true })
                    },
                  },
                ],
              }}
              trigger={['click']}
            >
              <Button type="text">
                <Space>
                  <Avatar size="small" icon={<UserOutlined />} />
                  {user?.name ? td(user.name) : t('layout.unnamedUser')}
                </Space>
              </Button>
            </Dropdown>
          </Space>
        </Header>
        <Content style={{ padding: 24 }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  )
}
