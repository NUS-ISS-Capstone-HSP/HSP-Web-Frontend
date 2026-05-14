import { http } from '@/services/http'
import { listDemoWorkersForDispatch } from '@/services/demo'

export interface DispatchRecord {
  dispatch_id: string
  order_id: string
  attempt_no: number
  worker_id: string
  operator_id: string
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED'
  assigned_at: string
  responded_at: string | null
  reject_reason: string | null
}

export interface AvailableWorker {
  worker_id: string
  name: string
  skills: string[]
  status: string
}

export interface ListAvailableWorkersParams {
  service_type?: string
  region?: string
  at_time?: string
  limit?: number
}

export interface ManualDispatchPayload {
  order_id: string
  worker_id: string
}

interface ApiEnvelope<T> {
  code: number
  message: string
  data: T
}

interface AvailableWorkersResponse {
  workers: AvailableWorker[]
}

interface DispatchHistoryResponse {
  dispatches: DispatchRecord[]
}

async function createMockWorkers(params: ListAvailableWorkersParams): Promise<AvailableWorker[]> {
  const workers = await listDemoWorkersForDispatch({
    serviceType: params.service_type,
    region: params.region,
    atTime: params.at_time,
    limit: params.limit,
  })

  return workers.map((worker) => ({
    worker_id: worker.id,
    name: worker.name,
    skills: worker.skills,
    status: worker.status,
  }))
}

function createMockDispatch(payload: ManualDispatchPayload): DispatchRecord {
  const assignedAt = new Date().toISOString()

  return {
    dispatch_id: `dispatch-${Date.now()}`,
    order_id: payload.order_id,
    attempt_no: 1,
    worker_id: payload.worker_id,
    operator_id: payload.operator_id,
    status: 'PENDING',
    assigned_at: assignedAt,
    responded_at: null,
    reject_reason: null,
  }
}

function createMockHistory(orderId: string): DispatchRecord[] {
  const latest = new Date()
  const previous = new Date(Date.now() - 45 * 60 * 1000)

  return [
    {
      dispatch_id: `dispatch-${orderId}-2`,
      order_id: orderId,
      attempt_no: 2,
      worker_id: 'worker-001',
      operator_id: 'csr-demo-001',
      status: 'PENDING',
      assigned_at: latest.toISOString(),
      responded_at: null,
      reject_reason: null,
    },
    {
      dispatch_id: `dispatch-${orderId}-1`,
      order_id: orderId,
      attempt_no: 1,
      worker_id: 'worker-005',
      operator_id: 'csr-demo-001',
      status: 'REJECTED',
      assigned_at: previous.toISOString(),
      responded_at: new Date(previous.getTime() + 10 * 60 * 1000).toISOString(),
      reject_reason: '工人已在外区服务，无法准时到达',
    },
  ]
}

function unwrapData<T>(payload: T | ApiEnvelope<T>): T {
  if (
    typeof payload === 'object' &&
    payload !== null &&
    'code' in payload &&
    'data' in payload
  ) {
    return (payload as ApiEnvelope<T>).data
  }

  return payload as T
}

export async function listAvailableWorkers(params: ListAvailableWorkersParams) {
  try {
    const response = await http.get<
      AvailableWorkersResponse | ApiEnvelope<AvailableWorkersResponse>
    >('/dispatch/v1/workers/available', { params })

    return unwrapData(response.data)
  } catch {
    return {
      workers: await createMockWorkers(params),
    }
  }
}

export async function manualAssignOrder(payload: ManualDispatchPayload) {
  try {
    const response = await http.post<DispatchRecord | ApiEnvelope<DispatchRecord>>(
      '/dispatch/v1/dispatches/manual',
      payload,
    )

    return unwrapData(response.data)
  } catch {
    return createMockDispatch(payload)
  }
}

export async function getOrderDispatchHistory(orderId: string) {
  try {
    const response = await http.get<
      DispatchHistoryResponse | ApiEnvelope<DispatchHistoryResponse>
    >(`/dispatch/v1/orders/${encodeURIComponent(orderId)}/dispatch-history`)

    return unwrapData(response.data)
  } catch {
    return {
      dispatches: createMockHistory(orderId),
    }
  }
}
