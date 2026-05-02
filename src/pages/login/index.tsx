import { LockOutlined, UserOutlined } from '@ant-design/icons'
import { Button, Card, Form, Input, Space, Typography } from 'antd'
import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { login } from '@/services/auth'
import { useAuthStore } from '@/store/auth'

interface LoginFormValues {
  email: string
  password: string
}

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
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
      }}
    >
      <Card style={{ width: '100%', maxWidth: 420 }}>
        <Space direction="vertical" size={4} style={{ marginBottom: 24 }}>
          <Typography.Title level={3} style={{ margin: 0 }}>
            登录 HSP
          </Typography.Title>
          <Typography.Text type="secondary">
            请输入邮箱和密码
          </Typography.Text>
        </Space>

        <Form<LoginFormValues> layout="vertical" onFinish={onFinish}>
          <Form.Item
            name="email"
            label="邮箱"
            rules={[
              { required: true, message: '请输入邮箱' },
              { type: 'email', message: '邮箱格式不正确' },
            ]}
          >
            <Input prefix={<UserOutlined />} placeholder="owner@example.com" />
          </Form.Item>
          <Form.Item
            name="password"
            label="密码"
            rules={[{ required: true, message: '请输入密码' }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="请输入密码" />
          </Form.Item>
          <Form.Item style={{ marginBottom: 0 }}>
            <Button type="primary" htmlType="submit" block loading={submitting}>
              登录
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  )
}
