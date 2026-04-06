import { LockOutlined, UserOutlined } from '@ant-design/icons'
import { Button, Card, Form, Input, Space, Typography } from 'antd'
import { useEffect, useMemo } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/auth'

interface LoginFormValues {
  username: string
  password: string
}

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const token = useAuthStore((state) => state.token)
  const setToken = useAuthStore((state) => state.setToken)

  const redirectTo = useMemo(() => {
    const state = location.state as { from?: string } | null
    return state?.from ?? '/dashboard'
  }, [location.state])

  useEffect(() => {
    if (token) {
      navigate('/dashboard', { replace: true })
    }
  }, [navigate, token])

  const onFinish = (values: LoginFormValues) => {
    setToken('demo-token', {
      id: '1',
      name: values.username,
      role: 'admin',
    })
    navigate(redirectTo, { replace: true })
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
            请输入账号密码进入模板首页
          </Typography.Text>
        </Space>

        <Form<LoginFormValues> layout="vertical" onFinish={onFinish} initialValues={{ username: 'admin' }}>
          <Form.Item
            name="username"
            label="账号"
            rules={[{ required: true, message: '请输入账号' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="请输入账号" />
          </Form.Item>
          <Form.Item
            name="password"
            label="密码"
            rules={[{ required: true, message: '请输入密码' }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="请输入密码" />
          </Form.Item>
          <Form.Item style={{ marginBottom: 0 }}>
            <Button type="primary" htmlType="submit" block>
              登录
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  )
}
