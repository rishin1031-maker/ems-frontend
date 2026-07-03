import { useQuery } from '@tanstack/react-query'
import { adminAttendanceApi } from '@/api/admin/attendance.api'
import type {
  AttendanceChartsParams,
  DailyAttendanceParams,
  MonthlyAttendanceParams,
} from '@/api/types/attendance'

export function useDailyAttendance(params: DailyAttendanceParams) {
  return useQuery({
    queryKey: ['admin', 'attendance', 'daily', params],
    queryFn: () => adminAttendanceApi.daily(params),
  })
}

export function useMonthlyAttendance(params: MonthlyAttendanceParams) {
  return useQuery({
    queryKey: ['admin', 'attendance', 'monthly', params],
    queryFn: () => adminAttendanceApi.monthly(params),
  })
}

export function useAttendanceStatistics() {
  return useQuery({
    queryKey: ['admin', 'attendance', 'statistics'],
    queryFn: adminAttendanceApi.statistics,
  })
}

export function useAttendanceCharts(params: AttendanceChartsParams) {
  return useQuery({
    queryKey: ['admin', 'attendance', 'charts', params],
    queryFn: () => adminAttendanceApi.charts(params),
  })
}

export function useLiveStatus(date?: string) {
  return useQuery({
    queryKey: ['admin', 'attendance', 'live-status', date],
    queryFn: () => adminAttendanceApi.liveStatus({ date }),
    refetchInterval: 30_000,
  })
}
