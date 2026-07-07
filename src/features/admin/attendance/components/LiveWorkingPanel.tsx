import { useCallback } from 'react'
import { Clock, Coffee } from 'lucide-react'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { PageLoader } from '@/components/ui/Spinner'
import { useLiveStatus } from '@/features/admin/attendance/hooks/useAttendance'
import { useLiveTimer } from '@/hooks/useLiveTimer'
import { useLiveBreakTimer } from '@/hooks/useLiveBreakTimer'
import { LiveTimerDisplay } from '@/components/ui/LiveTimerDisplay'
import { adminAttendanceApi } from '@/api/admin/attendance.api'
import { todayISO, formatLiveTimer } from '@/lib/format'
import { TARGET_WORK_SECONDS } from '@/lib/constants'
import type { LiveWorkingEmployee } from '@/api/types/attendance'

function LiveEmployeeCard({ item, date }: { item: LiveWorkingEmployee; date: string }) {
  const pollFn = useCallback(async () => {
    const data = await adminAttendanceApi.liveStatus({ date })
    const found = data.employees.find((e) => e.employee_id === item.employee_id)
    return found
      ? { net_seconds: found.net_seconds, is_on_break: found.is_on_break }
      : null
  }, [item.employee_id, date])

  const breakPollFn = useCallback(async () => {
    const data = await adminAttendanceApi.liveStatus({ date })
    const found = data.employees.find((e) => e.employee_id === item.employee_id)
    return found
      ? {
          total_break_seconds: found.total_break_seconds ?? found.break_seconds ?? 0,
          is_on_break: found.is_on_break,
        }
      : null
  }, [item.employee_id, date])

  const seconds = useLiveTimer(
    { net_seconds: item.net_seconds, is_on_break: item.is_on_break },
    pollFn,
  )
  const breakSeconds = useLiveBreakTimer(
    {
      total_break_seconds: item.total_break_seconds ?? item.break_seconds ?? 0,
      is_on_break: item.is_on_break,
    },
    breakPollFn,
  )

  return (
    <div className="rounded-xl bg-gray-50/80 p-4 dark:bg-gray-800/40">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <p className="font-medium text-gray-900 dark:text-gray-100">{item.employee?.name ?? 'Employee'}</p>
          <p className="text-xs text-gray-500">{item.employee?.employee_id}</p>
        </div>
        {item.is_on_break ? (
          <Badge variant="warning"><Coffee className="mr-1 inline h-3 w-3" />On Break</Badge>
        ) : item.is_complete ? (
          <Badge variant="success">Complete</Badge>
        ) : (
          <Badge variant="info"><Clock className="mr-1 inline h-3 w-3" />Working</Badge>
        )}
      </div>
      <LiveTimerDisplay
        seconds={seconds}
        label="Net work"
        variant={item.is_on_break ? 'break' : 'work'}
        size="md"
      />
      <p className="mb-3 mt-2 font-mono text-xs tabular-nums text-orange-500">
        Break {formatLiveTimer(breakSeconds)}
      </p>
      <ProgressBar value={seconds} max={TARGET_WORK_SECONDS} showTimer={false} />
    </div>
  )
}

export function LiveWorkingPanel({ date }: { date?: string }) {
  const queryDate = date ?? todayISO()
  const { data, isLoading } = useLiveStatus(queryDate)

  if (isLoading) return <PageLoader />

  const employees = data?.employees ?? []

  return (
    <Card>
      <CardHeader>
        <CardTitle>Live Working ({employees.length})</CardTitle>
      </CardHeader>
      {employees.length === 0 ? (
        <p className="text-sm text-gray-500">No employees currently working</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {employees.map((emp) => (
            <LiveEmployeeCard key={emp.employee_id} item={emp} date={queryDate} />
          ))}
        </div>
      )}
    </Card>
  )
}
