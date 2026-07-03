import { useState } from 'react'
import { Link } from 'react-router-dom'
import { BarChart3, Coffee } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Badge, statusToBadgeVariant } from '@/components/ui/Badge'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { PageLoader } from '@/components/ui/Spinner'
import {
  Table, TableHead, TableBody, TableRow, TableHeader, TableCell,
} from '@/components/ui/Table'
import { EmptyState } from '@/components/feedback/EmptyState'
import { useEmployeeMonthlyAttendance } from '@/features/employee/attendance/hooks/useEmployeeAttendance'
import { formatDate, formatDateTime, currentMonth, statusLabel } from '@/lib/format'

export function AttendanceHistoryPage() {
  const [month, setMonth] = useState(currentMonth())
  const { data, isLoading } = useEmployeeMonthlyAttendance(month)

  const items = data?.items ?? []
  const summary = data?.summary

  return (
    <div>
      <PageHeader
        title="My Attendance"
        description="Monthly attendance log"
        actions={
          <Link to="/employee/attendance/charts">
            <Button variant="outline" theme="employee">
              <BarChart3 className="h-4 w-4" />
              Work hours chart
            </Button>
          </Link>
        }
      />

      <div className="mb-6 max-w-xs">
        <Input label="Month" type="month" value={month} onChange={(e) => setMonth(e.target.value)} />
      </div>

      {summary && (
        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: 'Present', value: summary.present ?? 0, color: 'text-teal-600' },
            { label: 'Absent', value: summary.absent ?? 0, color: 'text-red-500' },
            { label: 'Half day', value: summary.half_day ?? 0, color: 'text-yellow-600' },
            { label: 'On leave', value: summary.on_leave ?? 0, color: 'text-blue-600' },
          ].map((s) => (
            <Card key={s.label} padding="sm" className="text-center">
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-gray-500">{s.label}</p>
            </Card>
          ))}
        </div>
      )}

      {isLoading ? (
        <PageLoader />
      ) : items.length === 0 ? (
        <EmptyState title="No attendance records" description="No records for this month." />
      ) : (
        <Table>
          <TableHead>
            <TableRow>
              <TableHeader>Date</TableHeader>
              <TableHeader>Check In</TableHeader>
              <TableHeader>Check Out</TableHeader>
              <TableHeader>Breaks</TableHeader>
              <TableHeader>Hours</TableHeader>
              <TableHeader>Status</TableHeader>
              <TableHeader>Marked by</TableHeader>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((row, i) => (
              <TableRow key={row.id ?? row.date ?? i}>
                <TableCell className="font-medium">{formatDate(row.date, { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })}</TableCell>
                <TableCell>{row.check_in ? formatDateTime(row.check_in) : '—'}</TableCell>
                <TableCell>{row.check_out ? formatDateTime(row.check_out) : '—'}</TableCell>
                <TableCell className="max-w-[200px]">
                  {(row.breaks ?? []).length > 0 ? (
                    <div className="space-y-1">
                      {(row.breaks ?? []).map((b) => (
                        <div key={b.id} className="flex items-start gap-1 text-xs text-gray-600">
                          <Coffee className="mt-0.5 h-3 w-3 shrink-0 text-orange-400" />
                          <span>
                            {b.break_out ? formatDateTime(b.break_out) : '—'}
                            {' → '}
                            {b.break_in ? formatDateTime(b.break_in) : 'Ongoing'}
                            {b.duration ? ` (${b.duration})` : ''}
                          </span>
                        </div>
                      ))}
                      {row.total_break_minutes != null && row.total_break_minutes > 0 && (
                        <p className="text-xs font-medium text-orange-500">
                          Total: {row.total_break_minutes}m deducted
                        </p>
                      )}
                    </div>
                  ) : (
                    <span className="text-xs text-gray-400">No breaks</span>
                  )}
                </TableCell>
                <TableCell>
                  {row.net_hours_worked ? (
                    <div>
                      <p className="font-medium text-green-700">{String(row.net_hours_worked)}</p>
                      {row.is_complete ? (
                        <span className="text-xs text-green-500">Full day</span>
                      ) : (
                        <span className="text-xs text-red-400">Short day</span>
                      )}
                    </div>
                  ) : (
                    '—'
                  )}
                </TableCell>
                <TableCell>
                  {row.status ? (
                    <Badge variant={statusToBadgeVariant(row.status)}>{statusLabel(row.status)}</Badge>
                  ) : (
                    '—'
                  )}
                </TableCell>
                <TableCell className="capitalize text-gray-500">{row.marked_by ?? '—'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  )
}
