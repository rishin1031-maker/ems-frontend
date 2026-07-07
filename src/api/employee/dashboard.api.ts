import { apiGet } from '@/api/client'
import { mergeDashboardLiveStats, normalizeLeaveBalance } from '@/lib/liveStats'
import type { NormalizedLeaveBalance } from '@/lib/liveStats'
import type { EmployeeLiveStats } from '@/api/employee/attendance.api'
import { TARGET_WORK_SECONDS } from '@/lib/constants'

export interface EmployeeDashboardData {
  employee?: Record<string, unknown>
  today_attendance?: Record<string, unknown> | null
  live_stats?: EmployeeLiveStats | null
  leave_balance?: NormalizedLeaveBalance
  pending_leaves?: number
  recent_attendance?: Record<string, unknown>[]
  recent_leaves?: Record<string, unknown>[]
  monthly_earnings?: {
    month?: string
    work_hours?: number
    target_hours?: number
    progress_percent?: number
    base_net?: number
    earned_net?: number
    remaining_hours?: number
    is_full_month?: boolean
  } | null
  current_salary?: Record<string, unknown> | null
}

export const employeeDashboardApi = {
  get: async (): Promise<EmployeeDashboardData> => {
    const raw = await apiGet<Record<string, unknown>>('/employee/dashboard')
    const todayAttendance = raw.today_attendance as Record<string, unknown> | null | undefined
    const liveStatsRaw = raw.live_stats as Record<string, unknown> | null | undefined

    return {
      ...raw,
      live_stats: mergeDashboardLiveStats(
        todayAttendance,
        liveStatsRaw,
        TARGET_WORK_SECONDS,
      ) as EmployeeLiveStats,
      leave_balance: normalizeLeaveBalance(raw.leave_balance),
    }
  },
}
