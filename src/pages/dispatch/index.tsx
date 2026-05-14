import {
  ClockCircleOutlined,
  HistoryOutlined,
  SearchOutlined,
  SendOutlined,
} from '@ant-design/icons'
import {
  Button,
  Card,
  Col,
  DatePicker,
  Descriptions,
  Form,
  Input,
  InputNumber,
  Row,
  Space,
  Table,
  Tag,
  Typography,
  message,
} from 'antd'
import type { ColumnsType } from 'antd/es/table'
import dayjs, { type Dayjs } from 'dayjs'
import { useEffect, useMemo, useState } from 'react'
import { useLocale } from '@/i18n'
import { getWorkerScheduleSnapshot } from '@/services/demo'
import {
  getOrderDispatchHistory,
  listAvailableWorkers,
  manualAssignOrder,
  type AvailableWorker,
  type DispatchRecord,
} from '@/services/dispatch'
import type { DemoOrder, DemoWorker } from '@/types/operations'
import './index.css'

interface WorkerScheduleSnapshot extends DemoWorker {
  orders: DemoOrder[]
}

interface TimelineSegment {
  id: string
  left: number
  width: number
  label: string
  tooltip: string
  color: string
}

const TIMELINE_START_HOUR = 6
const TIMELINE_END_HOUR = 24
const TIMELINE_TOTAL_HOURS = TIMELINE_END_HOUR - TIMELINE_START_HOUR
const TIMELINE_HOUR_MARKS = Array.from(
  { length: TIMELINE_TOTAL_HOURS + 1 },
  (_, index) => TIMELINE_START_HOUR + index,
)

interface WorkerSearchFormValues {
  service_type?: string
  region?: string
  at_time?: Dayjs
  limit?: number
}

interface ManualDispatchFormValues {
  order_id: string
  worker_id: string
}

interface HistorySearchFormValues {
  order_id: string
}

function normalizeText(value?: string) {
  const trimmed = value?.trim()
  return trimmed || undefined
}

function formatTime(value: string | null) {
  if (!value) {
    return '-'
  }

  const parsed = dayjs(value)
  return parsed.isValid() ? parsed.format('YYYY-MM-DD HH:mm:ss') : value
}

function renderStatus(status: DispatchRecord['status']) {
  const colorMap: Record<DispatchRecord['status'], string> = {
    PENDING: 'processing',
    ACCEPTED: 'success',
    REJECTED: 'error',
  }

  return <Tag color={colorMap[status]}>{status}</Tag>
}

function renderWorkerStatus(status: string, td: (value?: string | null) => string) {
  const colorMap: Record<string, string> = {
    IDLE: 'success',
    BUSY: 'processing',
    INACTIVE: 'default',
    AVAILABLE: 'success',
    ASSIGNED: 'processing',
    ON_JOB: 'processing',
    OFF_DUTY: 'default',
  }

  return <Tag color={colorMap[status] ?? 'default'}>{td(status)}</Tag>
}

function getTimelineColor(status: DemoOrder['status']) {
  const colorMap: Record<DemoOrder['status'], string> = {
    CREATED: 'linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%)',
    PENDING: 'linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%)',
    ACCEPTED: 'linear-gradient(135deg, #bfdbfe 0%, #3b82f6 100%)',
    IN_SERVICE: 'linear-gradient(135deg, #99f6e4 0%, #14b8a6 100%)',
    DONE: 'linear-gradient(135deg, #ddd6fe 0%, #8b5cf6 100%)',
    PAID: 'linear-gradient(135deg, #bbf7d0 0%, #22c55e 100%)',
    AFTER_SALE: 'linear-gradient(135deg, #fecaca 0%, #f97316 100%)',
    COMPLETED: 'linear-gradient(135deg, #fde68a 0%, #f59e0b 100%)',
  }

  return colorMap[status]
}

function formatHourLabel(hour: number) {
  const normalizedHour = ((hour % 24) + 24) % 24
  return `${String(normalizedHour).padStart(2, '0')}:00`
}

export function DispatchPage() {
  const { t, td } = useLocale()
  const [workerSearchForm] = Form.useForm<WorkerSearchFormValues>()
  const [manualDispatchForm] = Form.useForm<ManualDispatchFormValues>()
  const [historySearchForm] = Form.useForm<HistorySearchFormValues>()

  const [workers, setWorkers] = useState<AvailableWorker[]>([])
  const [scheduleWorkers, setScheduleWorkers] = useState<WorkerScheduleSnapshot[]>([])
  const [dispatchHistory, setDispatchHistory] = useState<DispatchRecord[]>([])
  const [latestDispatch, setLatestDispatch] = useState<DispatchRecord | null>(null)

  const [workersLoading, setWorkersLoading] = useState(false)
  const [scheduleLoading, setScheduleLoading] = useState(false)
  const [manualDispatchLoading, setManualDispatchLoading] = useState(false)
  const [dispatchHistoryLoading, setDispatchHistoryLoading] = useState(false)

  const workerIdTips = useMemo(
    () =>
      workers.map((item) => ({
        key: item.worker_id,
        label: `${item.worker_id} · ${td(item.name)}`,
      })),
    [td, workers],
  )

  const buildWorkerTimeline = (orders: DemoOrder[]) => {
    const todayOrders = orders
      .filter((order) => !['CREATED', 'PENDING'].includes(order.status))
      .filter((order) => dayjs(order.appointmentTime).isSame(dayjs(), 'day'))
      .sort((left, right) => dayjs(left.appointmentTime).valueOf() - dayjs(right.appointmentTime).valueOf())

    return todayOrders
      .map((order) => {
        const start = dayjs(order.appointmentTime)
        const end = start.add(order.durationHours, 'hour')
        const rawStartHour = start.hour() + start.minute() / 60
        const rawEndHour = end.hour() + end.minute() / 60
        const normalizedStartHour = Math.max(rawStartHour, TIMELINE_START_HOUR)
        const normalizedEndHour = Math.min(rawEndHour, TIMELINE_END_HOUR)

        if (normalizedEndHour <= TIMELINE_START_HOUR || normalizedStartHour >= TIMELINE_END_HOUR) {
          return null
        }

        const left = ((normalizedStartHour - TIMELINE_START_HOUR) / TIMELINE_TOTAL_HOURS) * 100
        const width = Math.max(
          ((normalizedEndHour - normalizedStartHour) / TIMELINE_TOTAL_HOURS) * 100,
          4,
        )

        return {
          id: order.id,
          left,
          width,
          label: `${start.format('HH:mm')} · ${td(order.serviceType)}`,
          tooltip: `${start.format('HH:mm')} - ${end.format('HH:mm')} · ${td(order.serviceType)} · ${td(order.customerName)}`,
          color: getTimelineColor(order.status),
        }
      })
      .filter((segment): segment is TimelineSegment => Boolean(segment))
  }

  const reloadSchedule = async () => {
    setScheduleLoading(true)

    try {
      const records = await getWorkerScheduleSnapshot()
      setScheduleWorkers(records.filter((worker) => worker.status !== 'INACTIVE'))
    } finally {
      setScheduleLoading(false)
    }
  }

  useEffect(() => {
    void reloadSchedule()
  }, [])

  const workerColumns: ColumnsType<AvailableWorker> = [
    {
      title: t('dispatch.table.workerId'),
      dataIndex: 'worker_id',
      width: 180,
    },
    {
      title: t('dispatch.table.name'),
      dataIndex: 'name',
      width: 140,
      render: (value: string) => td(value),
    },
    {
      title: t('dispatch.table.skills'),
      dataIndex: 'skills',
      render: (skills: string[]) =>
        skills.length ? (
          <Space size={[4, 8]} wrap>
            {skills.map((skill) => (
              <Tag key={skill}>{td(skill)}</Tag>
            ))}
          </Space>
        ) : (
          '-'
        ),
    },
    {
      title: t('common.status'),
      dataIndex: 'status',
      width: 130,
      render: (status: string) => renderWorkerStatus(status, td),
    },
    {
      title: t('common.actions'),
      width: 130,
      render: (_, record) => (
        <Button
          type="link"
          onClick={() => {
            manualDispatchForm.setFieldsValue({ worker_id: record.worker_id })
            message.success(t('dispatch.message.workerFilled', { workerId: record.worker_id }))
          }}
        >
          {t('dispatch.action.useWorker')}
        </Button>
      ),
    },
  ]

  const dispatchHistoryColumns: ColumnsType<DispatchRecord> = [
    {
      title: t('dispatch.table.attempt'),
      dataIndex: 'attempt_no',
      width: 80,
    },
    {
      title: t('dispatch.table.dispatchId'),
      dataIndex: 'dispatch_id',
      width: 240,
    },
    {
      title: t('dispatch.table.workerId'),
      dataIndex: 'worker_id',
      width: 160,
    },
    {
      title: t('dispatch.table.operatorId'),
      dataIndex: 'operator_id',
      width: 140,
    },
    {
      title: t('common.status'),
      dataIndex: 'status',
      width: 120,
      render: (status: DispatchRecord['status']) => renderStatus(status),
    },
    {
      title: t('dispatch.table.assignedAt'),
      dataIndex: 'assigned_at',
      width: 190,
      render: (value: string) => formatTime(value),
    },
    {
      title: t('dispatch.table.respondedAt'),
      dataIndex: 'responded_at',
      width: 190,
      render: (value: string | null) => formatTime(value),
    },
    {
      title: t('dispatch.table.rejectReason'),
      dataIndex: 'reject_reason',
      width: 220,
      render: (value: string | null) => (value ? td(value) : '-'),
    },
  ]

  const handleSearchWorkers = async (values: WorkerSearchFormValues) => {
    setWorkersLoading(true)

    try {
      const response = await listAvailableWorkers({
        service_type: normalizeText(values.service_type),
        region: normalizeText(values.region),
        at_time: values.at_time?.toISOString(),
        limit: values.limit,
      })

      setWorkers(response.workers)
      message.success(t('dispatch.message.workerSearchSuccess', { count: response.workers.length }))
    } finally {
      setWorkersLoading(false)
    }
  }

  const handleManualDispatch = async (values: ManualDispatchFormValues) => {
    setManualDispatchLoading(true)

    try {
      const response = await manualAssignOrder({
        order_id: values.order_id.trim(),
        worker_id: values.worker_id.trim(),
      })

      setLatestDispatch(response)
      message.success(t('dispatch.message.manualSuccess', { dispatchId: response.dispatch_id }))
      await reloadSchedule()
    } finally {
      setManualDispatchLoading(false)
    }
  }

  const handleSearchDispatchHistory = async (values: HistorySearchFormValues) => {
    setDispatchHistoryLoading(true)

    try {
      const response = await getOrderDispatchHistory(values.order_id.trim())
      setDispatchHistory(response.dispatches)
      message.success(t('dispatch.message.historySuccess', { count: response.dispatches.length }))
    } finally {
      setDispatchHistoryLoading(false)
    }
  }

  return (
    <div className="dispatch-page">
      <Space direction="vertical" size={4}>
        <Typography.Title level={3} style={{ margin: 0 }}>
          {t('dispatch.title')}
        </Typography.Title>
      </Space>

      <Card className="dispatch-card" bordered={false}>
        <div className="dispatch-card-header">
          <Space>
            <SearchOutlined />
            <Typography.Title level={5} style={{ margin: 0 }}>
              {t('dispatch.section.availableWorkers')}
            </Typography.Title>
          </Space>
        </div>

        <Form<WorkerSearchFormValues>
          form={workerSearchForm}
          layout="vertical"
          initialValues={{ limit: 20 }}
          onFinish={handleSearchWorkers}
        >
          <Row gutter={[12, 0]}>
            <Col xs={24} md={6}>
              <Form.Item name="service_type" label={t('dispatch.form.serviceType')}>
                <Input placeholder="cleaning" allowClear />
              </Form.Item>
            </Col>
            <Col xs={24} md={6}>
              <Form.Item name="region" label={t('dispatch.form.region')}>
                <Input placeholder="shanghai-pudong" allowClear />
              </Form.Item>
            </Col>
            <Col xs={24} md={6}>
              <Form.Item name="at_time" label={t('dispatch.form.atTime')}>
                <DatePicker showTime style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col xs={24} md={4}>
              <Form.Item
                name="limit"
                label={t('dispatch.form.limit')}
                rules={[{ type: 'number', min: 1, max: 100, message: t('dispatch.form.limitRange') }]}
              >
                <InputNumber min={1} max={100} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col xs={24} md={2}>
              <Form.Item label=" ">
                <Button type="primary" htmlType="submit" loading={workersLoading} block>
                  {t('dispatch.form.search')}
                </Button>
              </Form.Item>
            </Col>
          </Row>
        </Form>

        <Table<AvailableWorker>
          rowKey="worker_id"
          loading={workersLoading}
          columns={workerColumns}
          dataSource={workers}
          scroll={{ x: 900 }}
          pagination={{ pageSize: 10, showSizeChanger: false }}
        />
      </Card>

      <Card className="dispatch-card" bordered={false} loading={scheduleLoading}>
        <div className="dispatch-card-header">
          <Space>
            <ClockCircleOutlined />
            <Typography.Title level={5} style={{ margin: 0 }}>
              {t('workers.scheduleWatch')}
            </Typography.Title>
          </Space>
        </div>

        <div
          style={{
            borderRadius: 16,
            border: '1px solid #e2e8f0',
            background: 'linear-gradient(180deg, #fbfdff 0%, #ffffff 100%)',
            overflowX: 'auto',
          }}
        >
          <div style={{ minWidth: 1040 }}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '220px 1fr',
                borderBottom: '1px solid #e2e8f0',
                background: '#f8fbff',
              }}
            >
              <div
                style={{
                  padding: '14px 16px',
                  fontWeight: 600,
                  color: '#334155',
                  borderRight: '1px solid #e2e8f0',
                }}
              >
                {t('workers.table.info')}
              </div>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: `repeat(${TIMELINE_HOUR_MARKS.length}, minmax(0, 1fr))`,
                  padding: '14px 0',
                  color: '#64748b',
                  fontSize: 12,
                }}
              >
                {TIMELINE_HOUR_MARKS.map((hour) => (
                  <div
                    key={hour}
                    style={{
                      textAlign: 'left',
                      transform: hour === TIMELINE_END_HOUR ? 'translateX(-50%)' : 'none',
                    }}
                  >
                    {formatHourLabel(hour)}
                  </div>
                ))}
              </div>
            </div>

            {scheduleWorkers.map((worker, index) => {
              const segments = buildWorkerTimeline(worker.orders)
              const pendingOnly =
                !segments.length && worker.orders.some((order) => order.status === 'PENDING')

              return (
                <div
                  key={worker.id}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '220px 1fr',
                    borderBottom: index === scheduleWorkers.length - 1 ? 'none' : '1px solid #eef2f7',
                  }}
                >
                  <div
                    style={{
                      padding: '16px',
                      borderRight: '1px solid #e2e8f0',
                      background: '#fff',
                    }}
                  >
                    <Space direction="vertical" size={8} style={{ width: '100%', alignItems: 'stretch' }}>
                      <Space style={{ justifyContent: 'space-between', width: '100%' }}>
                        <Typography.Text strong>{td(worker.name)}</Typography.Text>
                        {renderWorkerStatus(worker.status, td)}
                      </Space>
                      <Typography.Text type="secondary">
                        {td(worker.region)} · {td(worker.employmentType)}
                      </Typography.Text>
                    </Space>
                  </div>

                  <div
                    style={{
                      padding: '16px',
                      background: '#fff',
                    }}
                  >
                    <div
                      style={{
                        position: 'relative',
                        height: 64,
                        borderRadius: 12,
                        background:
                          'repeating-linear-gradient(90deg, #ffffff 0%, #ffffff calc(100% / 18 - 1px), #e5edf5 calc(100% / 18 - 1px), #e5edf5 calc(100% / 18))',
                        border: '1px solid #dbe5ef',
                        overflow: 'hidden',
                      }}
                    >
                      {segments.map((segment) => (
                        <div
                          key={segment.id}
                          title={segment.tooltip}
                          style={{
                            position: 'absolute',
                            left: `${segment.left}%`,
                            width: `${segment.width}%`,
                            top: 8,
                            bottom: 8,
                            borderRadius: 10,
                            padding: '8px 10px',
                            background: segment.color,
                            color: '#0f172a',
                            boxShadow: '0 8px 18px rgba(59, 130, 246, 0.18)',
                            display: 'flex',
                            alignItems: 'center',
                            overflow: 'hidden',
                          }}
                        >
                          <Typography.Text
                            style={{
                              color: '#0f172a',
                              fontWeight: 600,
                              fontSize: 12,
                              lineHeight: 1.2,
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}
                          >
                            {segment.label}
                          </Typography.Text>
                        </div>
                      ))}
                    </div>

                    {!segments.length ? (
                      <Typography.Text type="secondary" style={{ display: 'block', marginTop: 8 }}>
                        {pendingOnly ? t('workers.pendingOnly') : t('workers.noOrders')}
                      </Typography.Text>
                    ) : null}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </Card>

      <Card className="dispatch-card" bordered={false}>
        <div className="dispatch-card-header">
          <Space>
            <SendOutlined />
            <Typography.Title level={5} style={{ margin: 0 }}>
              {t('dispatch.section.manual')}
            </Typography.Title>
          </Space>
        </div>

        <Form<ManualDispatchFormValues>
          form={manualDispatchForm}
          layout="vertical"
          onFinish={handleManualDispatch}
        >
          <Row gutter={[12, 0]}>
            <Col xs={24} md={12}>
              <Form.Item
                name="order_id"
                label={t('dispatch.form.orderId')}
                rules={[{ required: true, message: t('dispatch.form.orderIdRequired') }]}
              >
                <Input placeholder="order-1001" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="worker_id"
                label={t('dispatch.form.workerId')}
                rules={[{ required: true, message: t('dispatch.form.workerIdRequired') }]}
                tooltip={t('dispatch.form.workerTooltip')}
              >
                <Input
                  placeholder="worker-001"
                  list="dispatch-worker-id-tips"
                  autoComplete="off"
                />
              </Form.Item>
              <datalist id="dispatch-worker-id-tips">
                {workerIdTips.map((item) => (
                  <option key={item.key} value={item.key}>
                    {item.label}
                  </option>
                ))}
              </datalist>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item
                name="operator_id"
                label={t('dispatch.form.operatorId')}
                rules={[{ required: true, message: t('dispatch.form.operatorIdRequired') }]}
              >
                <Input placeholder="csr-001" />
              </Form.Item>
            </Col>
          </Row>

          <Button
            type="primary"
            htmlType="submit"
            icon={<SendOutlined />}
            loading={manualDispatchLoading}
          >
            {t('dispatch.form.submit')}
          </Button>
        </Form>

        {latestDispatch ? (
          <Card className="dispatch-result-card" size="small">
            <Descriptions title={t('dispatch.latestResult')} size="small" column={{ xs: 1, md: 3 }}>
              <Descriptions.Item label="Dispatch ID">
                {latestDispatch.dispatch_id}
              </Descriptions.Item>
              <Descriptions.Item label={t('dispatch.form.orderId')}>{latestDispatch.order_id}</Descriptions.Item>
              <Descriptions.Item label={t('dispatch.detail.attemptNo')}>
                {latestDispatch.attempt_no}
              </Descriptions.Item>
              <Descriptions.Item label={t('dispatch.form.workerId')}>{latestDispatch.worker_id}</Descriptions.Item>
              <Descriptions.Item label={t('dispatch.form.operatorId')}>
                {latestDispatch.operator_id}
              </Descriptions.Item>
              <Descriptions.Item label={t('common.status')}>
                {renderStatus(latestDispatch.status)}
              </Descriptions.Item>
              <Descriptions.Item label={t('dispatch.table.assignedAt')}>
                {formatTime(latestDispatch.assigned_at)}
              </Descriptions.Item>
              <Descriptions.Item label={t('dispatch.table.respondedAt')}>
                {formatTime(latestDispatch.responded_at)}
              </Descriptions.Item>
              <Descriptions.Item label={t('dispatch.table.rejectReason')}>
                {latestDispatch.reject_reason ? td(latestDispatch.reject_reason) : '-'}
              </Descriptions.Item>
            </Descriptions>
          </Card>
        ) : null}
      </Card>

      <Card className="dispatch-card" bordered={false}>
        <div className="dispatch-card-header">
          <Space>
            <HistoryOutlined />
            <Typography.Title level={5} style={{ margin: 0 }}>
              {t('dispatch.section.history')}
            </Typography.Title>
          </Space>
        </div>

        <Form<HistorySearchFormValues>
          form={historySearchForm}
          layout="vertical"
          onFinish={handleSearchDispatchHistory}
        >
          <Row gutter={[12, 0]}>
            <Col xs={24} md={10}>
              <Form.Item
                name="order_id"
                label={t('dispatch.form.orderId')}
                rules={[{ required: true, message: t('dispatch.form.orderIdRequired') }]}
              >
                <Input placeholder="order-1001" />
              </Form.Item>
            </Col>
            <Col xs={24} md={4}>
              <Form.Item label=" ">
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={dispatchHistoryLoading}
                  icon={<ClockCircleOutlined />}
                  block
                >
                  {t('dispatch.form.historySearch')}
                </Button>
              </Form.Item>
            </Col>
          </Row>
        </Form>

        <Table<DispatchRecord>
          rowKey="dispatch_id"
          loading={dispatchHistoryLoading}
          columns={dispatchHistoryColumns}
          dataSource={dispatchHistory}
          scroll={{ x: 1400 }}
          pagination={{ pageSize: 10, showSizeChanger: false }}
        />
      </Card>
    </div>
  )
}
