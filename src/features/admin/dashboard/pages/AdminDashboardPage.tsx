import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Users, Building2, UserCheck, CalendarOff, Plus, Eye, Pencil, MoreHorizontal } from 'lucide-react'
import { adminDashboardApi } from '@/api/admin/dashboard.api'
import { StatCard } from '@/components/layout/StatCard'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge, statusToBadgeVariant } from '@/components/ui/Badge'
import { DashboardSkeleton, LeaveCalendarSkeleton, Skeleton } from '@/components/ui/Skeleton'
import { LeaveCalendarView } from '@/components/leaves/LeaveCalendarView'
import {
  Table, TableHead, TableBody, TableRow, TableHeader, TableCell,
} from '@/components/ui/Table'
import { DepartmentDonutChart } from '@/features/admin/dashboard/components/DepartmentDonutChart'
import { AttendanceOverviewChart } from '@/features/admin/dashboard/components/AttendanceOverviewChart'
import { UpcomingBirthdays } from '@/features/admin/dashboard/components/UpcomingBirthdays'
import { TeamPresenceBoard } from '@/components/attendance/TeamPresenceBoard'
import { useAdminDashboardWidgets } from '@/features/admin/dashboard/hooks/useAdminDashboardWidgets'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { useToast } from '@/components/feedback/ToastContext'
import {
  buildDepartmentDistribution,
  buildWeeklyAttendanceOverview,
  getUpcomingBirthdays,
} from '@/lib/dashboardHelpers'
import { formatDate, statusLabel } from '@/lib/format'
import { getLeaveStartDate } from '@/api/types/leave'
import type { Leave } from '@/api/types/leave'
import type { Employee } from '@/api/types/employee'

function AvatarInitials({ name }: { name: string }) {
  const initials = name.split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase()
  return (
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-semibold text-blue-700 dark:bg-blue-950/50 dark:text-blue-300">
      {initials}
    </div>
  )
}

export function AdminDashboardPage() {
  const { user } = useAuth()
  const { error: toastError } = useToast()

  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin', 'dashboard'],
    queryFn: adminDashboardApi.get,
    retry: 1,
  })

  const {
    employees,
    employeesLoading,
    weeklyChart,
    weeklyChartLoading,
    calendarLeaves,
    calendarLeavesLoading,
  } = useAdminDashboardWidgets()

  useEffect(() => {
    if (isError) toastError('Failed to load dashboard data')
  }, [isError, toastError])

  if (isLoading) return <DashboardSkeleton />

  const stats = data?.stats ?? {}
  const total = stats.total_employees ?? employees.length ?? 0
  const activeTotal = stats.active_employees ?? total
  const present = stats.present_today ?? 0
  const presentPct = total > 0 ? (present / total) * 100 : 0
  const pendingLeaves = stats.pending_leaves ?? 0
  const pendingPct = total > 0 ? (pendingLeaves / total) * 100 : 0

  const departmentSlices = buildDepartmentDistribution(employees)
  const attendanceOverview = buildWeeklyAttendanceOverview(weeklyChart, activeTotal)
  const birthdays = getUpcomingBirthdays(employees, 5)

  const recentEmployees = (data?.recent_employees ?? []) as Employee[]
  const firstName = user?.name?.split(' ')[0] ?? 'Admin'

  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
            Welcome back, {firstName}! 👋
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Here&apos;s what&apos;s happening in your organization today.
          </p>
        </div>
        <Link to="/admin/employees/create">
          <Button theme="admin" className="rounded-xl shadow-sm">
            <Plus className="h-4 w-4" />
            Add Employee
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Employees"
          value={stats.total_employees ?? '—'}
          icon={<Users className="h-5 w-5" />}
          trend={stats.active_employees != null ? { label: `${stats.active_employees} active`, positive: true } : undefined}
          theme="admin"
        />
        <StatCard
          title="Departments"
          value={stats.total_departments ?? '—'}
          icon={<Building2 className="h-5 w-5" />}
          trend={{ label: 'Organization units', positive: false }}
          theme="admin"
        />
        <StatCard
          title="Present Today"
          value={present}
          icon={<UserCheck className="h-5 w-5" />}
          progress={{ value: presentPct, color: 'blue' }}
          theme="admin"
        />
        <StatCard
          title="Pending Leaves"
          value={pendingLeaves}
          icon={<CalendarOff className="h-5 w-5" />}
          progress={{ value: pendingPct, color: 'orange' }}
          theme="admin"
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Employee Distribution</CardTitle>
            <p className="text-xs text-slate-500">By department</p>
          </CardHeader>
          {employeesLoading ? (
            <Skeleton className="mx-auto h-40 w-40 rounded-full" />
          ) : (
            <DepartmentDonutChart slices={departmentSlices} />
          )}
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Attendance Overview</CardTitle>
            <p className="text-xs text-slate-500">This week · % present</p>
          </CardHeader>
          {weeklyChartLoading ? (
            <Skeleton className="h-48 w-full rounded-lg" />
          ) : (
            <AttendanceOverviewChart
              labels={attendanceOverview.labels}
              values={attendanceOverview.values}
            />
          )}
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Upcoming Birthdays</CardTitle>
            <p className="text-xs text-slate-500">Next 60 days</p>
          </CardHeader>
          {employeesLoading ? (
            <div className="space-y-3 px-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full rounded-lg" />
              ))}
            </div>
          ) : (
            <UpcomingBirthdays items={birthdays} />
          )}
        </Card>
      </div>

      <TeamPresenceBoard title="Live team board" />

      <Card className="mt-6">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle className="text-base font-semibold">Leave Calendar</CardTitle>
            <p className="text-xs text-slate-500">Scroll through months · team leave overview</p>
          </div>
          <Link to="/admin/leaves" className="text-xs font-medium text-blue-600 hover:underline">
            Manage leaves
          </Link>
        </CardHeader>
        {calendarLeavesLoading ? (
          <LeaveCalendarSkeleton />
        ) : (
          <LeaveCalendarView
            leaves={calendarLeaves}
            showEmployee
            adminLinks
            theme="admin"
          />
        )}
      </Card>

      <Card padding="none" className="mt-6 overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 px-6 py-4 dark:border-slate-800">
          <CardTitle className="text-base font-semibold">Recent Employees</CardTitle>
          <Link to="/admin/employees" className="text-xs font-medium text-blue-600 hover:underline">
            View all
          </Link>
        </CardHeader>
        {recentEmployees.length > 0 ? (
          <Table>
            <TableHead>
              <TableRow className="bg-slate-50/80 dark:bg-slate-800/50">
                <TableHeader>Name</TableHeader>
                <TableHeader>Employee ID</TableHeader>
                <TableHeader>Department</TableHeader>
                <TableHeader>Designation</TableHeader>
                <TableHeader>Date of Joining</TableHeader>
                <TableHeader>Status</TableHeader>
                <TableHeader className="text-right">Actions</TableHeader>
              </TableRow>
            </TableHead>
            <TableBody>
              {recentEmployees.map((emp) => (
                <TableRow key={emp.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <AvatarInitials name={emp.name ?? '?'} />
                      <span className="font-medium text-slate-900 dark:text-slate-100">{emp.name ?? '—'}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-slate-500">{emp.employee_id ?? '—'}</TableCell>
                  <TableCell className="text-slate-500">{emp.department?.name ?? '—'}</TableCell>
                  <TableCell className="text-slate-500">{emp.designation?.name ?? '—'}</TableCell>
                  <TableCell className="text-slate-500">
                    {emp.created_at ? formatDate(emp.created_at) : '—'}
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusToBadgeVariant(emp.status)}>{statusLabel(emp.status)}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      <Link to={`/admin/employees/${emp.id}`}>
                        <Button variant="ghost" size="sm" theme="admin" title="View">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Link to={`/admin/employees/${emp.id}/edit`}>
                        <Button variant="ghost" size="sm" theme="admin" title="Edit">
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Link to={`/admin/employees/${emp.id}`}>
                        <Button variant="ghost" size="sm" theme="admin" title="More">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <p className="px-6 py-8 text-sm text-slate-500">No recent employees</p>
        )}
      </Card>

      {data?.recent_leaves && data.recent_leaves.length > 0 && (
        <Card className="mt-6">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-semibold">Recent Leave Requests</CardTitle>
            <Link to="/admin/leaves" className="text-xs font-medium text-blue-600 hover:underline">
              View all
            </Link>
          </CardHeader>
          <ul className="divide-y divide-slate-100 dark:divide-slate-800">
            {(data.recent_leaves as Leave[]).map((leave) => (
              <li key={leave.id} className="flex items-center justify-between py-3.5 text-sm">
                <div>
                  <p className="font-medium text-slate-900 dark:text-slate-100">{leave.employee?.name ?? '—'}</p>
                  <p className="text-xs text-slate-400 capitalize">
                    {leave.type} · {formatDate(getLeaveStartDate(leave))}
                  </p>
                </div>
                <Badge variant={statusToBadgeVariant(leave.status)}>{statusLabel(leave.status)}</Badge>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  )
}
