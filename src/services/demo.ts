import dayjs from 'dayjs'
import { getStoredLocale, translateMessage } from '@/i18n/messages'
import type {
  CreateOrderPayload,
  DashboardOverview,
  DemoDatabase,
  DemoOrder,
  DemoOrderStatus,
  DemoPaymentRecord,
  DemoSupportTicket,
  DemoWorker,
  DemoWorkerStatus,
  OrderFilters,
  WorkerFilters,
} from '@/types/operations'

const STORAGE_KEY = 'hsp-pc-demo-database-v2'

const ORDER_FLOW: DemoOrderStatus[] = [
  'CREATED',
  'PENDING',
  'ACCEPTED',
  'IN_SERVICE',
  'DONE',
  'PAID',
]

function cloneValue<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

function wait<T>(value: T, delay = 180) {
  return new Promise<T>((resolve) => {
    window.setTimeout(() => resolve(cloneValue(value)), delay)
  })
}

function createInitialDatabase(): DemoDatabase {
  const now = dayjs()
  const todayAt = (hour: number, minute = 0) =>
    now.startOf('day').add(hour, 'hour').add(minute, 'minute')
  const yesterdayAt = (hour: number, minute = 0) =>
    now.subtract(1, 'day').startOf('day').add(hour, 'hour').add(minute, 'minute')
  const twoDaysAgoAt = (hour: number, minute = 0) =>
    now.subtract(2, 'day').startOf('day').add(hour, 'hour').add(minute, 'minute')

  const workers: DemoWorker[] = [
    {
      id: 'worker-001',
      name: '王丽',
      phone: '138****1023',
      region: '崇川区',
      skills: ['日常保洁', '深度清洁'],
      rating: 4.9,
      status: 'IDLE',
      employmentType: '全职',
      todayAssignments: 0,
      nextAvailableAt: todayAt(10, 30).toISOString(),
    },
    {
      id: 'worker-002',
      name: '赵敏',
      phone: '139****5801',
      region: '开发区',
      skills: ['搬家打包', '家电清洁'],
      rating: 4.8,
      status: 'IDLE',
      employmentType: '全职',
      todayAssignments: 0,
      nextAvailableAt: todayAt(13, 0).toISOString(),
    },
    {
      id: 'worker-003',
      name: '陈阿姨',
      phone: '137****8806',
      region: '通州区',
      skills: ['日常保洁', '收纳整理'],
      rating: 4.7,
      status: 'IDLE',
      employmentType: '兼职',
      todayAssignments: 0,
      nextAvailableAt: now.add(75, 'minute').toISOString(),
    },
    {
      id: 'worker-004',
      name: '李师傅',
      phone: '136****1250',
      region: '海门区',
      skills: ['小家电维修', '管道疏通'],
      rating: 4.9,
      status: 'IDLE',
      employmentType: '全职',
      todayAssignments: 0,
      nextAvailableAt: todayAt(17, 0).toISOString(),
    },
    {
      id: 'worker-005',
      name: '周燕',
      phone: '135****6702',
      region: '如东',
      skills: ['深度清洁', '擦窗'],
      rating: 4.6,
      status: 'INACTIVE',
      employmentType: '兼职',
      todayAssignments: 0,
      nextAvailableAt: now.add(30, 'day').startOf('day').toISOString(),
    },
    {
      id: 'worker-006',
      name: '孙芳',
      phone: '134****2289',
      region: '港闸区',
      skills: ['母婴护理', '日常保洁'],
      rating: 4.8,
      status: 'IDLE',
      employmentType: '全职',
      todayAssignments: 0,
      nextAvailableAt: todayAt(18, 30).toISOString(),
    },
  ]

  const orders: DemoOrder[] = [
    {
      id: 'order-20260513-001',
      customerName: '陈女士',
      customerPhone: '181****2201',
      address: '南通市崇川区学田苑 3 栋 1202',
      serviceType: '深度清洁',
      appointmentTime: todayAt(11, 30).toISOString(),
      durationHours: 3,
      estimatedAmount: 288,
      priority: 'HIGH',
      source: '电话',
      notes: '老人家庭，优先安排熟练阿姨。',
      status: 'CREATED',
      paymentStatus: 'UNPAID',
      createdAt: todayAt(9, 50).toISOString(),
      latestProgress: '客服已录入订单，待分配工人。',
    },
    {
      id: 'order-20260513-002',
      customerName: '王先生',
      customerPhone: '182****9132',
      address: '南通市开发区星湖名邸 8 栋 602',
      serviceType: '家电清洁',
      appointmentTime: todayAt(13, 0).toISOString(),
      durationHours: 2,
      estimatedAmount: 198,
      priority: 'MEDIUM',
      source: '微信',
      notes: '需要清洗油烟机和空调滤网。',
      status: 'PENDING',
      paymentStatus: 'PENDING',
      createdAt: todayAt(9, 20).toISOString(),
      assignedWorkerId: 'worker-002',
      assignedWorkerName: '赵敏',
      latestProgress: '已派单，等待工人确认接单。',
    },
    {
      id: 'order-20260513-003',
      customerName: '张老师',
      customerPhone: '183****4456',
      address: '南通市海门区东洲花园 11 栋 901',
      serviceType: '搬家打包',
      appointmentTime: todayAt(14, 0).toISOString(),
      durationHours: 3,
      estimatedAmount: 560,
      priority: 'HIGH',
      source: '58同城',
      notes: '办公室搬迁，需两人协作。',
      status: 'ACCEPTED',
      paymentStatus: 'PENDING',
      createdAt: todayAt(8, 40).toISOString(),
      assignedWorkerId: 'worker-004',
      assignedWorkerName: '李师傅',
      latestProgress: '工人已确认，将提前 15 分钟联系客户。',
    },
    {
      id: 'order-20260513-004',
      customerName: '盛女士',
      customerPhone: '186****7310',
      address: '南通市通州区金沙街道景瑞御府 2 栋 1801',
      serviceType: '日常保洁',
      appointmentTime: now.subtract(45, 'minute').toISOString(),
      durationHours: 2,
      estimatedAmount: 168,
      priority: 'MEDIUM',
      source: '老客户转介绍',
      notes: '客户在家，可直接上门。',
      status: 'IN_SERVICE',
      paymentStatus: 'PENDING',
      createdAt: todayAt(7, 50).toISOString(),
      assignedWorkerId: 'worker-003',
      assignedWorkerName: '陈阿姨',
      latestProgress: '服务执行中，预计本时段内完成。',
    },
    {
      id: 'order-20260513-005',
      customerName: '顾女士',
      customerPhone: '189****5567',
      address: '南通市港闸区万达华府 6 栋 1702',
      serviceType: '擦窗',
      appointmentTime: todayAt(8, 30).toISOString(),
      durationHours: 2,
      estimatedAmount: 220,
      priority: 'LOW',
      source: '门店',
      notes: '完成后需要上传前后对比照片。',
      status: 'COMPLETED',
      paymentStatus: 'PENDING',
      createdAt: yesterdayAt(18, 0).toISOString(),
      assignedWorkerId: 'worker-001',
      assignedWorkerName: '王丽',
      latestProgress: '服务已完成，待客户支付。',
    },
    {
      id: 'order-20260512-006',
      customerName: '刘总',
      customerPhone: '180****8901',
      address: '南通市开发区软件园 A 座 12 层',
      serviceType: '办公室清洁',
      appointmentTime: yesterdayAt(9, 30).toISOString(),
      durationHours: 5,
      estimatedAmount: 880,
      priority: 'HIGH',
      source: '企业客户',
      notes: '月度固定客户，周度复购。',
      status: 'COMPLETED',
      paymentStatus: 'PAID',
      createdAt: twoDaysAgoAt(10, 10).toISOString(),
      assignedWorkerId: 'worker-006',
      assignedWorkerName: '孙芳',
      latestProgress: '微信支付成功，等待月底统一结算。',
    },
    {
      id: 'order-20260513-009',
      customerName: '刘总',
      customerPhone: '180****8901',
      address: '南通市开发区软件园 A 座 12 层',
      serviceType: '办公室清洁',
      appointmentTime: todayAt(18, 30).toISOString(),
      durationHours: 3,
      estimatedAmount: 520,
      priority: 'HIGH',
      source: '企业客户',
      notes: '晚间办公室例行保洁。',
      status: 'ACCEPTED',
      paymentStatus: 'PENDING',
      createdAt: todayAt(10, 10).toISOString(),
      assignedWorkerId: 'worker-006',
      assignedWorkerName: '孙芳',
      latestProgress: '企业客户已确认今晚服务时段。',
    },
    {
      id: 'order-20260511-007',
      customerName: '黄阿姨',
      customerPhone: '187****4488',
      address: '南通市崇川区濠西园 5 栋 302',
      serviceType: '小家电维修',
      appointmentTime: yesterdayAt(15, 0).toISOString(),
      durationHours: 1,
      estimatedAmount: 160,
      priority: 'LOW',
      source: '电话',
      notes: '电饭煲故障排查。',
      status: 'PAID',
      paymentStatus: 'PAID',
      createdAt: twoDaysAgoAt(16, 0).toISOString(),
      assignedWorkerId: 'worker-004',
      assignedWorkerName: '李师傅',
      latestProgress: '客服已确认完成，订单已闭环。',
    },
    {
      id: 'order-20260510-008',
      customerName: '林女士',
      customerPhone: '185****7712',
      address: '南通市通州区恒大海上威尼斯 9 栋 2201',
      serviceType: '深度清洁',
      appointmentTime: twoDaysAgoAt(9, 0).toISOString(),
      durationHours: 4,
      estimatedAmount: 420,
      priority: 'HIGH',
      source: '微信',
      notes: '客户反馈卫生间死角清洁不到位。',
      status: 'AFTER_SALE',
      paymentStatus: 'REFUNDED',
      createdAt: twoDaysAgoAt(8, 0).toISOString(),
      assignedWorkerId: 'worker-001',
      assignedWorkerName: '王丽',
      latestProgress: '已进入售后流程，待安排返工。',
    },
  ]

  const paymentRecords: DemoPaymentRecord[] = [
    {
      id: 'pay-001',
      orderId: 'order-20260513-005',
      customerName: '顾女士',
      amount: 220,
      status: 'PENDING',
      channel: '微信支付',
      paidAt: null,
      workerIncome: 132,
      companyIncome: 88,
    },
    {
      id: 'pay-002',
      orderId: 'order-20260512-006',
      customerName: '刘总',
      amount: 880,
      status: 'PAID',
      channel: '微信支付',
      paidAt: yesterdayAt(20, 30).toISOString(),
      workerIncome: 528,
      companyIncome: 352,
    },
    {
      id: 'pay-003',
      orderId: 'order-20260511-007',
      customerName: '黄阿姨',
      amount: 160,
      status: 'PAID',
      channel: '现金',
      paidAt: yesterdayAt(16, 30).toISOString(),
      workerIncome: 96,
      companyIncome: 64,
    },
    {
      id: 'pay-004',
      orderId: 'order-20260510-008',
      customerName: '林女士',
      amount: 420,
      status: 'REFUNDED',
      channel: '微信支付',
      paidAt: twoDaysAgoAt(14, 0).toISOString(),
      workerIncome: 0,
      companyIncome: 0,
    },
  ]

  const serviceRecords = [
    {
      id: 'svc-001',
      orderId: 'order-20260513-004',
      workerId: 'worker-003',
      workerName: '陈阿姨',
      customerName: '盛女士',
      serviceType: '日常保洁',
      startedAt: now.subtract(45, 'minute').toISOString(),
      completedAt: null,
      status: 'IN_PROGRESS',
      summary: '厨房和客厅已完成，正在进行卫生间清洁。',
      extraItems: ['现场增加擦冰箱外立面'],
      photoCount: 2,
      customerRating: null,
    },
    {
      id: 'svc-002',
      orderId: 'order-20260513-005',
      workerId: 'worker-001',
      workerName: '王丽',
      customerName: '顾女士',
      serviceType: '擦窗',
      startedAt: todayAt(8, 30).toISOString(),
      completedAt: todayAt(10, 30).toISOString(),
      status: 'COMPLETED',
      summary: '已完成客厅、阳台、卧室窗户清洁并上传照片。',
      extraItems: [],
      photoCount: 6,
      customerRating: 5,
    },
    {
      id: 'svc-003',
      orderId: 'order-20260512-006',
      workerId: 'worker-006',
      workerName: '孙芳',
      customerName: '刘总',
      serviceType: '办公室清洁',
      startedAt: yesterdayAt(9, 30).toISOString(),
      completedAt: yesterdayAt(14, 30).toISOString(),
      status: 'COMPLETED',
      summary: '企业客户月度保洁完成，现场无异常。',
      extraItems: ['会议室地毯局部除渍'],
      photoCount: 4,
      customerRating: 5,
    },
    {
      id: 'svc-004',
      orderId: 'order-20260510-008',
      workerId: 'worker-001',
      workerName: '王丽',
      customerName: '林女士',
      serviceType: '深度清洁',
      startedAt: twoDaysAgoAt(9, 0).toISOString(),
      completedAt: twoDaysAgoAt(13, 0).toISOString(),
      status: 'FOLLOW_UP_REQUIRED',
      summary: '客户反馈卫生间玻璃水渍清理不彻底。',
      extraItems: ['建议安排返工半小时'],
      photoCount: 5,
      customerRating: 3,
    },
  ] as DemoDatabase['serviceRecords']

  const supportTickets: DemoSupportTicket[] = [
    {
      id: 'ticket-001',
      orderId: 'order-20260510-008',
      customerName: '林女士',
      issueType: '服务质量投诉',
      status: 'PROCESSING',
      owner: '客服主管-周婷',
      createdAt: twoDaysAgoAt(17, 0).toISOString(),
      latestUpdate: '已联系客户，待确认返工时间。',
      resolution: '计划安排原工人返工，如客户不接受则改派。',
      compensationAmount: 80,
    },
    {
      id: 'ticket-002',
      orderId: 'order-20260512-006',
      customerName: '刘总',
      issueType: '发票申请',
      status: 'OPEN',
      owner: '客服-王晴',
      createdAt: todayAt(10, 30).toISOString(),
      latestUpdate: '待财务回传电子发票。',
      resolution: '完成开票后短信通知客户。',
      compensationAmount: 0,
    },
    {
      id: 'ticket-003',
      orderId: 'order-20260511-007',
      customerName: '黄阿姨',
      issueType: '表扬反馈',
      status: 'RESOLVED',
      owner: '客服-陈晨',
      createdAt: yesterdayAt(18, 0).toISOString(),
      latestUpdate: '已记录为优质服务案例。',
      resolution: '加入月度优秀工人榜单。',
      compensationAmount: 0,
    },
  ]

  return {
    orders,
    workers,
    serviceRecords,
    paymentRecords,
    supportTickets,
  }
}

function readDatabase() {
  const raw = window.localStorage.getItem(STORAGE_KEY)

  if (!raw) {
    const initial = createInitialDatabase()
    syncAutomatedOrderFlow(initial)
    syncWorkerStatuses(initial)
    writeDatabase(initial)
    return initial
  }

  try {
    const database = JSON.parse(raw) as DemoDatabase
    database.workers = database.workers.map((worker) => ({
      ...worker,
      status: normalizeWorkerStatus(String(worker.status ?? 'IDLE')),
    }))
    syncAutomatedOrderFlow(database)
    syncWorkerStatuses(database)
    writeDatabase(database)
    return database
  } catch {
    const initial = createInitialDatabase()
    syncAutomatedOrderFlow(initial)
    syncWorkerStatuses(initial)
    writeDatabase(initial)
    return initial
  }
}

function writeDatabase(database: DemoDatabase) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(database))
}

function sortByDateDesc<T>(items: T[], getValue: (item: T) => string | null | undefined) {
  return [...items].sort(
    (left, right) => dayjs(getValue(right) ?? 0).valueOf() - dayjs(getValue(left) ?? 0).valueOf(),
  )
}

function getWorkerName(workers: DemoWorker[], workerId?: string) {
  return workers.find((worker) => worker.id === workerId)?.name
}

const CONFIRMED_ORDER_STATUSES: DemoOrderStatus[] = [
  'ACCEPTED',
  'IN_SERVICE',
  'DONE',
  'COMPLETED',
  'PAID',
  'AFTER_SALE',
]

function isConfirmedOrder(status: DemoOrderStatus) {
  return CONFIRMED_ORDER_STATUSES.includes(status)
}

function getOrderTimeRange(order: DemoOrder) {
  const start = dayjs(order.appointmentTime)
  return {
    start,
    end: start.add(order.durationHours, 'hour'),
  }
}

function orderOccupiesMoment(order: DemoOrder, at: dayjs.Dayjs) {
  if (!isConfirmedOrder(order.status)) {
    return false
  }

  const { start, end } = getOrderTimeRange(order)
  return (at.isAfter(start) || at.isSame(start)) && at.isBefore(end)
}

function orderOccupiesRange(order: DemoOrder, rangeStart: dayjs.Dayjs, rangeEnd: dayjs.Dayjs) {
  if (!isConfirmedOrder(order.status)) {
    return false
  }

  const { start, end } = getOrderTimeRange(order)
  return start.isBefore(rangeEnd) && end.isAfter(rangeStart)
}

function normalizeWorkerStatus(status: string): DemoWorkerStatus {
  if (status === 'INACTIVE' || status === 'OFF_DUTY') {
    return 'INACTIVE'
  }

  if (status === 'BUSY' || status === 'ON_JOB') {
    return 'BUSY'
  }

  return 'IDLE'
}

function getWorkerOrders(database: DemoDatabase, workerId: string) {
  return database.orders.filter((order) => order.assignedWorkerId === workerId)
}

function getCurrentWorkerStatus(worker: DemoWorker, orders: DemoOrder[]) {
  if (normalizeWorkerStatus(worker.status) === 'INACTIVE') {
    return 'INACTIVE'
  }

  return orders.some((order) => orderOccupiesMoment(order, dayjs())) ? 'BUSY' : 'IDLE'
}

function getNextAvailableAt(worker: DemoWorker, orders: DemoOrder[]) {
  if (normalizeWorkerStatus(worker.status) === 'INACTIVE') {
    return worker.nextAvailableAt
  }

  const now = dayjs()
  const activeOrderEnds = orders
    .filter((order) => orderOccupiesMoment(order, now))
    .map((order) => getOrderTimeRange(order).end)
    .sort((left, right) => left.valueOf() - right.valueOf())

  return activeOrderEnds[0]?.toISOString() ?? now.toISOString()
}

function syncWorkerStatuses(database: DemoDatabase) {
  database.workers = database.workers.map((worker) => {
    const orders = getWorkerOrders(database, worker.id)
    const todayAssignments = orders.filter((order) =>
      dayjs(order.appointmentTime).isSame(dayjs(), 'day'),
    ).length

    return {
      ...worker,
      status: getCurrentWorkerStatus(worker, orders),
      todayAssignments,
      nextAvailableAt: getNextAvailableAt(worker, orders),
    }
  })
}

function buildDashboardOverview(database: DemoDatabase): DashboardOverview {
  const todayStart = dayjs().startOf('day')
  const paidTodayAmount = database.paymentRecords
    .filter(
      (record) =>
        record.status === 'PAID' &&
        record.paidAt &&
        dayjs(record.paidAt).isAfter(todayStart),
    )
    .reduce((sum, record) => sum + record.amount, 0)

  const completedCount = database.orders.filter((order) => order.status === 'COMPLETED').length

  const statusSet: DemoOrderStatus[] = [
    'CREATED',
    'PENDING',
    'ACCEPTED',
    'IN_SERVICE',
    'DONE',
    'PAID',
    'AFTER_SALE',
    'COMPLETED',
  ]

  return {
    totalOrders: database.orders.length,
    pendingDispatchCount: database.orders.filter((order) => order.status === 'CREATED').length,
    inServiceCount: database.orders.filter((order) => order.status === 'IN_SERVICE').length,
    paidTodayAmount,
    openTicketCount: database.supportTickets.filter((ticket) => ticket.status !== 'RESOLVED')
      .length,
    availableWorkerCount: database.workers.filter((worker) => worker.status === 'IDLE')
      .length,
    completionRate: Math.round((completedCount / Math.max(database.orders.length, 1)) * 100),
    statusDistribution: statusSet.map((status) => ({
      status,
      count: database.orders.filter((order) => order.status === status).length,
    })),
    recentOrders: sortByDateDesc(database.orders, (item) => item.createdAt).slice(0, 5),
    urgentTickets: sortByDateDesc(database.supportTickets, (item) => item.createdAt).slice(0, 3),
    topWorkers: [...database.workers]
      .sort((left, right) => right.rating - left.rating)
      .slice(0, 4),
  }
}

function createServiceRecordFromOrder(order: DemoOrder) {
  return {
    id: `svc-${Date.now()}`,
    orderId: order.id,
    workerId: order.assignedWorkerId ?? '',
    workerName: order.assignedWorkerName ?? '',
    customerName: order.customerName,
    serviceType: order.serviceType,
    startedAt: dayjs().subtract(2, 'hour').toISOString(),
    completedAt: dayjs().toISOString(),
    status: 'COMPLETED',
    summary: '客服演示中自动生成的服务回执记录。',
    extraItems: [],
    photoCount: 3,
    customerRating: 5,
  } as DemoDatabase['serviceRecords'][number]
}

function createPendingPaymentRecordFromOrder(
  order: DemoOrder,
  existingRecord?: DemoPaymentRecord,
): DemoPaymentRecord {
  const workerIncome = Math.round(order.estimatedAmount * 0.6)
  return {
    id: existingRecord?.id ?? `pay-${Date.now()}`,
    orderId: order.id,
    customerName: order.customerName,
    amount: order.estimatedAmount,
    status: 'PENDING',
    channel: existingRecord?.channel ?? '微信支付',
    paidAt: null,
    workerIncome,
    companyIncome: order.estimatedAmount - workerIncome,
  }
}

function createPaymentRecordFromOrder(
  order: DemoOrder,
  existingRecord?: DemoPaymentRecord,
): DemoPaymentRecord {
  const workerIncome = Math.round(order.estimatedAmount * 0.6)
  return {
    id: existingRecord?.id ?? `pay-${Date.now()}`,
    orderId: order.id,
    customerName: order.customerName,
    amount: order.estimatedAmount,
    status: 'PAID',
    channel: existingRecord?.channel ?? '微信支付',
    paidAt:
      existingRecord?.status === 'PAID' && existingRecord.paidAt
        ? existingRecord.paidAt
        : dayjs().toISOString(),
    workerIncome,
    companyIncome: order.estimatedAmount - workerIncome,
  }
}

function getPaymentRecord(database: DemoDatabase, orderId: string) {
  return database.paymentRecords.find((item) => item.orderId === orderId)
}

function upsertPaymentRecord(database: DemoDatabase, paymentRecord: DemoPaymentRecord) {
  const paymentRecordIndex = database.paymentRecords.findIndex(
    (item) => item.orderId === paymentRecord.orderId,
  )

  if (paymentRecordIndex >= 0) {
    database.paymentRecords[paymentRecordIndex] = paymentRecord
    return
  }

  database.paymentRecords.unshift(paymentRecord)
}

function ensureServiceRecord(database: DemoDatabase, order: DemoOrder) {
  if (!database.serviceRecords.some((item) => item.orderId === order.id)) {
    database.serviceRecords.unshift(createServiceRecordFromOrder(order))
  }
}

function syncAutomatedOrderFlow(database: DemoDatabase) {
  const now = dayjs()

  database.orders.forEach((order) => {
    if (
      order.status === 'CREATED' ||
      order.status === 'PENDING' ||
      order.status === 'AFTER_SALE' ||
      order.status === 'COMPLETED'
    ) {
      return
    }

    if (order.status === 'PAID') {
      order.paymentStatus = 'PAID'
      order.latestProgress = '支付完成，待客服确认闭环或进入售后。'
      upsertPaymentRecord(
        database,
        createPaymentRecordFromOrder(order, getPaymentRecord(database, order.id)),
      )
      return
    }

    const appointmentStart = dayjs(order.appointmentTime)
    const appointmentEnd = appointmentStart.add(order.durationHours, 'hour')

    if (
      order.status === 'DONE' &&
      (now.isAfter(appointmentEnd) || now.isSame(appointmentEnd))
    ) {
      order.paymentStatus = 'PENDING'
      ensureServiceRecord(database, order)
      upsertPaymentRecord(
        database,
        createPendingPaymentRecordFromOrder(order, getPaymentRecord(database, order.id)),
      )
      return
    }

    if (
      order.status === 'IN_SERVICE' &&
      (now.isAfter(appointmentEnd) || now.isSame(appointmentEnd))
    ) {
      order.status = 'DONE'
      order.paymentStatus = 'PENDING'
      order.latestProgress = '服务完成，等待客户付款。'
      ensureServiceRecord(database, order)
      upsertPaymentRecord(
        database,
        createPendingPaymentRecordFromOrder(order, getPaymentRecord(database, order.id)),
      )
      return
    }

    if (
      order.status === 'ACCEPTED' &&
      (now.isAfter(appointmentStart) || now.isSame(appointmentStart))
    ) {
      order.status = 'IN_SERVICE'
      order.paymentStatus = 'PENDING'
      order.latestProgress = '工人已到场，服务执行中。'
      return
    }
  })
}

export async function getDashboardOverview() {
  const database = readDatabase()
  return wait(buildDashboardOverview(database))
}

export async function listDemoOrders(filters: OrderFilters = {}) {
  const database = readDatabase()
  const keyword = filters.keyword?.trim().toLowerCase()

  const records = sortByDateDesc(database.orders, (item) => item.createdAt).filter((order) => {
    const matchesKeyword =
      !keyword ||
      [
        order.id,
        order.customerName,
        order.customerPhone,
        order.address,
        order.assignedWorkerName,
      ]
        .filter(Boolean)
        .some((field) => field?.toLowerCase().includes(keyword))

    const matchesStatus = !filters.status || order.status === filters.status
    const matchesServiceType =
      !filters.serviceType || order.serviceType === filters.serviceType

    return matchesKeyword && matchesStatus && matchesServiceType
  })

  return wait(records)
}

export async function createDemoOrder(payload: CreateOrderPayload) {
  const database = readDatabase()
  const order: DemoOrder = {
    id: `order-${dayjs().format('YYYYMMDD-HHmmss')}`,
    customerName: payload.customerName.trim(),
    customerPhone: payload.customerPhone.trim(),
    address: payload.address.trim(),
    serviceType: payload.serviceType.trim(),
    appointmentTime: payload.appointmentTime,
    durationHours: payload.durationHours,
    estimatedAmount: payload.estimatedAmount,
    priority: payload.priority,
    source: payload.source.trim(),
    notes: payload.notes.trim(),
    status: 'CREATED',
    paymentStatus: 'UNPAID',
    createdAt: dayjs().toISOString(),
    latestProgress: '新订单已录入，等待客服派单。',
  }

  database.orders.unshift(order)
  writeDatabase(database)
  return wait(order)
}

export async function assignDemoOrder(orderId: string, workerId: string) {
  const database = readDatabase()
  const order = database.orders.find((item) => item.id === orderId)

  if (!order) {
    throw createLocalizedError('demo.error.orderNotFound')
  }

  const worker = database.workers.find((item) => item.id === workerId)

  if (!worker) {
    throw createLocalizedError('demo.error.workerNotFound')
  }

  order.assignedWorkerId = worker.id
  order.assignedWorkerName = worker.name
  order.status = 'PENDING'
  order.paymentStatus = 'PENDING'
  order.latestProgress = `已派给 ${worker.name}，等待工人确认。`

  worker.todayAssignments += 1
  syncWorkerStatuses(database)
  writeDatabase(database)
  return wait(order)
}

export async function advanceDemoOrder(orderId: string) {
  const database = readDatabase()
  const order = database.orders.find((item) => item.id === orderId)

  if (!order) {
    throw createLocalizedError('demo.error.orderNotFound')
  }

  const currentIndex = ORDER_FLOW.indexOf(order.status)

  if (currentIndex === -1 || currentIndex === ORDER_FLOW.length - 1) {
    return wait(order)
  }

  order.status = ORDER_FLOW[currentIndex + 1]

  if (order.status === 'ACCEPTED') {
    order.latestProgress = '工人已确认接单，待上门服务。'
  } else if (order.status === 'IN_SERVICE') {
    order.latestProgress = '工人已到场，服务执行中。'
  } else if (order.status === 'DONE') {
    order.latestProgress = '服务完成，等待客户付款。'
    ensureServiceRecord(database, order)
    upsertPaymentRecord(
      database,
      createPendingPaymentRecordFromOrder(order, getPaymentRecord(database, order.id)),
    )
  } else if (order.status === 'PAID') {
    order.paymentStatus = 'PAID'
    order.latestProgress = '支付完成，待客服确认闭环或进入售后。'
    upsertPaymentRecord(
      database,
      createPaymentRecordFromOrder(order, getPaymentRecord(database, order.id)),
    )
  }

  syncWorkerStatuses(database)
  writeDatabase(database)
  return wait(order)
}

export async function listDemoWorkers(filters: WorkerFilters = {}) {
  const database = readDatabase()
  const keyword = filters.keyword?.trim().toLowerCase()

  const records = database.workers.filter((worker) => {
    const matchesKeyword =
      !keyword ||
      [worker.id, worker.name, worker.region, worker.skills.join(' ')]
        .some((field) => field.toLowerCase().includes(keyword))
    const matchesStatus = !filters.status || worker.status === filters.status
    return matchesKeyword && matchesStatus
  })

  return wait(records)
}

export async function toggleDemoWorkerStatus(workerId: string) {
  const database = readDatabase()
  const worker = database.workers.find((item) => item.id === workerId)

  if (!worker) {
    throw createLocalizedError('demo.error.workerNotFound')
  }

  worker.status = worker.status === 'INACTIVE' ? 'IDLE' : 'INACTIVE'
  syncWorkerStatuses(database)
  writeDatabase(database)
  return wait(worker)
}

export async function listDemoServiceRecords() {
  const database = readDatabase()
  return wait(sortByDateDesc(database.serviceRecords, (item) => item.startedAt))
}

export async function listDemoPaymentRecords() {
  const database = readDatabase()
  return wait(
    [...database.paymentRecords].sort((left, right) =>
      dayjs(right.paidAt ?? 0).valueOf() - dayjs(left.paidAt ?? 0).valueOf(),
    ),
  )
}

export async function listDemoSupportTickets() {
  const database = readDatabase()
  return wait(sortByDateDesc(database.supportTickets, (item) => item.createdAt))
}

export async function resolveDemoSupportTicket(ticketId: string) {
  const database = readDatabase()
  const ticket = database.supportTickets.find((item) => item.id === ticketId)

  if (!ticket) {
    throw createLocalizedError('demo.error.ticketNotFound')
  }

  ticket.status = 'RESOLVED'
  ticket.latestUpdate = '客服已完成闭环，客户确认满意。'
  ticket.resolution = '本次售后完结，后续纳入工人培训复盘。'

  const order = database.orders.find((item) => item.id === ticket.orderId)

  if (order) {
    order.status = 'COMPLETED'
    order.latestProgress = '售后已处理完成，订单已闭环。'
  }

  writeDatabase(database)
  return wait(ticket)
}

export async function createDemoSupportTicket(orderId: string) {
  const database = readDatabase()
  const order = database.orders.find((item) => item.id === orderId)

  if (!order) {
    throw createLocalizedError('demo.error.orderNotFound')
  }

  const existing = database.supportTickets.find(
    (item) => item.orderId === orderId && item.status !== 'RESOLVED',
  )

  if (existing) {
    return wait(existing)
  }

  const ticket: DemoSupportTicket = {
    id: `ticket-${Date.now()}`,
    orderId: order.id,
    customerName: order.customerName,
    issueType: '演示售后跟进',
    status: 'OPEN',
    owner: '客服-演示账号',
    createdAt: dayjs().toISOString(),
    latestUpdate: '已登记售后诉求，待安排回访。',
    resolution: '先电话回访，再决定返工或退款。',
    compensationAmount: 0,
  }

  if (order.status === 'PAID') {
    order.status = 'AFTER_SALE'
    order.latestProgress = '已登记售后诉求，等待客服处理。'
  }

  database.supportTickets.unshift(ticket)
  writeDatabase(database)
  return wait(ticket)
}

export async function resetDemoDatabase() {
  const initial = createInitialDatabase()
  syncAutomatedOrderFlow(initial)
  syncWorkerStatuses(initial)
  writeDatabase(initial)
  return wait(initial, 120)
}

export async function markDemoOrderCompleted(orderId: string) {
  const database = readDatabase()
  const order = database.orders.find((item) => item.id === orderId)

  if (!order) {
    throw createLocalizedError('demo.error.orderNotFound')
  }

  if (order.status === 'PAID') {
    order.status = 'COMPLETED'
    order.latestProgress = '客服已确认完成，订单已闭环。'
    writeDatabase(database)
  }

  return wait(order)
}

export async function listAssignableWorkers(options?: {
  appointmentTime?: string
  durationHours?: number
}) {
  const database = readDatabase()
  const targetTime = dayjs(options?.appointmentTime)
  const effectiveTime = targetTime.isValid() ? targetTime : dayjs()
  const effectiveDuration = options?.durationHours ?? 1
  const workers = database.workers
    .filter((worker) => normalizeWorkerStatus(worker.status) !== 'INACTIVE')
    .filter((worker) => {
      const orders = getWorkerOrders(database, worker.id)
      return !orders.some((order) =>
        orderOccupiesRange(order, effectiveTime, effectiveTime.add(effectiveDuration, 'hour')),
      )
    })
    .map((worker) => ({
      ...worker,
      displayName: `${worker.name} · ${worker.region} · ${worker.skills.join(' / ')}`,
    }))
  return wait(workers)
}

export async function listDemoWorkersForDispatch(params: {
  serviceType?: string
  region?: string
  atTime?: string
  limit?: number
}) {
  const database = readDatabase()
  const targetTime = dayjs(params.atTime)
  const effectiveTime = targetTime.isValid() ? targetTime : dayjs()
  const normalizedRegion = params.region?.trim().toLowerCase()
  const normalizedServiceType = params.serviceType?.trim().toLowerCase()

  const workers = database.workers
    .filter((worker) => normalizeWorkerStatus(worker.status) !== 'INACTIVE')
    .filter((worker) => {
      const orders = getWorkerOrders(database, worker.id)
      return !orders.some((order) => orderOccupiesMoment(order, effectiveTime))
    })
    .filter((worker) => {
      if (!normalizedRegion) {
        return true
      }

      return worker.region.toLowerCase().includes(normalizedRegion)
    })
    .filter((worker) => {
      if (!normalizedServiceType) {
        return true
      }

      return worker.skills.some((skill) => skill.toLowerCase().includes(normalizedServiceType))
    })

  return wait(workers.slice(0, params.limit ?? workers.length))
}

export async function getWorkerScheduleSnapshot() {
  const database = readDatabase()
  const items = database.workers.map((worker) => ({
    ...worker,
    orders: getWorkerOrders(database, worker.id),
    latestOrderName: getWorkerName(database.workers, worker.id),
  }))
  return wait(items)
}
function createLocalizedError(key: string) {
  return new Error(translateMessage(getStoredLocale(), key))
}
