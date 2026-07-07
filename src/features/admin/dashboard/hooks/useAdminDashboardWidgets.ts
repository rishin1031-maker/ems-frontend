import { useQuery } from '@tanstack/react-query'
import { adminEmployeesApi } from '@/api/admin/employees.api'
import { adminAttendanceApi } from '@/api/admin/attendance.api'
import { adminLeavesApi } from '@/api/admin/leaves.api'
import { todayISO } from '@/lib/format'

export function useAdminDashboardWidgets() {
  const employeesQuery = useQuery({
    queryKey: ['admin', 'dashboard', 'employees'],
    queryFn: () => adminEmployeesApi.list({ per_page: 500, status: 'active' }),
    staleTime: 120_000,
  })

  const weeklyChartQuery = useQuery({
    queryKey: ['admin', 'dashboard', 'weekly-attendance'],
    queryFn: () => adminAttendanceApi.charts({ chart_view: 'weekly', date: todayISO() }),
    staleTime: 120_000,
  })

  const leavesQuery = useQuery({
    queryKey: ['admin', 'dashboard', 'leaves-calendar'],
    queryFn: () => adminLeavesApi.list({ per_page: 200, page: 1 }),
    staleTime: 120_000,
  })

  return {
    employees: employeesQuery.data?.items ?? [],
    employeesLoading: employeesQuery.isLoading,
    weeklyChart: weeklyChartQuery.data,
    weeklyChartLoading: weeklyChartQuery.isLoading,
    calendarLeaves: leavesQuery.data?.items ?? [],
    calendarLeavesLoading: leavesQuery.isLoading,
  }
}
