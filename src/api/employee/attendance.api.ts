import { apiGet, apiPost } from '@/api/client'
import {
  extractLiveStatsFromMutationResponse,
  mergeDashboardLiveStats,
  normalizeLiveStats,
} from '@/lib/liveStats'
import { normalizeWorkHoursChart, type WorkHoursChartData } from '@/api/types/workHoursChart'
import type { AttendanceBreak, AttendanceStatus } from '@/api/types/attendance'
import { TARGET_WORK_SECONDS } from '@/lib/constants'

export type EmployeeLiveStats = ReturnType<typeof normalizeLiveStats> & Record<string, unknown>

export interface EmployeeAttendanceDay {
  id?: number
  date: string
  status?: AttendanceStatus
  check_in?: string | null
  check_out?: string | null
  net_hours_worked?: string | number
  net_seconds?: number
  total_break_minutes?: number
  breaks?: AttendanceBreak[]
  marked_by?: string
  is_eight_hours_complete?: boolean
  is_complete?: boolean
  note?: string | null
}

export interface EmployeeAttendanceSummary {
  present?: number
  absent?: number
  half_day?: number
  on_leave?: number
  present_days?: number
  absent_days?: number
  half_days?: number
  on_leave_days?: number
}

export interface EmployeeChartsParams {
  view?: 'daily' | 'weekly' | 'monthly'
  date?: string
  month?: string
}

export interface CheckOutPayload {
  early_reason?: string
}

function normalizeSummary(raw?: EmployeeAttendanceSummary): EmployeeAttendanceSummary {
  if (!raw) return {}
  return {
    present: raw.present ?? raw.present_days,
    absent: raw.absent ?? raw.absent_days,
    half_day: raw.half_day ?? raw.half_days,
    on_leave: raw.on_leave ?? raw.on_leave_days,
  }
}

function normalizeAttendanceDay(raw: Record<string, unknown>): EmployeeAttendanceDay {
  return {
    id: raw.id as number | undefined,
    date: String(raw.date ?? ''),
    status: raw.status as AttendanceStatus | undefined,
    check_in: (raw.check_in as string) ?? null,
    check_out: (raw.check_out as string) ?? null,
    net_hours_worked: raw.net_hours_worked as string | number | undefined,
    total_break_minutes: raw.total_break_minutes as number | undefined,
    breaks: (raw.breaks as AttendanceBreak[]) ?? [],
    marked_by: raw.marked_by as string | undefined,
    is_complete: Boolean(raw.is_eight_hours_complete ?? raw.is_complete),
    note: raw.note as string | null | undefined,
  }
}

export const employeeAttendanceApi = {
  monthly: async (params?: { month?: string }) => {
    const raw = await apiGet<{
      month?: string
      summary?: EmployeeAttendanceSummary
      attendances?: Record<string, unknown>[]
    }>('/employee/attendance', params as Record<string, unknown>)

    return {
      items: (raw.attendances ?? []).map(normalizeAttendanceDay),
      summary: normalizeSummary(raw.summary),
      month: raw.month,
    }
  },

  charts: async (params?: EmployeeChartsParams): Promise<WorkHoursChartData> => {
    const raw = await apiGet<unknown>('/employee/attendance/charts', params as Record<string, unknown>)
    return normalizeWorkHoursChart(raw)
  },

  liveStatus: async (): Promise<EmployeeLiveStats> => {
    const raw = await apiGet<Record<string, unknown>>('/employee/attendance/live-status')
    if (raw.checked_in === false) {
      return normalizeLiveStats({ checked_in: false }) as EmployeeLiveStats
    }
    return normalizeLiveStats(raw) as EmployeeLiveStats
  },

  checkIn: async (): Promise<EmployeeLiveStats> => {
    const raw = await apiPost<Record<string, unknown>>('/employee/attendance/check-in')
    return extractLiveStatsFromMutationResponse(raw) as EmployeeLiveStats
  },

  checkOut: async (payload?: CheckOutPayload): Promise<EmployeeLiveStats> => {
    const raw = await apiPost<Record<string, unknown>>('/employee/attendance/check-out', payload)
    const stats = extractLiveStatsFromMutationResponse(raw)
    return { ...stats, checked_out: true, is_checked_in: false } as EmployeeLiveStats
  },

  breakStart: async (): Promise<EmployeeLiveStats> => {
    const raw = await apiPost<Record<string, unknown>>('/employee/attendance/break/start')
    return extractLiveStatsFromMutationResponse(raw) as EmployeeLiveStats
  },

  breakEnd: async (): Promise<EmployeeLiveStats> => {
    const raw = await apiPost<Record<string, unknown>>('/employee/attendance/break/end')
    return extractLiveStatsFromMutationResponse(raw) as EmployeeLiveStats
  },
}
