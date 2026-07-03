import { apiDelete, apiGet, apiPost } from '@/api/client'
import type { Leave, LeaveListResponse } from '@/api/types/leave'
import type { ApplyLeavePayload } from '@/api/types/leave'
import type { LeaveType, LeaveStatus } from '@/lib/constants'
import type { PaginationParams } from '@/api/types/common'
import { normalizeLeaveBalance, type NormalizedLeaveBalance } from '@/lib/liveStats'

export type LeaveBalance = NormalizedLeaveBalance

export interface EmployeeLeaveListParams extends PaginationParams {
  status?: LeaveStatus | ''
  type?: LeaveType | ''
}

export interface EmployeeLeaveListResult {
  balance: LeaveBalance
  leaves: LeaveListResponse
}

function normalizeLeaveList(raw: unknown): LeaveListResponse {
  if (Array.isArray(raw)) {
    return {
      items: raw as Leave[],
      meta: { current_page: 1, last_page: 1, per_page: raw.length, total: raw.length },
    }
  }
  const data = raw as LeaveListResponse
  return {
    items: data.items ?? [],
    meta: data.meta ?? {
      current_page: 1,
      last_page: 1,
      per_page: data.items?.length ?? 0,
      total: data.items?.length ?? 0,
    },
  }
}

export const employeeLeavesApi = {
  list: async (params?: EmployeeLeaveListParams): Promise<EmployeeLeaveListResult> => {
    const raw = await apiGet<{
      balance?: unknown
      leaves?: unknown
    }>('/employee/leaves', params as Record<string, unknown>)

    if (raw.leaves != null) {
      return {
        balance: normalizeLeaveBalance(raw.balance),
        leaves: normalizeLeaveList(raw.leaves),
      }
    }

    return {
      balance: normalizeLeaveBalance(raw.balance),
      leaves: normalizeLeaveList(raw),
    }
  },

  balance: async () => {
    const raw = await apiGet<unknown>('/employee/leaves/balance')
    return normalizeLeaveBalance(raw)
  },

  get: (id: number | string) => apiGet<Leave>(`/employee/leaves/${id}`),

  apply: (payload: ApplyLeavePayload) => apiPost<Leave>('/employee/leaves', payload),

  cancel: (id: number | string) => apiDelete<null>(`/employee/leaves/${id}`),
}

export type { ApplyLeavePayload }
