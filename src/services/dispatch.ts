import { http } from '@/services/http'

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

interface ManualDispatchResponse {
  dispatch: DispatchRecord
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
  const response = await http.get<AvailableWorkersResponse | ApiEnvelope<AvailableWorkersResponse>>(
    '/dispatch/v1/workers/available',
    { params },
  )

  return unwrapData(response.data)
}

export async function manualAssignOrder(payload: ManualDispatchPayload) {
  const response = await http.post<ManualDispatchResponse | ApiEnvelope<ManualDispatchResponse>>(
    '/dispatch/v1/assignments/manual',
    payload,
  )

  return unwrapData(response.data)
}

export async function getOrderDispatchHistory(orderId: string) {
  const response = await http.get<DispatchHistoryResponse | ApiEnvelope<DispatchHistoryResponse>>(
    `/dispatch/v1/orders/${encodeURIComponent(orderId)}/history`,
  )

  return unwrapData(response.data)
}
