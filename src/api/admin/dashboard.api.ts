import { apiGet } from '@/api/client'

export interface AdminDashboardData {
  stats?: {
    total_employees?: number
    active_employees?: number
    inactive_employees?: number
    present_today?: number
    absent_today?: number
    not_marked_today?: number
    on_leave_today?: number
    pending_leaves?: number
    total_departments?: number
    total_designations?: number
    [key: string]: unknown
  }
  recent_employees?: Array<Record<string, unknown>>
  recent_leaves?: Array<Record<string, unknown>>
}

function asRecord(value: unknown): Record<string, unknown> {
  return value != null && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {}
}

export function normalizeAdminDashboard(raw: unknown): AdminDashboardData {
  const data = asRecord(raw)
  const employees = asRecord(data.employees)
  const attendanceToday = asRecord(data.attendance_today)

  return {
    stats: {
      total_employees: employees.total as number | undefined,
      active_employees: employees.active as number | undefined,
      inactive_employees: employees.inactive as number | undefined,
      present_today: attendanceToday.present as number | undefined,
      absent_today: attendanceToday.absent as number | undefined,
      not_marked_today: attendanceToday.not_marked as number | undefined,
      pending_leaves: data.pending_leaves as number | undefined,
      total_departments: data.departments as number | undefined,
      total_designations: data.designations as number | undefined,
    },
    recent_employees: (data.recent_employees ?? employees.recent) as AdminDashboardData['recent_employees'],
    recent_leaves: data.recent_leaves as AdminDashboardData['recent_leaves'],
  }
}

export const adminDashboardApi = {
  get: async () => {
    const raw = await apiGet<unknown>('/admin/dashboard')
    return normalizeAdminDashboard(raw)
  },
}
