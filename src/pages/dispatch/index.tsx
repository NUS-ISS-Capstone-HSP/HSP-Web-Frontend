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
import { useMemo, useState } from 'react'
import {
  getOrderDispatchHistory,
  listAvailableWorkers,
  manualAssignOrder,
  type AvailableWorker,
  type DispatchRecord,
} from '@/services/dispatch'
import './index.css'

interface WorkerSearchFormValues {
  service_type?: string
  region?: string
  at_time?: Dayjs
  limit?: number
}

interface ManualDispatchFormValues {
  order_id: string
  worker_id: string
  operator_id: string
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

export function DispatchPage() {
  const [workerSearchForm] = Form.useForm<WorkerSearchFormValues>()
  const [manualDispatchForm] = Form.useForm<ManualDispatchFormValues>()
  const [historySearchForm] = Form.useForm<HistorySearchFormValues>()

  const [workers, setWorkers] = useState<AvailableWorker[]>([])
  const [dispatchHistory, setDispatchHistory] = useState<DispatchRecord[]>([])
  const [latestDispatch, setLatestDispatch] = useState<DispatchRecord | null>(null)

  const [workersLoading, setWorkersLoading] = useState(false)
  const [manualDispatchLoading, setManualDispatchLoading] = useState(false)
  const [dispatchHistoryLoading, setDispatchHistoryLoading] = useState(false)

  const workerIdTips = useMemo(
    () =>
      workers.map((item) => ({
        key: item.worker_id,
        label: `${item.worker_id} · ${item.name}`,
      })),
    [workers],
  )

  const workerColumns: ColumnsType<AvailableWorker> = [
    {
      title: '工人ID',
      dataIndex: 'worker_id',
      width: 180,
    },
    {
      title: '姓名',
      dataIndex: 'name',
      width: 140,
    },
    {
      title: '技能',
      dataIndex: 'skills',
      render: (skills: string[]) =>
        skills.length ? (
          <Space size={[4, 8]} wrap>
            {skills.map((skill) => (
              <Tag key={skill}>{skill}</Tag>
            ))}
          </Space>
        ) : (
          '-'
        ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 130,
      render: (status: string) => <Tag color={status === 'AVAILABLE' ? 'success' : 'default'}>{status}</Tag>,
    },
    {
      title: '操作',
      width: 130,
      render: (_, record) => (
        <Button
          type="link"
          onClick={() => {
            manualDispatchForm.setFieldsValue({ worker_id: record.worker_id })
            message.success(`已带入工人 ${record.worker_id}`)
          }}
        >
          用此工人派单
        </Button>
      ),
    },
  ]

  const dispatchHistoryColumns: ColumnsType<DispatchRecord> = [
    {
      title: '尝试',
      dataIndex: 'attempt_no',
      width: 80,
    },
    {
      title: '派单ID',
      dataIndex: 'dispatch_id',
      width: 240,
    },
    {
      title: '工人ID',
      dataIndex: 'worker_id',
      width: 160,
    },
    {
      title: '客服ID',
      dataIndex: 'operator_id',
      width: 140,
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 120,
      render: (status: DispatchRecord['status']) => renderStatus(status),
    },
    {
      title: '派单时间',
      dataIndex: 'assigned_at',
      width: 190,
      render: (value: string) => formatTime(value),
    },
    {
      title: '响应时间',
      dataIndex: 'responded_at',
      width: 190,
      render: (value: string | null) => formatTime(value),
    },
    {
      title: '拒单原因',
      dataIndex: 'reject_reason',
      width: 220,
      render: (value: string | null) => value || '-',
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
      message.success(`查询成功，共 ${response.workers.length} 位可用工人`)
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
        operator_id: values.operator_id.trim(),
      })

      setLatestDispatch(response)
      message.success(`派单成功，Dispatch ID: ${response.dispatch_id}`)
    } finally {
      setManualDispatchLoading(false)
    }
  }

  const handleSearchDispatchHistory = async (values: HistorySearchFormValues) => {
    setDispatchHistoryLoading(true)

    try {
      const response = await getOrderDispatchHistory(values.order_id.trim())
      setDispatchHistory(response.dispatches)
      message.success(`查询成功，共 ${response.dispatches.length} 条派单记录`)
    } finally {
      setDispatchHistoryLoading(false)
    }
  }

  return (
    <div className="dispatch-page">
      <Space direction="vertical" size={4}>
        <Typography.Title level={3} style={{ margin: 0 }}>
          Dispatch 管理
        </Typography.Title>
        <Typography.Paragraph type="secondary" style={{ margin: 0 }}>
          已接入 API 4.1、4.2、4.5：查询可用工人、手工派单、查询订单派单历史。
        </Typography.Paragraph>
      </Space>

      <Card className="dispatch-card" bordered={false}>
        <div className="dispatch-card-header">
          <Space>
            <SearchOutlined />
            <Typography.Title level={5} style={{ margin: 0 }}>
              4.1 查询可用工人
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
              <Form.Item name="service_type" label="服务类型">
                <Input placeholder="如 cleaning" allowClear />
              </Form.Item>
            </Col>
            <Col xs={24} md={6}>
              <Form.Item name="region" label="区域">
                <Input placeholder="如 shanghai-pudong" allowClear />
              </Form.Item>
            </Col>
            <Col xs={24} md={6}>
              <Form.Item name="at_time" label="查询时间">
                <DatePicker showTime style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col xs={24} md={4}>
              <Form.Item
                name="limit"
                label="返回数量"
                rules={[{ type: 'number', min: 1, max: 100, message: '范围 1-100' }]}
              >
                <InputNumber min={1} max={100} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col xs={24} md={2}>
              <Form.Item label=" ">
                <Button type="primary" htmlType="submit" loading={workersLoading} block>
                  查询
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

      <Card className="dispatch-card" bordered={false}>
        <div className="dispatch-card-header">
          <Space>
            <SendOutlined />
            <Typography.Title level={5} style={{ margin: 0 }}>
              4.2 手工派单
            </Typography.Title>
          </Space>
        </div>

        <Form<ManualDispatchFormValues>
          form={manualDispatchForm}
          layout="vertical"
          onFinish={handleManualDispatch}
        >
          <Row gutter={[12, 0]}>
            <Col xs={24} md={8}>
              <Form.Item
                name="order_id"
                label="订单ID"
                rules={[{ required: true, message: '请输入订单ID' }]}
              >
                <Input placeholder="order-1001" />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item
                name="worker_id"
                label="工人ID"
                rules={[{ required: true, message: '请输入工人ID' }]}
                tooltip="可先在上方查询可用工人后点击“用此工人派单”自动带入"
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
                label="客服ID"
                rules={[{ required: true, message: '请输入客服ID' }]}
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
            提交派单
          </Button>
        </Form>

        {latestDispatch ? (
          <Card className="dispatch-result-card" size="small">
            <Descriptions title="最近一次派单结果" size="small" column={{ xs: 1, md: 3 }}>
              <Descriptions.Item label="Dispatch ID">
                {latestDispatch.dispatch_id}
              </Descriptions.Item>
              <Descriptions.Item label="订单ID">{latestDispatch.order_id}</Descriptions.Item>
              <Descriptions.Item label="尝试次数">
                {latestDispatch.attempt_no}
              </Descriptions.Item>
              <Descriptions.Item label="工人ID">{latestDispatch.worker_id}</Descriptions.Item>
              <Descriptions.Item label="客服ID">
                {latestDispatch.operator_id}
              </Descriptions.Item>
              <Descriptions.Item label="状态">
                {renderStatus(latestDispatch.status)}
              </Descriptions.Item>
              <Descriptions.Item label="派单时间">
                {formatTime(latestDispatch.assigned_at)}
              </Descriptions.Item>
              <Descriptions.Item label="响应时间">
                {formatTime(latestDispatch.responded_at)}
              </Descriptions.Item>
              <Descriptions.Item label="拒单原因">
                {latestDispatch.reject_reason || '-'}
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
              4.5 查询订单派单历史
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
                label="订单ID"
                rules={[{ required: true, message: '请输入订单ID' }]}
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
                  查询历史
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
