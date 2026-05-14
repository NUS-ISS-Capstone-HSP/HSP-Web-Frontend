import { CheckCircleOutlined, FileSearchOutlined } from '@ant-design/icons'
import {
  Card,
  Col,
  Descriptions,
  Drawer,
  Row,
  Space,
  Statistic,
  Table,
  Tag,
  Typography,
} from 'antd'
import type { ColumnsType } from 'antd/es/table'
import dayjs from 'dayjs'
import { useEffect, useState } from 'react'
import { useLocale } from '@/i18n'
import { listDemoServiceRecords } from '@/services/demo'
import type { DemoServiceRecord } from '@/types/operations'

function renderStatus(status: DemoServiceRecord['status']) {
  const colorMap: Record<DemoServiceRecord['status'], string> = {
    IN_PROGRESS: 'processing',
    COMPLETED: 'success',
    FOLLOW_UP_REQUIRED: 'warning',
  }

  return <Tag color={colorMap[status]}>{status}</Tag>
}

export function ServiceRecordsPage() {
  const { t, td } = useLocale()
  const [records, setRecords] = useState<DemoServiceRecord[]>([])
  const [loading, setLoading] = useState(false)
  const [detail, setDetail] = useState<DemoServiceRecord | null>(null)

  useEffect(() => {
    const load = async () => {
      setLoading(true)

      try {
        setRecords(await listDemoServiceRecords())
      } finally {
        setLoading(false)
      }
    }

    void load()
  }, [])

  const columns: ColumnsType<DemoServiceRecord> = [
    {
      title: t('serviceRecords.table.id'),
      dataIndex: 'id',
      width: 160,
    },
    {
      title: t('serviceRecords.table.order'),
      dataIndex: 'orderId',
      width: 180,
    },
    {
      title: t('serviceRecords.table.parties'),
      width: 200,
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Typography.Text strong>{td(record.workerName)}</Typography.Text>
          <Typography.Text type="secondary">{td(record.customerName)}</Typography.Text>
        </Space>
      ),
    },
    {
      title: t('serviceRecords.table.serviceType'),
      dataIndex: 'serviceType',
      width: 120,
      render: (value: string) => td(value),
    },
    {
      title: t('common.status'),
      dataIndex: 'status',
      width: 140,
      render: (status: DemoServiceRecord['status']) => renderStatus(status),
    },
    {
      title: t('serviceRecords.table.time'),
      width: 180,
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Typography.Text>{dayjs(record.startedAt).format('MM-DD HH:mm')}</Typography.Text>
          <Typography.Text type="secondary">
            {record.completedAt ? dayjs(record.completedAt).format('MM-DD HH:mm') : t('common.inProgress')}
          </Typography.Text>
        </Space>
      ),
    },
    {
      title: t('serviceRecords.table.summary'),
      dataIndex: 'summary',
      ellipsis: true,
      render: (value: string) => td(value),
    },
    {
      title: t('common.actions'),
      width: 110,
      render: (_, record) => (
        <Typography.Link onClick={() => setDetail(record)}>{t('serviceRecords.table.view')}</Typography.Link>
      ),
    },
  ]

  const completedCount = records.filter((item) => item.status === 'COMPLETED').length
  const followUpCount = records.filter((item) => item.status === 'FOLLOW_UP_REQUIRED').length
  const totalPhotos = records.reduce((sum, item) => sum + item.photoCount, 0)

  return (
    <Space direction="vertical" size={16} style={{ width: '100%' }}>
      <Card bordered={false} style={{ borderRadius: 20 }}>
        <Space direction="vertical" size={4}>
          <Typography.Title level={3} style={{ margin: 0 }}>
            {t('serviceRecords.title')}
          </Typography.Title>
        </Space>
      </Card>

      <Row gutter={[16, 16]}>
        <Col xs={24} md={8}>
          <Card bordered={false} style={{ borderRadius: 18 }}>
            <Statistic title={t('serviceRecords.completed')} value={completedCount} prefix={<CheckCircleOutlined />} />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card bordered={false} style={{ borderRadius: 18 }}>
            <Statistic title={t('serviceRecords.followUp')} value={followUpCount} prefix={<FileSearchOutlined />} />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card bordered={false} style={{ borderRadius: 18 }}>
            <Statistic title={t('serviceRecords.photos')} value={totalPhotos} suffix={t('common.items')} />
          </Card>
        </Col>
      </Row>

      <Card bordered={false} style={{ borderRadius: 18 }}>
        <Table<DemoServiceRecord>
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={records}
          scroll={{ x: 1200 }}
          pagination={{ pageSize: 6, showSizeChanger: false }}
        />
      </Card>

      <Drawer
        width={560}
        title={detail ? `${t('serviceRecords.title')} · ${detail.id}` : t('serviceRecords.title')}
        open={Boolean(detail)}
        onClose={() => setDetail(null)}
      >
        {detail ? (
          <Descriptions bordered column={1} size="small">
            <Descriptions.Item label={t('billing.table.order')}>{detail.orderId}</Descriptions.Item>
            <Descriptions.Item label={t('orders.table.worker')}>{td(detail.workerName)}</Descriptions.Item>
            <Descriptions.Item label={t('billing.table.customer')}>{td(detail.customerName)}</Descriptions.Item>
            <Descriptions.Item label={t('common.status')}>{renderStatus(detail.status)}</Descriptions.Item>
            <Descriptions.Item label={t('serviceRecords.detail.started')}>
              {dayjs(detail.startedAt).format('YYYY-MM-DD HH:mm')}
            </Descriptions.Item>
            <Descriptions.Item label={t('serviceRecords.detail.completed')}>
              {detail.completedAt
                ? dayjs(detail.completedAt).format('YYYY-MM-DD HH:mm')
                : t('common.inProgress')}
            </Descriptions.Item>
            <Descriptions.Item label={t('serviceRecords.detail.feedback')}>{td(detail.summary)}</Descriptions.Item>
            <Descriptions.Item label={t('serviceRecords.detail.extras')}>
              {detail.extraItems.length ? detail.extraItems.map((item) => td(item)).join('; ') : t('common.none')}
            </Descriptions.Item>
            <Descriptions.Item label={t('serviceRecords.detail.photos')}>{detail.photoCount} {t('common.items')}</Descriptions.Item>
            <Descriptions.Item label={t('serviceRecords.detail.rating')}>
              {detail.customerRating ?? t('common.pendingReview')}
            </Descriptions.Item>
          </Descriptions>
        ) : null}
      </Drawer>
    </Space>
  )
}
