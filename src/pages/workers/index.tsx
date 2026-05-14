import { ReloadOutlined } from '@ant-design/icons'
import {
  Button,
  Card,
  Col,
  Form,
  Input,
  Row,
  Space,
  Table,
  Tag,
  Typography,
  message,
} from 'antd'
import type { ColumnsType } from 'antd/es/table'
import dayjs from 'dayjs'
import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useLocale } from '@/i18n'
import { getWorkerScheduleSnapshot, toggleDemoWorkerStatus } from '@/services/demo'
import { useAuthStore } from '@/store/auth'
import type { DemoOrder, DemoWorker } from '@/types/operations'
import { hasWorkerManagementAccess } from '@/utils'

interface WorkerScheduleSnapshot extends DemoWorker {
  orders: DemoOrder[]
}

function renderStatus(
  status: DemoWorker['status'],
  td: (value?: string | null) => string,
) {
  const colorMap: Record<DemoWorker['status'], string> = {
    IDLE: 'success',
    BUSY: 'processing',
    INACTIVE: 'default',
  }

  return <Tag color={colorMap[status]}>{td(status)}</Tag>
}

export function WorkersPage() {
  const { t, td } = useLocale()
  const user = useAuthStore((state) => state.user)
  const canManageWorkers = hasWorkerManagementAccess(user)
  const [form] = Form.useForm<{ keyword?: string }>()
  const [workers, setWorkers] = useState<WorkerScheduleSnapshot[]>([])
  const [loading, setLoading] = useState(false)

  const reloadWorkers = async (keyword?: string) => {
    setLoading(true)

    try {
      const records = await getWorkerScheduleSnapshot()
      const normalizedKeyword = keyword?.trim().toLowerCase()
      setWorkers(
        records.filter((worker) => {
          if (!normalizedKeyword) {
            return true
          }

          return [worker.id, worker.name, worker.region, worker.skills.join(' ')]
            .join(' ')
            .toLowerCase()
            .includes(normalizedKeyword)
        }),
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (canManageWorkers) {
      void reloadWorkers()
    }
  }, [canManageWorkers])

  if (!canManageWorkers) {
    return <Navigate to="/dashboard" replace />
  }

  const columns: ColumnsType<WorkerScheduleSnapshot> = [
    {
      title: t('workers.table.info'),
      width: 180,
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Typography.Text strong>{td(record.name)}</Typography.Text>
          <Typography.Text type="secondary">{record.id}</Typography.Text>
          <Typography.Text type="secondary">{record.phone}</Typography.Text>
        </Space>
      ),
    },
    {
      title: t('workers.table.region'),
      dataIndex: 'region',
      width: 120,
      render: (value: string) => td(value),
    },
    {
      title: t('workers.table.skills'),
      dataIndex: 'skills',
      render: (skills: string[]) => (
        <Space wrap>
          {skills.map((skill) => (
            <Tag key={skill}>{td(skill)}</Tag>
          ))}
        </Space>
      ),
    },
    {
      title: t('common.status'),
      dataIndex: 'status',
      width: 120,
      render: (status: DemoWorker['status']) => renderStatus(status, td),
    },
    {
      title: t('workers.table.todayAssignments'),
      dataIndex: 'todayAssignments',
      width: 100,
    },
    {
      title: t('workers.table.nextAvailable'),
      dataIndex: 'nextAvailableAt',
      width: 150,
      render: (value: string) => dayjs(value).format('MM-DD HH:mm'),
    },
    {
      title: t('workers.table.schedule'),
      render: (_, record) =>
        record.orders.length ? (
          <Space direction="vertical" size={0}>
            {record.orders.slice(0, 2).map((order) => (
              <Typography.Text key={order.id} type="secondary">
                {td(order.serviceType)} · {td(order.customerName)}
              </Typography.Text>
            ))}
          </Space>
        ) : (
          '-'
        ),
    },
    {
      title: t('common.actions'),
      width: 120,
      render: (_, record) => (
        <Button
          type="link"
          onClick={async () => {
            await toggleDemoWorkerStatus(record.id)
            message.success(t('workers.message.toggled'))
            await reloadWorkers(form.getFieldValue('keyword'))
          }}
        >
          {record.status === 'INACTIVE' ? t('workers.action.activate') : t('workers.action.deactivate')}
        </Button>
      ),
    },
  ]

  return (
    <Space direction="vertical" size={16} style={{ width: '100%' }}>
      <Card bordered={false} style={{ borderRadius: 20 }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24}>
            <Space direction="vertical" size={4}>
              <Typography.Title level={3} style={{ margin: 0 }}>
                {t('workers.title')}
              </Typography.Title>
            </Space>
          </Col>
        </Row>
      </Card>

      <Card bordered={false} style={{ borderRadius: 18 }}>
        <Form<{ keyword?: string }>
          form={form}
          layout="vertical"
          onFinish={(values) => void reloadWorkers(values.keyword)}
        >
          <Row gutter={[12, 0]}>
            <Col xs={24} md={10}>
              <Form.Item name="keyword" label={t('workers.searchLabel')}>
                <Input allowClear placeholder={t('workers.searchPlaceholder')} />
              </Form.Item>
            </Col>
            <Col xs={24} md={4}>
              <Form.Item label=" ">
                <Button type="primary" htmlType="submit" block loading={loading}>
                  {t('workers.search')}
                </Button>
              </Form.Item>
            </Col>
            <Col xs={24} md={4}>
              <Form.Item label=" ">
                <Button
                  icon={<ReloadOutlined />}
                  onClick={() => void reloadWorkers(form.getFieldValue('keyword'))}
                  block
                >
                  {t('workers.refresh')}
                </Button>
              </Form.Item>
            </Col>
          </Row>
        </Form>

        <Table<WorkerScheduleSnapshot>
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={workers}
          scroll={{ x: 1200 }}
          pagination={{ pageSize: 6, showSizeChanger: false }}
        />
      </Card>
    </Space>
  )
}
