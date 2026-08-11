import { CustomerServiceOutlined, SafetyCertificateOutlined } from '@ant-design/icons'
import { Button, Card, Col, Row, Space, Statistic, Table, Tag, Typography } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import dayjs from 'dayjs'
import { useEffect, useState } from 'react'
import { useLocale } from '@/i18n'
import { listDemoSupportTickets, resolveDemoSupportTicket } from '@/services/demo'
import type { DemoSupportTicket } from '@/types/operations'

function renderStatus(status: DemoSupportTicket['status'], t: (key: string) => string) {
  const colorMap: Record<DemoSupportTicket['status'], string> = {
    OPEN: 'default',
    PROCESSING: 'processing',
    RESOLVED: 'success',
  }

  return <Tag color={colorMap[status]}>{t(`status.${status}`)}</Tag>
}

export function SupportPage() {
  const { t, td } = useLocale()
  const [tickets, setTickets] = useState<DemoSupportTicket[]>([])
  const [loading, setLoading] = useState(false)
  const [resolvingId, setResolvingId] = useState<string | null>(null)

  const loadTickets = async () => {
    setLoading(true)

    try {
      setTickets(await listDemoSupportTickets())
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadTickets()
  }, [])

  const columns: ColumnsType<DemoSupportTicket> = [
    {
      title: t('support.table.id'),
      dataIndex: 'id',
      width: 140,
    },
    {
      title: t('support.table.order'),
      dataIndex: 'orderId',
      width: 180,
    },
    {
      title: t('support.table.customer'),
      dataIndex: 'customerName',
      width: 120,
      render: (value: string) => td(value),
    },
    {
      title: t('support.table.issueType'),
      dataIndex: 'issueType',
      width: 140,
      render: (value: string) => td(value),
    },
    {
      title: t('support.table.currentStatus'),
      dataIndex: 'status',
      width: 120,
      render: (status: DemoSupportTicket['status']) => renderStatus(status, t),
    },
    {
      title: t('support.table.owner'),
      dataIndex: 'owner',
      width: 140,
      render: (value: string) => td(value),
    },
    {
      title: t('support.table.update'),
      dataIndex: 'latestUpdate',
      ellipsis: true,
      render: (value: string) => td(value),
    },
    {
      title: t('support.table.compensation'),
      dataIndex: 'compensationAmount',
      width: 110,
      render: (value: number) => `¥${value}`,
    },
    {
      title: t('common.actions'),
      width: 120,
      render: (_, record) =>
        record.status === 'RESOLVED' ? (
          <Typography.Text type="secondary">{t('support.resolved')}</Typography.Text>
        ) : (
          <Button
            type="link"
            loading={resolvingId === record.id}
            disabled={Boolean(resolvingId) && resolvingId !== record.id}
            onClick={async () => {
              setResolvingId(record.id)

              try {
                await resolveDemoSupportTicket(record.id)
                await loadTickets()
              } finally {
                setResolvingId(null)
              }
            }}
          >
            {t('support.markDone')}
          </Button>
        ),
    },
  ]

  return (
    <Space direction="vertical" size={16} style={{ width: '100%' }}>
      <Card bordered={false} style={{ borderRadius: 20 }}>
        <Space direction="vertical" size={4}>
          <Typography.Title level={3} style={{ margin: 0 }}>
            {t('support.title')}
          </Typography.Title>
        </Space>
      </Card>

      <Row gutter={[16, 16]}>
        <Col xs={24} md={8}>
          <Card bordered={false} style={{ borderRadius: 18 }}>
            <Statistic
              title={t('support.pendingCases')}
              value={tickets.filter((item) => item.status !== 'RESOLVED').length}
              prefix={<CustomerServiceOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card bordered={false} style={{ borderRadius: 18 }}>
            <Statistic
              title={t('support.closedCases')}
              value={tickets.filter((item) => item.status === 'RESOLVED').length}
              prefix={<SafetyCertificateOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card bordered={false} style={{ borderRadius: 18 }}>
            <Statistic
              title={t('support.weeklyCompensation')}
              value={tickets.reduce((sum, item) => sum + item.compensationAmount, 0)}
              suffix={t('common.currencyYuan')}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        {tickets.slice(0, 2).map((ticket) => (
          <Col xs={24} lg={12} key={ticket.id}>
            <Card bordered={false} style={{ borderRadius: 18, height: '100%' }}>
              <Space direction="vertical" size={12} style={{ width: '100%' }}>
                <Space style={{ justifyContent: 'space-between', width: '100%' }}>
                  <Typography.Text strong>{td(ticket.issueType)}</Typography.Text>
                  {renderStatus(ticket.status, t)}
                </Space>
                <Typography.Text>{td(ticket.customerName)} · {ticket.orderId}</Typography.Text>
                <Typography.Text type="secondary">
                  {t('support.createdAt')} {dayjs(ticket.createdAt).format('MM-DD HH:mm')}，{t('support.ownerLabel')} {td(ticket.owner)}
                </Typography.Text>
                <Typography.Paragraph style={{ marginBottom: 0 }}>
                  {td(ticket.resolution)}
                </Typography.Paragraph>
              </Space>
            </Card>
          </Col>
        ))}
      </Row>

      <Card bordered={false} style={{ borderRadius: 18 }}>
        <Table<DemoSupportTicket>
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={tickets}
          scroll={{ x: 1220 }}
          pagination={{ pageSize: 8, showSizeChanger: false }}
        />
      </Card>
    </Space>
  )
}
