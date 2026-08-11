import { WalletOutlined } from '@ant-design/icons'
import { Card, Col, Row, Space, Statistic, Table, Tag, Typography } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import dayjs from 'dayjs'
import { useEffect, useState } from 'react'
import { useLocale } from '@/i18n'
import { listDemoPaymentRecords } from '@/services/demo'
import type { DemoPaymentRecord } from '@/types/operations'

function renderStatus(status: DemoPaymentRecord['status'], t: (key: string) => string) {
  const colorMap: Record<DemoPaymentRecord['status'], string> = {
    UNPAID: 'default',
    PENDING: 'processing',
    PAID: 'success',
    REFUNDED: 'error',
  }

  return <Tag color={colorMap[status]}>{t(`status.${status}`)}</Tag>
}

export function BillingPage() {
  const { t, td } = useLocale()
  const [records, setRecords] = useState<DemoPaymentRecord[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const load = async () => {
      setLoading(true)

      try {
        setRecords(await listDemoPaymentRecords())
      } finally {
        setLoading(false)
      }
    }

    void load()
  }, [])

  const columns: ColumnsType<DemoPaymentRecord> = [
    {
      title: t('billing.table.id'),
      dataIndex: 'id',
      width: 140,
    },
    {
      title: t('billing.table.order'),
      dataIndex: 'orderId',
      width: 180,
    },
    {
      title: t('billing.table.customer'),
      dataIndex: 'customerName',
      width: 110,
      render: (value: string) => td(value),
    },
    {
      title: t('billing.table.amount'),
      dataIndex: 'amount',
      width: 120,
      render: (value: number) => `¥${value}`,
    },
    {
      title: t('billing.table.paymentStatus'),
      dataIndex: 'status',
      width: 120,
      render: (status: DemoPaymentRecord['status']) => renderStatus(status, t),
    },
    {
      title: t('billing.table.channel'),
      dataIndex: 'channel',
      width: 120,
      render: (value: string) => td(value),
    },
    {
      title: t('billing.table.paidAt'),
      dataIndex: 'paidAt',
      width: 150,
      render: (value: string | null) => (value ? dayjs(value).format('MM-DD HH:mm') : t('billing.unpaid')),
    },
    {
      title: t('billing.table.workerIncome'),
      dataIndex: 'workerIncome',
      width: 120,
      render: (value: number) => `¥${value}`,
    },
    {
      title: t('billing.table.companyIncome'),
      dataIndex: 'companyIncome',
      width: 120,
      render: (value: number) => `¥${value}`,
    },
  ]

  const totalIncome = records
    .filter((item) => item.status === 'PAID')
    .reduce((sum, item) => sum + item.amount, 0)
  const pendingAmount = records
    .filter((item) => item.status === 'PENDING')
    .reduce((sum, item) => sum + item.amount, 0)
  const refundedAmount = records
    .filter((item) => item.status === 'REFUNDED')
    .reduce((sum, item) => sum + item.amount, 0)

  return (
    <Space direction="vertical" size={16} style={{ width: '100%' }}>
      <Card bordered={false} style={{ borderRadius: 20 }}>
        <Space direction="vertical" size={4}>
          <Typography.Title level={3} style={{ margin: 0 }}>
            {t('billing.title')}
          </Typography.Title>
        </Space>
      </Card>

      <Row gutter={[16, 16]}>
        <Col xs={24} md={8}>
          <Card bordered={false} style={{ borderRadius: 18 }}>
            <Statistic title={t('billing.received')} value={totalIncome} prefix={<WalletOutlined />} suffix={t('common.currencyYuan')} />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card bordered={false} style={{ borderRadius: 18 }}>
            <Statistic title={t('billing.pending')} value={pendingAmount} suffix={t('common.currencyYuan')} />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card bordered={false} style={{ borderRadius: 18 }}>
            <Statistic title={t('billing.refunded')} value={refundedAmount} suffix={t('common.currencyYuan')} />
          </Card>
        </Col>
      </Row>

      <Card bordered={false} style={{ borderRadius: 18 }}>
        <Table<DemoPaymentRecord>
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={records}
          scroll={{ x: 1160 }}
          pagination={{ pageSize: 8, showSizeChanger: false }}
        />
      </Card>
    </Space>
  )
}
