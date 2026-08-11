import {
  AlertOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  DollarOutlined,
  TeamOutlined,
} from '@ant-design/icons'
import {
  Button,
  Card,
  Col,
  Progress,
  Row,
  Space,
  Statistic,
  Tag,
  Typography,
} from 'antd'
import dayjs from 'dayjs'
import { useEffect, useState } from 'react'
import { useLocale } from '@/i18n'
import { getDashboardOverview, resetDemoDatabase } from '@/services/demo'
import type { DashboardOverview, DemoOrderStatus } from '@/types/operations'

function renderStatusTag(status: DemoOrderStatus, t: (key: string) => string) {
  const colorMap: Record<DemoOrderStatus, string> = {
    CREATED: 'default',
    PENDING: 'processing',
    ACCEPTED: 'blue',
    IN_SERVICE: 'cyan',
    DONE: 'purple',
    PAID: 'success',
    AFTER_SALE: 'error',
    COMPLETED: 'gold',
  }

  return <Tag color={colorMap[status]}>{t(`status.${status}`)}</Tag>
}

export function DashboardPage() {
  const { t, td } = useLocale()
  const [overview, setOverview] = useState<DashboardOverview | null>(null)
  const [loading, setLoading] = useState(false)

  const loadOverview = async () => {
    setLoading(true)

    try {
      setOverview(await getDashboardOverview())
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadOverview()
  }, [])

  if (!overview) {
    return (
      <Card loading bordered={false} style={{ borderRadius: 20, minHeight: 240 }} />
    )
  }

  return (
    <Space direction="vertical" size={16} style={{ width: '100%' }}>
      <Card bordered={false} style={{ borderRadius: 20 }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} lg={16}>
            <Space direction="vertical" size={6}>
              <Typography.Title level={3} style={{ margin: 0 }}>
                {t('dashboard.title')}
              </Typography.Title>
            </Space>
          </Col>
          <Col xs={24} lg={8}>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }} wrap>
              <Button loading={loading} onClick={() => void loadOverview()}>
                {t('dashboard.refresh')}
              </Button>
              <Button
                onClick={async () => {
                  await resetDemoDatabase()
                  await loadOverview()
                }}
              >
                {t('dashboard.reset')}
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      <Row gutter={[16, 16]}>
        <Col xs={24} md={8}>
          <Card bordered={false} style={{ borderRadius: 18 }}>
            <Statistic
              title={t('dashboard.totalOrders')}
              value={overview.totalOrders}
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card bordered={false} style={{ borderRadius: 18 }}>
            <Statistic
              title={t('dashboard.pendingDispatch')}
              value={overview.pendingDispatchCount}
              prefix={<AlertOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card bordered={false} style={{ borderRadius: 18 }}>
            <Statistic
              title={t('dashboard.availableWorkers')}
              value={overview.availableWorkerCount}
              prefix={<TeamOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} md={8}>
          <Card bordered={false} style={{ borderRadius: 18 }}>
            <Statistic
              title={t('dashboard.inService')}
              value={overview.inServiceCount}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card bordered={false} style={{ borderRadius: 18 }}>
            <Statistic
              title={t('dashboard.todayPaid')}
              value={overview.paidTodayAmount}
              prefix={<DollarOutlined />}
              suffix={t('common.currencyYuan')}
            />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card bordered={false} style={{ borderRadius: 18 }}>
            <Statistic
              title={t('dashboard.openTickets')}
              value={overview.openTicketCount}
              prefix={<AlertOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24}>
          <Card
            bordered={false}
            style={{ borderRadius: 18, height: '100%' }}
            title={t('dashboard.stageDistribution')}
          >
            <Space direction="vertical" size={14} style={{ width: '100%' }}>
              {overview.statusDistribution.map((item) => (
                <div key={item.status}>
                  <Space style={{ justifyContent: 'space-between', width: '100%' }}>
                    <Space>
                      {renderStatusTag(item.status, t)}
                      <Typography.Text>
                        {item.count} {t('common.ordersUnit')}
                      </Typography.Text>
                    </Space>
                    <Typography.Text type="secondary">
                      {Math.round((item.count / Math.max(overview.totalOrders, 1)) * 100)}%
                    </Typography.Text>
                  </Space>
                  <Progress
                    percent={Math.round((item.count / Math.max(overview.totalOrders, 1)) * 100)}
                    showInfo={false}
                    strokeColor="#1f7a8c"
                  />
                </div>
              ))}
            </Space>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={14}>
          <Card bordered={false} style={{ borderRadius: 18 }} title={t('dashboard.recentOrders')}>
            <Space direction="vertical" size={12} style={{ width: '100%' }}>
              {overview.recentOrders.map((order) => (
                <Card key={order.id} size="small" style={{ borderRadius: 14 }}>
                  <Space direction="vertical" size={6} style={{ width: '100%' }}>
                    <Space style={{ justifyContent: 'space-between', width: '100%' }} wrap>
                      <Typography.Text strong>{td(order.customerName)}</Typography.Text>
                      {renderStatusTag(order.status, t)}
                    </Space>
                    <Typography.Text type="secondary">
                      {td(order.serviceType)} · {dayjs(order.appointmentTime).format('MM-DD HH:mm')} ·
                      ¥{order.estimatedAmount}
                    </Typography.Text>
                    <Typography.Text>{td(order.latestProgress)}</Typography.Text>
                  </Space>
                </Card>
              ))}
            </Space>
          </Card>
        </Col>
        <Col xs={24} lg={10}>
          <Space direction="vertical" size={16} style={{ width: '100%' }}>
            <Card bordered={false} style={{ borderRadius: 18 }} title={t('dashboard.urgentSupport')}>
              <Space direction="vertical" size={12} style={{ width: '100%' }}>
                {overview.urgentTickets.map((ticket) => (
                  <Card key={ticket.id} size="small" style={{ borderRadius: 14 }}>
                    <Space direction="vertical" size={6} style={{ width: '100%' }}>
                      <Space style={{ justifyContent: 'space-between', width: '100%' }}>
                        <Typography.Text strong>{td(ticket.customerName)}</Typography.Text>
                        <Tag color={ticket.status === 'RESOLVED' ? 'success' : 'processing'}>
                          {t(`status.${ticket.status}`)}
                        </Tag>
                      </Space>
                      <Typography.Text type="secondary">{td(ticket.issueType)}</Typography.Text>
                      <Typography.Text>{td(ticket.latestUpdate)}</Typography.Text>
                    </Space>
                  </Card>
                ))}
              </Space>
            </Card>

            <Card bordered={false} style={{ borderRadius: 18 }} title={t('dashboard.topWorkers')}>
              <Space direction="vertical" size={12} style={{ width: '100%' }}>
                {overview.topWorkers.map((worker) => (
                  <Space
                    key={worker.id}
                    style={{ justifyContent: 'space-between', width: '100%' }}
                  >
                    <Space direction="vertical" size={0}>
                      <Typography.Text strong>{td(worker.name)}</Typography.Text>
                      <Typography.Text type="secondary">
                        {td(worker.region)} · {td(worker.skills[0])}
                      </Typography.Text>
                    </Space>
                    <Tag color="success">
                      {t('dashboard.rating')} {worker.rating}
                    </Tag>
                  </Space>
                ))}
              </Space>
            </Card>
          </Space>
        </Col>
      </Row>
    </Space>
  )
}
