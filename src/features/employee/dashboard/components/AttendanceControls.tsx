import { useCallback } from 'react'
import { LogIn, LogOut, Coffee, Play } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useEmployeeAttendanceMutations } from '@/features/employee/attendance/hooks/useEmployeeAttendance'
import { useToast } from '@/components/feedback/ToastContext'
import type { EmployeeLiveStats } from '@/api/employee/attendance.api'

interface AttendanceControlsProps {
  liveStats?: EmployeeLiveStats | null
  onEarlyCheckout: () => void
}

export function AttendanceControls({ liveStats, onEarlyCheckout }: AttendanceControlsProps) {
  const { checkIn, checkOut, breakStart, breakEnd } = useEmployeeAttendanceMutations()
  const { success, error: toastError } = useToast()

  const isCheckedIn = liveStats?.is_checked_in ?? false
  const isOnBreak = liveStats?.is_on_break ?? false
  const hasCheckedOut = liveStats?.checked_out ?? false

  const loading =
    checkIn.isPending ||
    checkOut.isPending ||
    breakStart.isPending ||
    breakEnd.isPending

  const handleCheckIn = async () => {
    try {
      await checkIn.mutateAsync()
      success('Checked in successfully')
    } catch (err) {
      toastError((err as Error).message ?? 'Check-in failed')
    }
  }

  const handleCheckOut = () => {
    if (isOnBreak) {
      toastError('Please end your break before checking out')
      return
    }
    if (isCheckedIn) {
      onEarlyCheckout()
    }
  }

  const handleBreakStart = async () => {
    try {
      await breakStart.mutateAsync()
      success('Break started')
    } catch (err) {
      toastError((err as Error).message ?? 'Failed to start break')
    }
  }

  const handleBreakEnd = async () => {
    try {
      await breakEnd.mutateAsync()
      success('Break ended')
    } catch (err) {
      toastError((err as Error).message ?? 'Failed to end break')
    }
  }

  return (
    <div className="flex flex-wrap gap-3">
      {!isCheckedIn && !hasCheckedOut && (
        <Button theme="employee" onClick={handleCheckIn} loading={checkIn.isPending} disabled={loading}>
          <LogIn className="h-4 w-4" />
          Check In
        </Button>
      )}

      {isCheckedIn && !hasCheckedOut && (
        <>
          {!isOnBreak ? (
            <Button variant="outline" theme="employee" onClick={handleBreakStart} loading={breakStart.isPending} disabled={loading}>
              <Coffee className="h-4 w-4" />
              Take Break
            </Button>
          ) : (
            <Button variant="outline" theme="employee" onClick={handleBreakEnd} loading={breakEnd.isPending} disabled={loading}>
              <Play className="h-4 w-4" />
              End Break
            </Button>
          )}
          <Button theme="employee" onClick={handleCheckOut} loading={checkOut.isPending} disabled={loading}>
            <LogOut className="h-4 w-4" />
            Check Out
          </Button>
        </>
      )}

      {hasCheckedOut && !isCheckedIn && (
        <p className="text-sm text-gray-500">You have checked out for today.</p>
      )}
    </div>
  )
}

export function useLiveStatusPoll() {
  return useCallback(async () => {
    const { employeeAttendanceApi } = await import('@/api/employee/attendance.api')
    const data = await employeeAttendanceApi.liveStatus()
    return {
      net_seconds: data.net_seconds ?? 0,
      is_on_break: data.is_on_break,
      total_break_seconds: data.total_break_seconds ?? data.break_seconds,
    }
  }, [])
}
