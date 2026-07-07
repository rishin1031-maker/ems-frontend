import { apiGet } from '@/api/client'
import type { PaginatedResponse, PaginationParams } from '@/api/types/auth'

export interface ActivityLog {
  id: number
  event: string
  description: string
  subject_type?: string | null
  subject_id?: number | null
  subject_label?: string | null
  causer_type?: string | null
  causer_id?: number | null
  causer_name?: string | null
  properties?: Record<string, unknown> | null
  ip_address?: string | null
  created_at?: string
}

export interface ActivityLogListParams extends PaginationParams {
  event?: string
  search?: string
  from_date?: string
  to_date?: string
  subject_type?: string
}

export type ActivityLogListResponse = PaginatedResponse<ActivityLog>

export const ACTIVITY_EVENTS = ['created', 'updated', 'deleted', 'login', 'logout'] as const

export const adminActivityLogsApi = {
  list: (params?: ActivityLogListParams) =>
    apiGet<ActivityLogListResponse>('/admin/activity-logs', params as Record<string, unknown>),
}
