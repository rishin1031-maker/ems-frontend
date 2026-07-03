export interface WorkHoursChartSummary {
  total_work_hours?: number
  total_work_minutes?: number
  total_break_hours?: number
  total_break_minutes?: number
  avg_work_hours?: number
  avg_work_minutes?: number
  target_hours?: number
  target_minutes?: number
  progress_percent?: number
  target_complete?: boolean
  remaining_hours?: number
  remaining_minutes?: number
  days_worked?: number
}

export interface WorkHoursChartData {
  view: 'daily' | 'weekly' | 'monthly'
  period_label?: string
  week_start?: string
  labels: string[]
  work_hours: number[]
  break_hours: number[]
  summary: WorkHoursChartSummary
  has_data: boolean
}

export function normalizeWorkHoursChart(raw: unknown): WorkHoursChartData {
  const data = (raw ?? {}) as Record<string, unknown>
  const labels = Array.isArray(data.labels) ? (data.labels as string[]) : []
  const workHours = Array.isArray(data.work_hours) ? (data.work_hours as number[]) : []
  const breakHours = Array.isArray(data.break_hours) ? (data.break_hours as number[]) : []
  const summary = (data.summary ?? {}) as WorkHoursChartSummary

  return {
    view: (data.view as WorkHoursChartData['view']) ?? 'weekly',
    period_label: data.period_label as string | undefined,
    week_start: data.week_start as string | undefined,
    labels,
    work_hours: workHours,
    break_hours: breakHours,
    summary,
    has_data: Boolean(data.has_data ?? labels.length > 0),
  }
}
