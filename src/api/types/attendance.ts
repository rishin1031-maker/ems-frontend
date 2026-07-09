export type LeaveType = 'casual' | 'sick' | 'annual'
export type LeaveStatus = 'pending' | 'approved' | 'rejected'
export type AttendanceStatus = 'present' | 'absent' | 'half_day' | 'on_leave'
export type ChartView = 'daily' | 'weekly' | 'monthly' | 'yearly'

export interface AttendanceEmployee {
  id: number
  employee_id: string
  name: string
  department?: { id: number; name: string } | null
  designation?: { id: number; name: string } | null
}

export interface AttendanceBreak {
  id: number
  break_out?: string | null
  break_in?: string | null
  duration?: string
  marked_by?: string
}

export interface DailyAttendanceRecord {
  id?: number
  employee_id: number
  employee?: AttendanceEmployee
  date: string
  status: AttendanceStatus
  check_in?: string | null
  check_out?: string | null
  net_seconds?: number
  net_hours_worked?: string | number
  break_seconds?: number
  total_break_minutes?: number
  breaks?: AttendanceBreak[]
  marked_by?: string
  gross_seconds?: number
  is_complete?: boolean
  note?: string | null
}

export interface DailyAttendanceParams {
  date?: string
  search?: string
  department_id?: number | string
  designation_id?: number | string
  employee_id?: number | string
}

export interface MonthlyAttendanceRecord {
  employee_id: number
  employee?: AttendanceEmployee
  month: string
  present_days?: number
  absent_days?: number
  half_days?: number
  on_leave_days?: number
  not_marked_days?: number
  early_checkouts?: number
  total_net_seconds?: number
  total_net_hours?: number
  target_hours?: number
}

export interface MonthlyAttendanceParams {
  month?: string
  search?: string
  department_id?: number | string
}

export interface AttendanceStatistics {
  today?: { present?: number; absent?: number; on_leave?: number; half_day?: number }
  week?: { present?: number; absent?: number; avg_hours?: number }
  month?: { present?: number; absent?: number; avg_hours?: number; total_hours?: number }
  year?: { present?: number; total_hours?: number }
  [key: string]: unknown
}

export interface ChartDataPoint {
  label: string
  value: number
  present?: number
  absent?: number
  hours?: number
}

export interface AttendanceChartData {
  labels: string[]
  datasets: Array<{
    label: string
    data: number[]
    [key: string]: unknown
  }>
  chart_view?: ChartView
}

export interface AttendanceChartsParams {
  chart_view?: ChartView
  date?: string
  month?: string
  year?: string
}

export interface LiveWorkingEmployee {
  employee_id: number
  employee?: AttendanceEmployee
  check_in?: string
  net_seconds: number
  break_seconds?: number
  total_break_seconds?: number
  is_on_break?: boolean
  is_complete?: boolean
  target_seconds?: number
  remaining_seconds?: number
}

export interface LiveStatusData {
  date: string
  employees: LiveWorkingEmployee[]
  count?: number
}

export interface MarkAttendancePayload {
  employee_id: number
  date: string
  status: AttendanceStatus
  check_in?: string
  check_out?: string
}

export interface AddBreakPayload {
  attendance_id: number
  break_out: string
  break_in?: string
}
