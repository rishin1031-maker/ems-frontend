import { useState } from 'react'
import { Input } from '@/components/ui/Input'
import { PageLoader } from '@/components/ui/Spinner'
import {
  Table, TableHead, TableBody, TableRow, TableHeader, TableCell,
} from '@/components/ui/Table'
import { EmptyState } from '@/components/feedback/EmptyState'
import { useMonthlyAttendance } from '@/features/admin/attendance/hooks/useAttendance'
import { currentMonth } from '@/lib/format'

export function MonthlyAttendanceTab() {
  const [month, setMonth] = useState(currentMonth())
  const [search, setSearch] = useState('')
  const { data, isLoading } = useMonthlyAttendance({ month, search: search || undefined })

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 max-w-lg">
        <Input label="Month" type="month" value={month} onChange={(e) => setMonth(e.target.value)} />
        <Input label="Search" placeholder="Employee name or ID..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {isLoading ? (
        <PageLoader />
      ) : !data?.length ? (
        <EmptyState title="No monthly data" />
      ) : (
        <Table>
          <TableHead>
            <TableRow>
              <TableHeader>Employee</TableHeader>
              <TableHeader>Present</TableHeader>
              <TableHeader>Absent</TableHeader>
              <TableHeader>Half Day</TableHeader>
              <TableHeader>On Leave</TableHeader>
              <TableHeader>Not Marked</TableHeader>
              <TableHeader>Early Checkouts</TableHeader>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((row, i) => (
              <TableRow key={row.employee_id || i}>
                <TableCell>
                  <span className="font-medium">{row.employee?.name ?? '—'}</span>
                  <span className="ml-1 text-xs text-gray-400">{row.employee?.employee_id}</span>
                </TableCell>
                <TableCell>{row.present_days ?? 0}</TableCell>
                <TableCell>{row.absent_days ?? 0}</TableCell>
                <TableCell>{row.half_days ?? 0}</TableCell>
                <TableCell>{row.on_leave_days ?? 0}</TableCell>
                <TableCell>{row.not_marked_days ?? 0}</TableCell>
                <TableCell>{row.early_checkouts ?? 0}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  )
}
