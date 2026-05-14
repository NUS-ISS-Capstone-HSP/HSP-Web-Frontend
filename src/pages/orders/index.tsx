import {
  CheckCircleOutlined,
  EyeOutlined,
  PlusOutlined,
  SendOutlined,
  WarningOutlined,
} from '@ant-design/icons'
import {
  Button,
  Card,
  Col,
  Descriptions,
  Drawer,
  Form,
  Input,
  InputNumber,
  Modal,
  Row,
  Select,
  Space,
  Statistic,
  Table,
  Tag,
  Typography,
  message,
} from 'antd'
import type { ColumnsType } from 'antd/es/table'
import dayjs from 'dayjs'
import { useEffect, useState } from 'react'
import { useLocale } from '@/i18n'
import {
  assignDemoOrder,
  createDemoOrder,
  createDemoSupportTicket,
  listAssignableWorkers,
  listDemoOrders,
  markDemoOrderCompleted,
} from '@/services/demo'
import type { CreateOrderPayload, DemoOrder, DemoOrderStatus } from '@/types/operations'

interface OrderFilterValues {
  keyword?: string
  status?: DemoOrderStatus
  serviceType?: string
}

interface AssignableWorkerOption {
  id: string
  name: string
  region: string
  skills: string[]
  displayName: string
}

function formatTime(value: string) {
  return dayjs(value).format('MM-DD HH:mm')
}

function renderStatus(status: DemoOrderStatus) {
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

  return <Tag color={colorMap[status]}>{status}</Tag>
}

export function OrdersPage() {
  const { t, td } = useLocale()
  const [filterForm] = Form.useForm<OrderFilterValues>()
  const [createForm] = Form.useForm<CreateOrderPayload>()

  const [orders, setOrders] = useState<DemoOrder[]>([])
  const [loading, setLoading] = useState(false)
  const [createOpen, setCreateOpen] = useState(false)
  const [detailOrder, setDetailOrder] = useState<DemoOrder | null>(null)
  const [assigningOrder, setAssigningOrder] = useState<DemoOrder | null>(null)
  const [assignOptions, setAssignOptions] = useState<AssignableWorkerOption[]>([])
  const [submitting, setSubmitting] = useState(false)

  const reloadOrders = async (values?: OrderFilterValues) => {
    setLoading(true)

    try {
      const records = await listDemoOrders({
        keyword: values?.keyword,
        status: values?.status || undefined,
        serviceType: values?.serviceType,
      })
      setOrders(records)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void reloadOrders(filterForm.getFieldsValue())
  }, [filterForm])

  const loadAssignableWorkers = async (order?: DemoOrder) => {
    const workers = await listAssignableWorkers({
      appointmentTime: order?.appointmentTime,
      durationHours: order?.durationHours,
    })
    setAssignOptions(workers)
  }

  const handleCreate = async (values: CreateOrderPayload) => {
    setSubmitting(true)

    try {
      await createDemoOrder(values)
      message.success(t('orders.message.created'))
      setCreateOpen(false)
      createForm.resetFields()
      await reloadOrders(filterForm.getFieldsValue())
    } finally {
      setSubmitting(false)
    }
  }

  const handleAssign = async (workerId: string) => {
    if (!assigningOrder) {
      return
    }

    setSubmitting(true)

    try {
      await assignDemoOrder(assigningOrder.id, workerId)
      message.success(t('orders.message.assigned'))
      setAssigningOrder(null)
      await reloadOrders(filterForm.getFieldsValue())
    } finally {
      setSubmitting(false)
    }
  }

  const handleAfterSale = async (orderId: string) => {
    setSubmitting(true)

    try {
      await createDemoSupportTicket(orderId)
      message.success(t('orders.message.afterSale'))
      await reloadOrders(filterForm.getFieldsValue())
    } finally {
      setSubmitting(false)
    }
  }

  const handleComplete = async (orderId: string) => {
    setSubmitting(true)

    try {
      await markDemoOrderCompleted(orderId)
      message.success(t('orders.message.completed'))
      await reloadOrders(filterForm.getFieldsValue())
    } finally {
      setSubmitting(false)
    }
  }

  const columns: ColumnsType<DemoOrder> = [
    {
      title: t('orders.table.id'),
      dataIndex: 'id',
      width: 190,
    },
    {
      title: t('orders.table.customer'),
      width: 180,
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Typography.Text strong>{td(record.customerName)}</Typography.Text>
          <Typography.Text type="secondary">{record.customerPhone}</Typography.Text>
        </Space>
      ),
    },
    {
      title: t('orders.table.service'),
      width: 210,
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Typography.Text>{td(record.serviceType)}</Typography.Text>
          <Typography.Text type="secondary">
            {formatTime(record.appointmentTime)} · {record.durationHours}h
          </Typography.Text>
        </Space>
      ),
    },
    {
      title: t('orders.table.worker'),
      dataIndex: 'assignedWorkerName',
      width: 120,
      render: (value?: string) => (value ? td(value) : '-'),
    },
    {
      title: t('common.status'),
      dataIndex: 'status',
      width: 120,
      render: (status: DemoOrderStatus) => renderStatus(status),
    },
    {
      title: t('orders.table.amount'),
      dataIndex: 'estimatedAmount',
      width: 100,
      render: (value: number) => `¥${value}`,
    },
    {
      title: t('orders.table.progress'),
      dataIndex: 'latestProgress',
      ellipsis: true,
      render: (value: string) => td(value),
    },
    {
      title: t('common.actions'),
      fixed: 'right',
      width: 240,
      render: (_, record) => (
        <Space wrap>
          <Button type="link" icon={<EyeOutlined />} onClick={() => setDetailOrder(record)}>
            {t('orders.action.detail')}
          </Button>
          {record.status === 'CREATED' ? (
            <Button
              type="link"
              icon={<SendOutlined />}
              onClick={async () => {
                await loadAssignableWorkers(record)
                setAssigningOrder(record)
              }}
            >
              {t('orders.action.assignWorker')}
            </Button>
          ) : null}
          {record.status === 'PAID' ? (
            <Button
              type="link"
              danger
              icon={<WarningOutlined />}
              onClick={() => void handleAfterSale(record.id)}
            >
              {t('orders.action.afterSale')}
            </Button>
          ) : null}
          {record.status === 'PAID' ? (
            <Button
              type="link"
              icon={<CheckCircleOutlined />}
              loading={submitting}
              onClick={() => void handleComplete(record.id)}
            >
              {t('orders.action.complete')}
            </Button>
          ) : null}
        </Space>
      ),
    },
  ]

  const pendingCount = orders.filter((item) => item.status === 'CREATED').length
  const completedCount = orders.filter((item) => item.status === 'COMPLETED').length
  const activeCount = orders.filter((item) =>
    ['PENDING', 'ACCEPTED', 'IN_SERVICE'].includes(item.status),
  ).length

  return (
    <Space direction="vertical" size={16} style={{ width: '100%' }}>
      <Card bordered={false} style={{ borderRadius: 20 }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} lg={16}>
            <Space direction="vertical" size={4}>
              <Typography.Title level={3} style={{ margin: 0 }}>
                {t('orders.title')}
              </Typography.Title>
            </Space>
          </Col>
          <Col xs={24} lg={8}>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }} wrap>
              <Button
                type="default"
                onClick={() => void reloadOrders(filterForm.getFieldsValue())}
              >
                {t('orders.refresh')}
              </Button>
              <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateOpen(true)}>
                {t('orders.new')}
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      <Row gutter={[16, 16]}>
        <Col xs={24} md={8}>
          <Card bordered={false} style={{ borderRadius: 18 }}>
            <Statistic title={t('orders.pendingCount')} value={pendingCount} />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card bordered={false} style={{ borderRadius: 18 }}>
            <Statistic title={t('orders.activeCount')} value={activeCount} />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card bordered={false} style={{ borderRadius: 18 }}>
            <Statistic title={t('orders.closedCount')} value={completedCount} suffix={t('common.ordersUnit')} />
          </Card>
        </Col>
      </Row>

      <Card bordered={false} style={{ borderRadius: 18 }}>
        <Form<OrderFilterValues>
          form={filterForm}
          layout="vertical"
          onFinish={(values) => void reloadOrders(values)}
        >
          <Row gutter={[12, 0]}>
            <Col xs={24} md={8}>
              <Form.Item name="keyword" label={t('orders.keyword')}>
                <Input allowClear placeholder={t('orders.keywordPlaceholder')} />
              </Form.Item>
            </Col>
            <Col xs={24} md={6}>
              <Form.Item name="status" label={t('orders.status')}>
                <Select
                  allowClear
                  options={[
                    { label: t('orders.allStatus'), value: '' },
                    { label: 'CREATED', value: 'CREATED' },
                    { label: 'PENDING', value: 'PENDING' },
                    { label: 'ACCEPTED', value: 'ACCEPTED' },
                    { label: 'IN_SERVICE', value: 'IN_SERVICE' },
                    { label: 'DONE', value: 'DONE' },
                    { label: 'PAID', value: 'PAID' },
                    { label: 'AFTER_SALE', value: 'AFTER_SALE' },
                    { label: 'COMPLETED', value: 'COMPLETED' },
                  ]}
                  placeholder={t('orders.allStatus')}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={6}>
              <Form.Item name="serviceType" label={t('orders.serviceType')}>
                <Select
                  allowClear
                  placeholder={t('orders.allServices')}
                  options={[
                    { label: td('日常保洁'), value: '日常保洁' },
                    { label: td('深度清洁'), value: '深度清洁' },
                    { label: td('擦窗'), value: '擦窗' },
                    { label: td('搬家打包'), value: '搬家打包' },
                    { label: td('家电清洁'), value: '家电清洁' },
                    { label: td('办公室清洁'), value: '办公室清洁' },
                    { label: td('小家电维修'), value: '小家电维修' },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={4}>
              <Form.Item label=" ">
                <Button type="primary" htmlType="submit" block loading={loading}>
                  {t('orders.search')}
                </Button>
              </Form.Item>
            </Col>
          </Row>
        </Form>

        <Table<DemoOrder>
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={orders}
          scroll={{ x: 1480 }}
          pagination={{ pageSize: 8, showSizeChanger: false }}
        />
      </Card>

      <Drawer
        width={560}
        title={detailOrder ? `${t('orders.detail.title')} · ${detailOrder.id}` : t('orders.detail.title')}
        open={Boolean(detailOrder)}
        onClose={() => setDetailOrder(null)}
      >
        {detailOrder ? (
          <Descriptions column={1} bordered size="small">
            <Descriptions.Item label={t('orders.detail.customer')}>{td(detailOrder.customerName)}</Descriptions.Item>
            <Descriptions.Item label={t('orders.detail.phone')}>
              {detailOrder.customerPhone}
            </Descriptions.Item>
            <Descriptions.Item label={t('orders.detail.address')}>{td(detailOrder.address)}</Descriptions.Item>
            <Descriptions.Item label={t('orders.serviceType')}>{td(detailOrder.serviceType)}</Descriptions.Item>
            <Descriptions.Item label={t('orders.detail.time')}>
              {dayjs(detailOrder.appointmentTime).format('YYYY-MM-DD HH:mm')}
            </Descriptions.Item>
            <Descriptions.Item label={t('orders.detail.duration')}>
              {detailOrder.durationHours} {t('common.hours')}
            </Descriptions.Item>
            <Descriptions.Item label={t('orders.detail.amount')}>
              ¥{detailOrder.estimatedAmount}
            </Descriptions.Item>
            <Descriptions.Item label={t('orders.detail.source')}>{td(detailOrder.source)}</Descriptions.Item>
            <Descriptions.Item label={t('orders.detail.priority')}>{detailOrder.priority}</Descriptions.Item>
            <Descriptions.Item label={t('common.status')}>
              {renderStatus(detailOrder.status)}
            </Descriptions.Item>
            <Descriptions.Item label={t('orders.detail.worker')}>
              {detailOrder.assignedWorkerName ? td(detailOrder.assignedWorkerName) : '-'}
            </Descriptions.Item>
            <Descriptions.Item label={t('orders.detail.notes')}>{detailOrder.notes ? td(detailOrder.notes) : '-'}</Descriptions.Item>
            <Descriptions.Item label={t('orders.detail.progress')}>
              {td(detailOrder.latestProgress)}
            </Descriptions.Item>
          </Descriptions>
        ) : null}
      </Drawer>

      <Modal
        title={assigningOrder ? `${t('orders.assignModal.title')} · ${assigningOrder.id}` : t('orders.assignModal.title')}
        open={Boolean(assigningOrder)}
        onCancel={() => setAssigningOrder(null)}
        footer={null}
      >
        <Space direction="vertical" size={16} style={{ width: '100%' }}>
          <Select
            placeholder={t('orders.assignModal.placeholder')}
            options={assignOptions.map((item) => ({
              label: `${td(item.name)} · ${td(item.region)} · ${item.skills
                .map((skill) => td(skill))
                .join(' / ')}`,
              value: item.id,
            }))}
            onChange={(value) => void handleAssign(value)}
            loading={submitting}
          />
        </Space>
      </Modal>

      <Modal
        title={t('orders.create.title')}
        open={createOpen}
        onCancel={() => setCreateOpen(false)}
        footer={null}
        width={720}
      >
        <Form<CreateOrderPayload>
          form={createForm}
          layout="vertical"
          initialValues={{
            priority: 'MEDIUM',
            source: '电话',
            durationHours: 2,
            estimatedAmount: 198,
          }}
          onFinish={(values) => void handleCreate(values)}
        >
          <Row gutter={[12, 0]}>
            <Col xs={24} md={12}>
              <Form.Item
                name="customerName"
                label={t('orders.create.customerName')}
                rules={[{ required: true, message: t('orders.create.customerNameRequired') }]}
              >
                <Input placeholder={t('orders.create.customerNamePlaceholder')} />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="customerPhone"
                label={t('orders.create.phone')}
                rules={[{ required: true, message: t('orders.create.phoneRequired') }]}
              >
                <Input placeholder={t('orders.create.phonePlaceholder')} />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="serviceType"
                label={t('orders.serviceType')}
                rules={[{ required: true, message: t('orders.create.serviceTypeRequired') }]}
              >
                <Select
                  options={[
                    { label: td('日常保洁'), value: '日常保洁' },
                    { label: td('深度清洁'), value: '深度清洁' },
                    { label: td('家电清洁'), value: '家电清洁' },
                    { label: td('搬家打包'), value: '搬家打包' },
                    { label: td('小家电维修'), value: '小家电维修' },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="appointmentTime"
                label={t('orders.create.time')}
                rules={[{ required: true, message: t('orders.create.timeRequired') }]}
              >
                <Input placeholder="2026-05-13T21:30:00.000Z" />
              </Form.Item>
            </Col>
            <Col xs={24}>
              <Form.Item
                name="address"
                label={t('orders.create.address')}
                rules={[{ required: true, message: t('orders.create.addressRequired') }]}
              >
                <Input placeholder={t('orders.create.addressPlaceholder')} />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item name="durationHours" label={t('orders.create.duration')}>
                <InputNumber min={1} max={12} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item name="estimatedAmount" label={t('orders.create.estimatedAmount')}>
                <InputNumber min={50} max={3000} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item name="priority" label={t('orders.create.priority')}>
                <Select
                  options={[
                    { label: 'LOW', value: 'LOW' },
                    { label: 'MEDIUM', value: 'MEDIUM' },
                    { label: 'HIGH', value: 'HIGH' },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="source" label={t('orders.create.source')}>
                <Input placeholder={t('orders.create.sourcePlaceholder')} />
              </Form.Item>
            </Col>
            <Col xs={24}>
              <Form.Item name="notes" label={t('orders.create.notes')}>
                <Input.TextArea rows={4} placeholder={t('orders.create.notesPlaceholder')} />
              </Form.Item>
            </Col>
          </Row>
          <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
            <Button onClick={() => setCreateOpen(false)}>{t('common.cancel')}</Button>
            <Button type="primary" htmlType="submit" loading={submitting}>
              {t('orders.create.submit')}
            </Button>
          </Space>
        </Form>
      </Modal>
    </Space>
  )
}
