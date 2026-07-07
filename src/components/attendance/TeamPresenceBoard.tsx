import { useCallback } from 'react'
import { Coffee, Clock } from 'lucide-react'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { PageLoader } from '@/components/ui/Spinner'
import { useLiveStatus } from '@/features/admin/attendance/hooks/useAttendance'
import { useLiveTimer } from '@/hooks/useLiveTimer'
import { useLiveBreakTimer } from '@/hooks/useLiveBreakTimer'
import { adminAttendanceApi } from '@/api/admin/attendance.api'
import { todayISO, formatLiveTimer } from '@/lib/format'
import { TARGET_WORK_SECONDS } from '@/lib/constants'
import type { LiveWorkingEmployee } from '@/api/types/attendance'
import { cn } from '@/lib/cn'

function AvatarDot({ name, onBreak }: { name: string; onBreak?: boolean }) {
  const initials = name.split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase()
  return (
    <div className="relative">
      <div className="flex h-11 w-11 items-center justify-center rounded-full glass-chip text-xs font-bold text-slate-700 dark:text-slate-200">
        {initials}
      </div>
      <span
        className={cn(
          'absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-white dark:border-slate-900',
          onBreak ? 'bg-amber-400' : 'bg-emerald-500',
        )}
        title={onBreak ? 'On break' : 'Working'}
      />
    </div>
  )
}

function PresenceCard({ item, date }: { item: LiveWorkingEmployee; date: string }) {
  const pollFn = useCallback(async () => {
    const data = await adminAttendanceApi.liveStatus({ date })
    const found = data.employees.find((e) => e.employee_id === item.employee_id)
    return found ? { net_seconds: found.net_seconds, is_on_break: found.is_on_break } : null
  }, [item.employee_id, date])

  const breakPollFn = useCallback(async () => {
    const data = await adminAttendanceApi.liveStatus({ date })
    const found = data.employees.find((e) => e.employee_id === item.employee_id)
    return found
      ? { total_break_seconds: found.total_break_seconds ?? found.break_seconds ?? 0, is_on_break: found.is_on_break }
      : null
  }, [item.employee_id, date])

  const seconds = useLiveTimer({ net_seconds: item.net_seconds, is_on_break: item.is_on_break }, pollFn)
  const breakSeconds = useLiveBreakTimer(
    { total_break_seconds: item.total_break_seconds ?? item.break_seconds ?? 0, is_on_break: item.is_on_break },
    breakPollFn,
  )

  const name = item.employee?.name ?? 'Employee'

  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl glass-card p-4 text-center transition hover:scale-[1.02]">
      <AvatarDot name={name} onBreak={item.is_on_break} />
      <div className="min-w-0 w-full">
        <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">{name}</p>
        <p className="truncate text-[11px] text-slate-500">{item.employee?.employee_id}</p>
        {item.employee?.department?.name && (
          <p className="truncate text-[10px] text-slate-400">{item.employee.department.name}</p>
        )}
      </div>
      {item.is_on_break ? (
        <Badge variant="warning"><Coffee className="mr-1 inline h-3 w-3" />Break</Badge>
      ) : item.is_complete ? (
        <Badge variant="success">Done</Badge>
      ) : (
        <Badge variant="info"><Clock className="mr-1 inline h-3 w-3" />Working</Badge>
      )}
      <p className={cn('font-mono text-xl font-bold tabular-nums', item.is_on_break ? 'text-amber-500' : 'text-blue-600')}>
        {formatLiveTimer(seconds)}
      </p>
      <p className="text-[10px] text-orange-500">Break {formatLiveTimer(breakSeconds)}</p>
      <ProgressBar value={seconds} max={TARGET_WORK_SECONDS} showTimer={false} className="w-full" />
    </div>
  )
}

interface TeamPresenceBoardProps {
  date?: string
  departmentId?: number | string
  search?: string
  title?: string
}

export function TeamPresenceBoard({ date, departmentId, search, title = "Who's In" }: TeamPresenceBoardProps) {
  const queryDate = date ?? todayISO()
  const { data, isLoading } = useLiveStatus(queryDate, {
    department_id: departmentId || undefined,
    search: search || undefined,
  })

  if (isLoading) return <PageLoader />

  const employees = data?.employees ?? []

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="text-base">{title}</CardTitle>
          <p className="text-xs text-slate-500">{employees.length} currently checked in · live</p>
        </div>
      </CardHeader>
      {employees.length === 0 ? (
        <p className="py-8 text-center text-sm text-slate-500">No one is checked in right now.</p>
      ) : (
        <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {employees.map((emp) => (
            <PresenceCard key={emp.employee_id} item={emp} date={queryDate} />
          ))}
        </div>
      )}
    </Card>
  )
}
