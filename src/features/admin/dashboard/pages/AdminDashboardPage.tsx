import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Users, UserCheck, CalendarOff, Clock } from 'lucide-react'
import { adminDashboardApi } from '@/api/admin/dashboard.api'
import { PageHeader } from '@/components/layout/PageHeader'
import { StatCard } from '@/components/layout/StatCard'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { PageLoader } from '@/components/ui/Spinner'
import { useToast } from '@/components/feedback/ToastContext'
import { formatDate, statusLabel } from '@/lib/format'
import { getLeaveStartDate } from '@/api/types/leave'
import type { Leave } from '@/api/types/leave'
import type { Employee } from '@/api/types/employee'

export function AdminDashboardPage() {
  const { error: toastError } = useToast()

  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin', 'dashboard'],
    queryFn: adminDashboardApi.get,
    retry: 1,
  })

  useEffect(() => {
    if (isError) toastError('Failed to load dashboard data')
  }, [isError, toastError])

  if (isLoading) return <PageLoader />

  const stats = data?.stats ?? {}

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Overview of your organization"
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Employees"
          value={stats.total_employees ?? '—'}
          icon={<Users className="h-5 w-5" />}
          theme="admin"
        />
        <StatCard
          title="Present Today"
          value={stats.present_today ?? '—'}
          icon={<UserCheck className="h-5 w-5" />}
          theme="admin"
        />
        <StatCard
          title="Pending Leaves"
          value={stats.pending_leaves ?? '—'}
          icon={<CalendarOff className="h-5 w-5" />}
          theme="admin"
        />
        <StatCard
          title="Active Employees"
          value={stats.active_employees ?? '—'}
          icon={<Clock className="h-5 w-5" />}
          theme="admin"
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Employees</CardTitle>
          </CardHeader>
          {data?.recent_employees && data.recent_employees.length > 0 ? (
            <ul className="divide-y divide-gray-100 dark:divide-gray-800">
              {(data.recent_employees as Employee[]).map((emp) => (
                <li key={emp.id} className="flex items-center justify-between py-3 text-sm">
                  <span className="font-medium">{emp.name ?? '—'}</span>
                  <span className="text-gray-500">{emp.employee_id ?? ''}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500">No recent employees</p>
          )}
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Leave Requests</CardTitle>
          </CardHeader>
          {data?.recent_leaves && data.recent_leaves.length > 0 ? (
            <ul className="divide-y divide-gray-100 dark:divide-gray-800">
              {(data.recent_leaves as Leave[]).map((leave) => (
                <li key={leave.id} className="flex items-center justify-between py-3 text-sm">
                  <span>{leave.employee?.name ?? '—'}</span>
                  <span className="capitalize text-gray-500">
                    {statusLabel(leave.status)} · {formatDate(getLeaveStartDate(leave))}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500">No recent leave requests</p>
          )}
        </Card>
      </div>
    </div>
  )
}
