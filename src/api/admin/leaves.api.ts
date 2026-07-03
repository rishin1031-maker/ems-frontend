import { apiDelete, apiGet, apiPost } from '@/api/client'
import type {
  CreateLeavePayload,
  Leave,
  LeaveActionPayload,
  LeaveListParams,
  LeaveListResponse,
} from '@/api/types/leave'

export const adminLeavesApi = {
  list: (params?: LeaveListParams) =>
    apiGet<LeaveListResponse>('/admin/leaves', params as Record<string, unknown>),

  get: (id: number | string) => apiGet<Leave>(`/admin/leaves/${id}`),

  create: (payload: CreateLeavePayload) => apiPost<Leave>('/admin/leaves', payload),

  approve: (id: number | string, payload?: LeaveActionPayload) =>
    apiPost<Leave>(`/admin/leaves/${id}/approve`, payload),

  reject: (id: number | string, payload?: LeaveActionPayload) =>
    apiPost<Leave>(`/admin/leaves/${id}/reject`, payload),
}
