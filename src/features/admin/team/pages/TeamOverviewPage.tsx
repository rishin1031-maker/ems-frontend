import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Users } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge, statusToBadgeVariant } from '@/components/ui/Badge'
import { TeamPresenceBoard } from '@/components/attendance/TeamPresenceBoard'
import { useDepartmentOptions } from '@/features/admin/departments/hooks/useDepartments'
import { useLeaves } from '@/features/admin/leaves/hooks/useLeaves'
import { useDailyAttendance } from '@/features/admin/attendance/hooks/useAttendance'
import { formatDate, statusLabel, todayISO } from '@/lib/format'
import { getLeaveStartDate } from '@/api/types/leave'

export function TeamOverviewPage() {
  const [departmentId, setDepartmentId] = useState<number | ''>('')
  const { data: deptData } = useDepartmentOptions()
  const deptOptions = (deptData?.items ?? []).map((d) => ({ value: d.id, label: d.name }))

  const deptFilter = departmentId || undefined
  const { data: leavesData } = useLeaves({ status: 'pending', per_page: 10, page: 1 })
  const { data: dailyData } = useDailyAttendance({
    date: todayISO(),
    department_id: deptFilter,
  })

  const pendingLeaves = (leavesData?.items ?? []).filter(
    (l) => !departmentId || l.employee?.department?.id === departmentId,
  )

  const dailyItems = dailyData?.items ?? []
  const presentCount = dailyItems.filter((r) => r.status === 'present').length

  return (
    <div>
      <PageHeader
        title="Team Overview"
        description="Department-scoped view — live presence, attendance, and pending approvals (manager-style)"
        actions={
          <Link to="/admin/inbox">
            <Button variant="outline" theme="admin">Approval inbox</Button>
          </Link>
        }
      />

      <div className="mb-6 max-w-xs">
        <Select
          label="Department"
          placeholder="All departments"
          options={deptOptions}
          value={departmentId}
          onChange={(e) => setDepartmentId(e.target.value ? Number(e.target.value) : '')}
        />
      </div>

      <TeamPresenceBoard
        departmentId={deptFilter}
        title={departmentId ? 'Team presence' : "Who's in — all departments"}
      />

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Today&apos;s attendance</CardTitle>
            <span className="flex items-center gap-1 text-xs text-slate-500">
              <Users className="h-3.5 w-3.5" />
              {presentCount} present
            </span>
          </CardHeader>
          <ul className="max-h-64 divide-y divide-slate-100 overflow-y-auto dark:divide-slate-800">
            {dailyItems.slice(0, 12).map((row) => (
              <li key={row.employee_id} className="flex items-center justify-between py-2.5 text-sm">
                <div>
                  <p className="font-medium">{row.employee?.name ?? '—'}</p>
                  <p className="text-xs text-slate-400">{row.employee?.department?.name ?? '—'}</p>
                </div>
                <Badge variant={statusToBadgeVariant(row.status)}>{statusLabel(row.status)}</Badge>
              </li>
            ))}
            {dailyItems.length === 0 && (
              <li className="py-6 text-center text-sm text-slate-500">No records for today</li>
            )}
          </ul>
          <Link to="/admin/attendance" className="mt-3 block text-center text-xs text-blue-600 hover:underline">
            Full attendance →
          </Link>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Pending leave requests</CardTitle>
          </CardHeader>
          <ul className="divide-y divide-slate-100 dark:divide-slate-800">
            {pendingLeaves.length === 0 ? (
              <li className="py-6 text-center text-sm text-slate-500">No pending requests</li>
            ) : (
              pendingLeaves.map((leave) => (
                <li key={leave.id} className="flex items-center justify-between py-2.5 text-sm">
                  <div>
                    <p className="font-medium">{leave.employee?.name}</p>
                    <p className="text-xs text-slate-400 capitalize">
                      {leave.type} · {formatDate(getLeaveStartDate(leave))}
                    </p>
                  </div>
                  <Link to={`/admin/leaves/${leave.id}`}>
                    <Button size="sm" theme="admin">Review</Button>
                  </Link>
                </li>
              ))
            )}
          </ul>
        </Card>
      </div>
    </div>
  )
}
