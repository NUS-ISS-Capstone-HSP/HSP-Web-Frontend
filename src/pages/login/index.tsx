import { LockOutlined, UserOutlined } from '@ant-design/icons'
import { Button, Card, Form, Input, Segmented, Space, Typography } from 'antd'
import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useLocale } from '@/i18n'
import { login } from '@/services/auth'
import { useAuthStore } from '@/store/auth'

interface LoginFormValues {
  email: string
  password: string
}

const DEMO_PASSWORD = '123456'

const DEMO_ACCOUNTS: Record<string, { role: string; name: string }> = {
  'demo@hsp.local': { role: 'CSR', name: '客服-演示账号' },
  'boss@hsp.local': { role: 'BOSS', name: '老板-演示账号' },
}

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { locale, setLocale, t } = useLocale()
  const token = useAuthStore((state) => state.token)
  const setToken = useAuthStore((state) => state.setToken)
  const [submitting, setSubmitting] = useState(false)

  const redirectTo = useMemo(() => {
    const state = location.state as { from?: string } | null
    return state?.from ?? '/dashboard'
  }, [location.state])

  useEffect(() => {
    if (token) {
      navigate('/dashboard', { replace: true })
    }
  }, [navigate, token])

  const onFinish = async (values: LoginFormValues) => {
    const email = values.email.trim().toLowerCase()
    const demoAccount = DEMO_ACCOUNTS[email]

    if (demoAccount && values.password === DEMO_PASSWORD) {
      setToken(`demo-token-${Date.now()}`, {
        id: email,
        name: demoAccount.name,
        email,
        role: demoAccount.role,
        status: 'ACTIVE',
      })
      navigate(redirectTo, { replace: true })
      return
    }

    setSubmitting(true)

    try {
      const response = await login({
        email: values.email.trim(),
        password: values.password,
      })

      setToken(response.access_token, {
        id: response.user.id,
        name: response.user.email,
        email: response.user.email,
        role: response.user.role,
        status: response.user.status,
      })
      navigate(redirectTo, { replace: true })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        padding: 16,
        background:
          'radial-gradient(circle at top left, rgba(31,122,140,0.18), transparent 34%), linear-gradient(180deg, #f5f7fb 0%, #eef4fb 100%)',
      }}
    >
      <Card
        style={{
          width: '100%',
          maxWidth: 460,
          borderRadius: 24,
          boxShadow: '0 24px 80px rgba(15, 23, 42, 0.12)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
          <Segmented
            value={locale}
            onChange={(value) => setLocale(value as 'zh-CN' | 'en-US')}
            options={[
              { label: t('layout.locale.zh'), value: 'zh-CN' },
              { label: t('layout.locale.en'), value: 'en-US' },
            ]}
          />
        </div>
        <Space direction="vertical" size={4} style={{ marginBottom: 24 }}>
          <Typography.Title level={3} style={{ margin: 0 }}>
            {t('login.title')}
          </Typography.Title>
        </Space>

        <Form<LoginFormValues>
          layout="vertical"
          initialValues={{
            email: 'demo@hsp.local',
            password: '123456',
          }}
          onFinish={onFinish}
        >
          <Form.Item
            name="email"
            label={t('login.email')}
            rules={[
              { required: true, message: t('login.emailRequired') },
              { type: 'email', message: t('login.emailInvalid') },
            ]}
          >
            <Input prefix={<UserOutlined />} placeholder="owner@example.com" />
          </Form.Item>
          <Form.Item
            name="password"
            label={t('login.password')}
            rules={[{ required: true, message: t('login.passwordRequired') }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder={t('login.passwordPlaceholder')}
            />
          </Form.Item>
          <Form.Item style={{ marginBottom: 0 }}>
            <Button type="primary" htmlType="submit" block loading={submitting}>
              {t('login.login')}
            </Button>
          </Form.Item>
        </Form>
        <Typography.Text
          type="secondary"
          style={{ display: 'block', marginTop: 16, fontSize: 12, textAlign: 'center' }}
        >
          {t('login.demoHint')}
        </Typography.Text>
      </Card>
    </div>
  )
}
