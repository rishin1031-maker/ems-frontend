import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { employeeAttendanceApi } from '@/api/employee/attendance.api'
import type { CheckOutPayload, EmployeeChartsParams } from '@/api/employee/attendance.api'

export function useEmployeeMonthlyAttendance(month: string) {
  return useQuery({
    queryKey: ['employee', 'attendance', month],
    queryFn: () => employeeAttendanceApi.monthly({ month }),
  })
}

export function useEmployeeAttendanceCharts(params: EmployeeChartsParams) {
  return useQuery({
    queryKey: ['employee', 'attendance', 'charts', params],
    queryFn: () => employeeAttendanceApi.charts(params),
  })
}

export function useEmployeeLiveStatus() {
  return useQuery({
    queryKey: ['employee', 'live-status'],
    queryFn: employeeAttendanceApi.liveStatus,
    refetchInterval: 3_000,
  })
}

export function useEmployeeAttendanceMutations() {
  const qc = useQueryClient()

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['employee', 'dashboard'] })
    qc.invalidateQueries({ queryKey: ['employee', 'live-status'] })
    qc.invalidateQueries({ queryKey: ['employee', 'attendance'] })
  }

  const checkIn = useMutation({
    mutationFn: employeeAttendanceApi.checkIn,
    onSuccess: invalidate,
  })

  const checkOut = useMutation({
    mutationFn: (payload?: CheckOutPayload) => employeeAttendanceApi.checkOut(payload),
    onSuccess: invalidate,
  })

  const breakStart = useMutation({
    mutationFn: employeeAttendanceApi.breakStart,
    onSuccess: invalidate,
  })

  const breakEnd = useMutation({
    mutationFn: employeeAttendanceApi.breakEnd,
    onSuccess: invalidate,
  })

  return { checkIn, checkOut, breakStart, breakEnd }
}
