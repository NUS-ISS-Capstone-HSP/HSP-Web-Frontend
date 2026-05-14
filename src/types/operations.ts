export type DemoOrderStatus =
  | 'CREATED'
  | 'PENDING'
  | 'ACCEPTED'
  | 'IN_SERVICE'
  | 'DONE'
  | 'COMPLETED'
  | 'PAID'
  | 'AFTER_SALE'

export type DemoPaymentStatus = 'UNPAID' | 'PENDING' | 'PAID' | 'REFUNDED'

export type DemoWorkerStatus = 'IDLE' | 'BUSY' | 'INACTIVE'

export type DemoServiceStatus = 'IN_PROGRESS' | 'COMPLETED' | 'FOLLOW_UP_REQUIRED'

export type DemoTicketStatus = 'OPEN' | 'PROCESSING' | 'RESOLVED'

export interface DemoOrder {
  id: string
  customerName: string
  customerPhone: string
  address: string
  serviceType: string
  appointmentTime: string
  durationHours: number
  estimatedAmount: number
  priority: 'LOW' | 'MEDIUM' | 'HIGH'
  source: string
  notes: string
  status: DemoOrderStatus
  paymentStatus: DemoPaymentStatus
  createdAt: string
  assignedWorkerId?: string
  assignedWorkerName?: string
  latestProgress: string
}

export interface DemoWorker {
  id: string
  name: string
  phone: string
  region: string
  skills: string[]
  rating: number
  status: DemoWorkerStatus
  employmentType: '全职' | '兼职'
  todayAssignments: number
  nextAvailableAt: string
}

export interface DemoServiceRecord {
  id: string
  orderId: string
  workerId: string
  workerName: string
  customerName: string
  serviceType: string
  startedAt: string
  completedAt: string | null
  status: DemoServiceStatus
  summary: string
  extraItems: string[]
  photoCount: number
  customerRating: number | null
}

export interface DemoPaymentRecord {
  id: string
  orderId: string
  customerName: string
  amount: number
  status: DemoPaymentStatus
  channel: '微信支付' | '现金' | '线下转账'
  paidAt: string | null
  workerIncome: number
  companyIncome: number
}

export interface DemoSupportTicket {
  id: string
  orderId: string
  customerName: string
  issueType: string
  status: DemoTicketStatus
  owner: string
  createdAt: string
  latestUpdate: string
  resolution: string
  compensationAmount: number
}

export interface DemoDatabase {
  orders: DemoOrder[]
  workers: DemoWorker[]
  serviceRecords: DemoServiceRecord[]
  paymentRecords: DemoPaymentRecord[]
  supportTickets: DemoSupportTicket[]
}

export interface OrderFilters {
  keyword?: string
  status?: DemoOrderStatus
  serviceType?: string
}

export interface WorkerFilters {
  keyword?: string
  status?: DemoWorkerStatus
}

export interface DashboardOverview {
  totalOrders: number
  pendingDispatchCount: number
  inServiceCount: number
  paidTodayAmount: number
  openTicketCount: number
  availableWorkerCount: number
  completionRate: number
  statusDistribution: Array<{ status: DemoOrderStatus; count: number }>
  recentOrders: DemoOrder[]
  urgentTickets: DemoSupportTicket[]
  topWorkers: DemoWorker[]
}

export interface CreateOrderPayload {
  customerName: string
  customerPhone: string
  address: string
  serviceType: string
  appointmentTime: string
  durationHours: number
  estimatedAmount: number
  priority: 'LOW' | 'MEDIUM' | 'HIGH'
  source: string
  notes: string
}
