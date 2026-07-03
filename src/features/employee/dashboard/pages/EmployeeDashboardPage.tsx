import { useState, useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Clock, Coffee, Target } from 'lucide-react'
import { employeeDashboardApi } from '@/api/employee/dashboard.api'
import { employeeAttendanceApi } from '@/api/employee/attendance.api'
import { PageHeader } from '@/components/layout/PageHeader'
import { StatCard } from '@/components/layout/StatCard'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { PageLoader } from '@/components/ui/Spinner'
import { Badge, statusToBadgeVariant } from '@/components/ui/Badge'
import { AttendanceControls } from '@/features/employee/dashboard/components/AttendanceControls'
import { EarlyCheckoutModal } from '@/features/employee/dashboard/components/EarlyCheckoutModal'
import { LeaveBalanceCard } from '@/features/employee/dashboard/components/LeaveBalanceCard'
import { useEmployeeLiveStatus } from '@/features/employee/attendance/hooks/useEmployeeAttendance'
import { useLiveTimer } from '@/hooks/useLiveTimer'
import { useLiveBreakTimer } from '@/hooks/useLiveBreakTimer'
import { formatDate, formatDuration, formatLiveTimer, statusLabel } from '@/lib/format'
import { getLeaveBalanceRemaining } from '@/lib/liveStats'
import { getLeaveStartDate, getLeaveEndDate, type Leave } from '@/api/types/leave'
import { TARGET_WORK_SECONDS, LEAVE_TYPES } from '@/lib/constants'
import type { EmployeeLiveStats } from '@/api/employee/attendance.api'

function useWorkPoll() {
  return useCallback(async () => {
    const data = await employeeAttendanceApi.liveStatus()
    return { net_seconds: data.net_seconds ?? 0, is_on_break: data.is_on_break }
  }, [])
}

function useBreakPoll() {
  return useCallback(async () => {
    const data = await employeeAttendanceApi.liveStatus()
    return {
      total_break_seconds: data.total_break_seconds ?? data.break_seconds ?? 0,
      is_on_break: data.is_on_break,
    }
  }, [])
}

export function EmployeeDashboardPage() {
  const [earlyCheckoutOpen, setEarlyCheckoutOpen] = useState(false)
  const workPollFn = useWorkPoll()
  const breakPollFn = useBreakPoll()

  const { data, isLoading } = useQuery({
    queryKey: ['employee', 'dashboard'],
    queryFn: employeeDashboardApi.get,
    refetchInterval: 30_000,
  })

  const { data: livePoll } = useEmployeeLiveStatus()

  const live: EmployeeLiveStats | null = livePoll ?? data?.live_stats ?? null
  const targetSeconds = live?.target_seconds ?? TARGET_WORK_SECONDS
  const isCheckedIn = live?.is_checked_in ?? false
  const isOnBreak = live?.is_on_break ?? false
  const isComplete = live?.is_complete ?? false

  const workTimerInput = isCheckedIn
    ? { net_seconds: live?.net_seconds ?? 0, is_on_break: isOnBreak }
    : null

  const breakTimerInput = isCheckedIn
    ? {
        total_break_seconds: live?.total_break_seconds ?? live?.break_seconds ?? 0,
        is_on_break: isOnBreak,
      }
    : null

  const workDisplaySeconds = useLiveTimer(workTimerInput, workPollFn)
  const breakDisplaySeconds = useLiveBreakTimer(breakTimerInput, breakPollFn)

  const netSeconds = isCheckedIn ? workDisplaySeconds : (live?.net_seconds ?? 0)
  const breakSeconds = isCheckedIn ? breakDisplaySeconds : (live?.total_break_seconds ?? live?.break_seconds ?? 0)
  const progress = live?.progress_percent ?? Math.min((netSeconds / targetSeconds) * 100, 100)

  const leaveStats = LEAVE_TYPES.map((type) => ({
    label: `${statusLabel(type)} leave left`,
    value: getLeaveBalanceRemaining(data?.leave_balance ?? {}, type) ?? '—',
  }))

  if (isLoading) return <PageLoader />

  return (
    <div>
      <PageHeader title="Dashboard" description="Your attendance overview for today" />

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Today&apos;s Attendance</CardTitle>
        </CardHeader>

        {isCheckedIn && !live?.checked_out && (
          <div className="mb-4 flex flex-wrap gap-4">
            <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-2 text-center dark:border-gray-800 dark:bg-gray-900/50">
              <p className="text-xs text-gray-500">Net work time</p>
              <p className={`font-mono text-xl font-bold ${isOnBreak ? 'text-orange-400' : 'text-indigo-600'}`}>
                {formatLiveTimer(netSeconds)}
              </p>
              <p className={`text-xs ${isOnBreak ? 'text-orange-500' : 'text-green-500'}`}>
                {isOnBreak ? 'On break — timer paused' : 'Working'}
              </p>
            </div>
            <div className="rounded-xl border border-orange-100 bg-orange-50 px-4 py-2 text-center dark:border-orange-900 dark:bg-orange-950/30">
              <p className="text-xs text-gray-500">Total break</p>
              <p className="font-mono text-xl font-bold text-orange-500">{formatLiveTimer(breakSeconds)}</p>
            </div>
          </div>
        )}

        <ProgressBar value={netSeconds} max={targetSeconds} showTimer completeClass="bg-green-500" className="mb-4" />
        <AttendanceControls liveStats={live} onEarlyCheckout={() => setEarlyCheckoutOpen(true)} />
      </Card>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {leaveStats.map((s) => (
          <StatCard key={s.label} title={s.label} value={s.value} theme="employee" />
        ))}
        <StatCard title="Pending requests" value={data?.pending_leaves ?? 0} icon={<Clock className="h-5 w-5" />} theme="employee" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard title="Net Work Time" value={formatLiveTimer(netSeconds)} icon={<Clock className="h-5 w-5" />} description={`Target: ${formatDuration(targetSeconds)}`} theme="employee" />
        <StatCard title="Status" value={isOnBreak ? 'On Break' : isCheckedIn ? 'Working' : live?.checked_out ? 'Checked Out' : 'Not Checked In'} icon={<Coffee className="h-5 w-5" />} theme="employee" />
        <StatCard title="Daily Target" value={`${Math.round(progress)}%`} icon={<Target className="h-5 w-5" />} description={isComplete ? 'Target reached' : '8 hours net required'} theme="employee" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent leave requests</CardTitle>
            <Link to="/employee/leaves" className="text-xs text-teal-600 hover:underline">View all</Link>
          </CardHeader>
          {(data?.recent_leaves ?? []).length > 0 ? (
            <ul className="divide-y divide-gray-100 dark:divide-gray-800">
              {(data?.recent_leaves as Leave[]).map((leave) => (
                <li key={leave.id} className="flex items-center justify-between px-1 py-3 text-sm">
                  <div>
                    <p className="font-medium capitalize">{leave.type} leave</p>
                    <p className="text-xs text-gray-400">
                      {formatDate(getLeaveStartDate(leave))} – {formatDate(getLeaveEndDate(leave))}
                      {leave.days != null ? ` · ${leave.days} day(s)` : ''}
                    </p>
                  </div>
                  <Badge variant={statusToBadgeVariant(leave.status)}>{statusLabel(leave.status)}</Badge>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500">No leave requests yet.</p>
          )}
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent attendance</CardTitle>
            <Link to="/employee/attendance" className="text-xs text-teal-600 hover:underline">View all</Link>
          </CardHeader>
          {(data?.recent_attendance ?? []).length > 0 ? (
            <ul className="divide-y divide-gray-100 dark:divide-gray-800">
              {data!.recent_attendance!.map((att, i) => (
                <li key={i} className="flex items-center justify-between px-1 py-3 text-sm">
                  <div>
                    <p className="font-medium">{formatDate(String(att.date ?? ''))}</p>
                    <p className="text-xs text-gray-400">
                      {att.check_in ? new Date(String(att.check_in)).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '—'}
                      {att.net_hours_worked ? ` · Net: ${String(att.net_hours_worked)}` : ''}
                    </p>
                  </div>
                  {att.status && (
                    <Badge variant={statusToBadgeVariant(String(att.status))}>{statusLabel(String(att.status))}</Badge>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500">No attendance records.</p>
          )}
        </Card>
      </div>

      <div className="mt-6">
        <LeaveBalanceCard balance={data?.leave_balance} />
      </div>

      <EarlyCheckoutModal
        open={earlyCheckoutOpen}
        onClose={() => setEarlyCheckoutOpen(false)}
        isComplete={isComplete}
        netSeconds={netSeconds}
        breakSeconds={breakSeconds}
      />
    </div>
  )
}
