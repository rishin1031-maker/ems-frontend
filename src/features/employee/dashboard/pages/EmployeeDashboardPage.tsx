import { useState, useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Clock, Coffee, Target, LogOut } from 'lucide-react'
import { employeeDashboardApi } from '@/api/employee/dashboard.api'
import { employeeAttendanceApi } from '@/api/employee/attendance.api'
import { PageHeader } from '@/components/layout/PageHeader'
import { StatCard } from '@/components/layout/StatCard'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { LiveTimerDisplay } from '@/components/ui/LiveTimerDisplay'
import { PageLoader } from '@/components/ui/Spinner'
import { LeaveCalendarSkeleton } from '@/components/ui/Skeleton'
import { LeaveCalendarView } from '@/components/leaves/LeaveCalendarView'
import { useEmployeeLeaves } from '@/features/employee/leaves/hooks/useEmployeeLeaves'
import { Badge, statusToBadgeVariant } from '@/components/ui/Badge'
import { AttendanceControls } from '@/features/employee/dashboard/components/AttendanceControls'
import { EarlyCheckoutModal } from '@/features/employee/dashboard/components/EarlyCheckoutModal'
import { LeaveBalanceCard } from '@/features/employee/dashboard/components/LeaveBalanceCard'
import { TodayChecklistCard } from '@/features/employee/dashboard/components/TodayChecklistCard'
import { ContinuousSessionPolicyCard } from '@/features/employee/dashboard/components/ContinuousSessionPolicyCard'
import { ContinuousSessionBanner } from '@/features/employee/dashboard/components/ContinuousSessionBanner'
import { EarningProgressRing } from '@/components/salary/EarningProgressRing'
import { AttendanceStreakBadge } from '@/components/attendance/AttendanceStreakBadge'
import { EstimatedCheckoutDisplay } from '@/components/attendance/EstimatedCheckoutDisplay'
import { computePresentStreak } from '@/lib/attendanceHelpers'
import { useEmployeeLiveStatus } from '@/features/employee/attendance/hooks/useEmployeeAttendance'
import { useLiveTimer } from '@/hooks/useLiveTimer'
import { useLiveBreakTimer } from '@/hooks/useLiveBreakTimer'
import { formatDate, formatDuration, formatLiveTimer, statusLabel } from '@/lib/format'
import { estimateCheckout } from '@/lib/estimatedCheckout'
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

  const { data: leavesData, isLoading: leavesLoading } = useEmployeeLeaves({
    page: 1,
    per_page: 200,
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
  const checkoutEstimate = estimateCheckout({
    netSeconds,
    targetSeconds,
    isOnBreak,
    isComplete,
    isCheckedIn: isCheckedIn && !live?.checked_out,
  })

  const leaveStats = LEAVE_TYPES.map((type) => ({
    label: `${statusLabel(type)} leave left`,
    value: getLeaveBalanceRemaining(data?.leave_balance ?? {}, type) ?? '—',
  }))

  if (isLoading) return <PageLoader />

  const streak = computePresentStreak(
    (data?.recent_attendance ?? []).map((a) => ({
      date: String(a.date ?? ''),
      status: String(a.status ?? ''),
    })),
  )

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Your attendance overview for today"
        actions={<AttendanceStreakBadge streak={streak} />}
      />

      <ContinuousSessionPolicyCard />

      <Card className="mb-6 overflow-hidden">
        <CardHeader className="border-b border-gray-100 pb-4 dark:border-gray-800/80">
          <CardTitle className="text-base font-medium">Today&apos;s attendance</CardTitle>
        </CardHeader>

        {isCheckedIn && !live?.checked_out && (
          <>
            <ContinuousSessionBanner
              continuousSeconds={live?.continuous_seconds ?? 0}
              warning={Boolean(live?.continuous_warning)}
              inGrace={Boolean(live?.continuous_in_grace)}
              onBreak={isOnBreak}
              policy={live?.continuous_policy}
            />
            <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-xl bg-gray-50/80 px-5 py-4 dark:bg-gray-800/40">
                <LiveTimerDisplay
                  seconds={netSeconds}
                  label="Net work"
                  status={isOnBreak ? 'On break — paused' : 'Working'}
                  variant={isOnBreak ? 'break' : 'work'}
                />
              </div>
              <div className="rounded-xl bg-orange-50/50 px-5 py-4 dark:bg-orange-950/20">
                <LiveTimerDisplay
                  seconds={breakSeconds}
                  label="Break total"
                  variant="break"
                />
              </div>
              <EstimatedCheckoutDisplay
                netSeconds={netSeconds}
                targetSeconds={targetSeconds}
                isOnBreak={isOnBreak}
                isComplete={isComplete}
                isCheckedIn
              />
            </div>
          </>
        )}

        <ProgressBar value={netSeconds} max={targetSeconds} showTimer completeClass="bg-green-500" className="mb-5" />
        <AttendanceControls liveStats={live} onEarlyCheckout={() => setEarlyCheckoutOpen(true)} />
      </Card>

      <div className="mb-6">
        <TodayChecklistCard />
      </div>

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
        {checkoutEstimate.kind !== 'none' && (
          <StatCard
            title="Est. Check-out"
            value={checkoutEstimate.label}
            icon={<LogOut className="h-5 w-5" />}
            description={checkoutEstimate.kind === 'paused' ? 'Timer paused during break' : checkoutEstimate.kind === 'complete' ? 'You can check out anytime' : 'If you keep working without breaks'}
            theme="employee"
          />
        )}
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

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <EarningProgressRing earnings={data?.monthly_earnings} theme="employee" />
        <LeaveBalanceCard balance={data?.leave_balance} />
      </div>

      <Card className="mt-6">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle className="text-base font-semibold">Leave Calendar</CardTitle>
            <p className="text-xs text-slate-500">Your leave schedule · scroll through months</p>
          </div>
          <Link to="/employee/leaves" className="text-xs font-medium text-sky-600 hover:underline">
            View all
          </Link>
        </CardHeader>
        {leavesLoading ? (
          <LeaveCalendarSkeleton />
        ) : (
          <LeaveCalendarView leaves={leavesData?.items ?? []} theme="employee" />
        )}
      </Card>

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
