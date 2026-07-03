import type { WorkHoursChartSummary } from '@/api/types/workHoursChart'

export interface AdminStatusBreakdown {
  present?: number
  absent?: number
  half_day?: number
  on_leave?: number
  not_marked?: number
}

export interface AdminAttendanceChartData {
  view: 'daily' | 'weekly' | 'monthly' | 'yearly'
  period_label?: string
  labels: string[]
  present: number[]
  absent: number[]
  half_day: number[]
  on_leave: number[]
  work_hours: number[]
  break_hours: number[]
  status_breakdown?: AdminStatusBreakdown
  summary: WorkHoursChartSummary & { total_present?: number }
  has_data: boolean
}

export function normalizeAdminAttendanceChart(raw: unknown): AdminAttendanceChartData {
  const data = (raw ?? {}) as Record<string, unknown>
  return {
    view: (data.view as AdminAttendanceChartData['view']) ?? 'weekly',
    period_label: data.period_label as string | undefined,
    labels: Array.isArray(data.labels) ? (data.labels as string[]) : [],
    present: Array.isArray(data.present) ? (data.present as number[]) : [],
    absent: Array.isArray(data.absent) ? (data.absent as number[]) : [],
    half_day: Array.isArray(data.half_day) ? (data.half_day as number[]) : [],
    on_leave: Array.isArray(data.on_leave) ? (data.on_leave as number[]) : [],
    work_hours: Array.isArray(data.work_hours) ? (data.work_hours as number[]) : [],
    break_hours: Array.isArray(data.break_hours) ? (data.break_hours as number[]) : [],
    status_breakdown: data.status_breakdown as AdminStatusBreakdown | undefined,
    summary: (data.summary ?? {}) as AdminAttendanceChartData['summary'],
    has_data: Boolean(data.has_data ?? (Array.isArray(data.labels) && (data.labels as unknown[]).length > 0)),
  }
}
