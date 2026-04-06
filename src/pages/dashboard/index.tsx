import { ApiOutlined, DeploymentUnitOutlined, TeamOutlined } from '@ant-design/icons'
import { Card, Col, Row, Statistic, Typography } from 'antd'

export function DashboardPage() {
  return (
    <div>
      <Typography.Title level={3} style={{ marginTop: 0 }}>
        Dashboard
      </Typography.Title>
      <Typography.Paragraph type="secondary">
        这是一个可直接扩展的后台前端模板，已包含路由守卫、请求封装、状态管理和 Ant Design 全局主题。
      </Typography.Paragraph>

      <Row gutter={[16, 16]}>
        <Col xs={24} md={8}>
          <Card>
            <Statistic title="在线服务" value={12} prefix={<DeploymentUnitOutlined />} />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card>
            <Statistic title="API 数量" value={38} prefix={<ApiOutlined />} />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card>
            <Statistic title="团队成员" value={9} prefix={<TeamOutlined />} />
          </Card>
        </Col>
      </Row>
    </div>
  )
}
