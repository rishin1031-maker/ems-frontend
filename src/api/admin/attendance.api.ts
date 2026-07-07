import { apiDelete, apiGet, apiPost } from '@/api/client'
import type {
  AddBreakPayload,
  AttendanceBreak,
  AttendanceChartData,
  AttendanceChartsParams,
  AttendanceEmployee,
  AttendanceStatistics,
  AttendanceStatus,
  DailyAttendanceParams,
  DailyAttendanceRecord,
  LiveStatusData,
  MarkAttendancePayload,
  MonthlyAttendanceParams,
  MonthlyAttendanceRecord,
} from '@/api/types/attendance'

interface DailyApiItem {
  employee: AttendanceEmployee
  attendance: {
    id?: number
    status?: AttendanceStatus
    check_in?: string | null
    check_out?: string | null
    net_hours_worked?: string | number
    total_break_minutes?: number
    is_eight_hours_complete?: boolean
    marked_by?: string
    note?: string | null
    breaks?: AttendanceBreak[]
  } | null
}

function normalizeDailyRecord(date: string, item: DailyApiItem): DailyAttendanceRecord {
  const att = item.attendance

  return {
    id: att?.id,
    employee_id: item.employee.id,
    employee: item.employee,
    date,
    status: att?.status ?? ('absent' as AttendanceStatus),
    check_in: att?.check_in ?? null,
    check_out: att?.check_out ?? null,
    net_hours_worked: att?.net_hours_worked,
    total_break_minutes: att?.total_break_minutes,
    breaks: att?.breaks ?? [],
    marked_by: att?.marked_by,
    note: att?.note,
    is_complete: att?.is_eight_hours_complete,
  }
}

function normalizeMonthlyRecord(raw: Record<string, unknown>): MonthlyAttendanceRecord {
  const employee = raw.employee as AttendanceEmployee | undefined
  return {
    employee_id: employee?.id ?? Number(raw.employee_id ?? 0),
    employee,
    month: '',
    present_days: raw.present as number | undefined,
    absent_days: raw.absent as number | undefined,
    half_days: raw.half_day as number | undefined,
    on_leave_days: raw.on_leave as number | undefined,
    not_marked_days: raw.not_marked as number | undefined,
    early_checkouts: raw.early_checkouts as number | undefined,
  }
}

export const adminAttendanceApi = {
  daily: async (params?: DailyAttendanceParams) => {
    const raw = await apiGet<{ date: string; items: DailyApiItem[] }>(
      '/admin/attendance/daily',
      params as Record<string, unknown>,
    )
    const date = raw.date ?? params?.date ?? new Date().toISOString().slice(0, 10)
    return (raw.items ?? []).map((item) => normalizeDailyRecord(date, item))
  },

  monthly: async (params?: MonthlyAttendanceParams) => {
    const raw = await apiGet<{ month: string; report: Record<string, unknown>[] }>(
      '/admin/attendance/monthly',
      params as Record<string, unknown>,
    )
    return (raw.report ?? []).map(normalizeMonthlyRecord)
  },

  statistics: () => apiGet<AttendanceStatistics>('/admin/attendance/statistics'),

  charts: async (params?: AttendanceChartsParams) => {
    const raw = await apiGet<unknown>('/admin/attendance/charts', params as Record<string, unknown>)
    const { normalizeAdminAttendanceChart } = await import('@/api/types/adminAttendanceChart')
    return normalizeAdminAttendanceChart(raw)
  },

  liveStatus: async (params?: { date?: string; search?: string; department_id?: number | string; designation_id?: number | string }) => {
    const raw = await apiGet<{
      is_today?: boolean
      count?: number
      employees?: Array<Record<string, unknown>>
    }>('/admin/attendance/live-status', params as Record<string, unknown>)

    const employees = (raw.employees ?? []).map((w) => ({
      employee_id: Number(w.employee_id),
      employee: {
        id: Number(w.employee_id),
        employee_id: String(w.employee_code ?? ''),
        name: String(w.name ?? ''),
        department: w.department ? { id: 0, name: String(w.department) } : null,
        designation: w.designation ? { id: 0, name: String(w.designation) } : null,
      },
      check_in: w.check_in_time as string | undefined,
      net_seconds: Number(w.net_seconds ?? 0),
      break_seconds: Number(w.total_break_seconds ?? 0),
      total_break_seconds: Number(w.total_break_seconds ?? 0),
      is_on_break: Boolean(w.on_break),
      is_complete: Boolean(w.is_complete),
    }))

    return { date: params?.date ?? '', employees, count: raw.count ?? employees.length }
  },

  mark: (payload: MarkAttendancePayload) =>
    apiPost<unknown>('/admin/attendance/mark', payload),

  addBreak: (payload: AddBreakPayload) =>
    apiPost<unknown>('/admin/attendance/breaks', payload),

  deleteBreak: (id: number | string) =>
    apiDelete<null>(`/admin/attendance/breaks/${id}`),
}
