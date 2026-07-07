import type { Employee } from '@/api/types/employee'
import type { AdminAttendanceChartData } from '@/api/types/adminAttendanceChart'

export const DEPARTMENT_CHART_COLORS = [
  '#3b82f6',
  '#22c55e',
  '#f97316',
  '#a855f7',
  '#ec4899',
  '#14b8a6',
  '#64748b',
]

export interface DepartmentSlice {
  name: string
  count: number
  percent: number
  color: string
}

export function buildDepartmentDistribution(employees: Employee[]): DepartmentSlice[] {
  if (!employees.length) return []

  const counts = new Map<string, number>()
  for (const emp of employees) {
    const dept = emp.department?.name?.trim() || 'Unassigned'
    counts.set(dept, (counts.get(dept) ?? 0) + 1)
  }

  const total = employees.length
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([name, count], index) => ({
      name,
      count,
      percent: Math.round((count / total) * 100),
      color: DEPARTMENT_CHART_COLORS[index % DEPARTMENT_CHART_COLORS.length],
    }))
}

export function buildWeeklyAttendanceOverview(
  chart: AdminAttendanceChartData | undefined,
  totalEmployees: number,
): { labels: string[]; values: number[] } {
  if (!chart?.labels?.length) return { labels: [], values: [] }

  const denom = totalEmployees > 0 ? totalEmployees : 1
  const labels = chart.labels.map((label) => {
    const parts = label.split(/[\s,]+/)
    const day = parts[0] ?? label
    return day.length > 3 ? day.slice(0, 3) : day
  })

  const values = (chart.present ?? []).map((present) =>
    Math.min(100, Math.round((Number(present) / denom) * 100)),
  )

  return { labels, values }
}

export interface UpcomingBirthday {
  employee: Employee
  displayDate: string
  daysUntil: number
  isToday: boolean
}

export function getUpcomingBirthdays(employees: Employee[], limit = 5): UpcomingBirthday[] {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const upcoming: UpcomingBirthday[] = []

  for (const employee of employees) {
    if (!employee.dob) continue
    const dob = new Date(employee.dob)
    if (Number.isNaN(dob.getTime())) continue

    let next = new Date(today.getFullYear(), dob.getMonth(), dob.getDate())
    if (next < today) {
      next = new Date(today.getFullYear() + 1, dob.getMonth(), dob.getDate())
    }

    const daysUntil = Math.round((next.getTime() - today.getTime()) / 86_400_000)
    if (daysUntil > 60) continue

    upcoming.push({
      employee,
      displayDate: next.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
      daysUntil,
      isToday: daysUntil === 0,
    })
  }

  return upcoming.sort((a, b) => a.daysUntil - b.daysUntil).slice(0, limit)
}

export function formatBirthdayLabel(daysUntil: number, displayDate: string): string {
  if (daysUntil === 0) return 'Today'
  if (daysUntil === 1) return 'Tomorrow'
  return displayDate
}
