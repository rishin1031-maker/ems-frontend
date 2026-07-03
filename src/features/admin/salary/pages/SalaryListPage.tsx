import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Eye } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { PageLoader } from '@/components/ui/Spinner'
import { ProgressBar } from '@/components/ui/ProgressBar'
import {
  Table, TableHead, TableBody, TableRow, TableHeader, TableCell,
} from '@/components/ui/Table'
import { EmptyState } from '@/components/feedback/EmptyState'
import { usePayroll } from '@/features/admin/salary/hooks/useSalary'
import { formatCurrency, currentMonth } from '@/lib/format'
import { TARGET_MONTHLY_HOURS } from '@/lib/constants'
import {
  getSalaryBase,
  getSalaryEarned,
  getSalaryEmployeeId,
  getSalaryNetHours,
} from '@/api/types/salary'

export function SalaryListPage() {
  const [month, setMonth] = useState(currentMonth())
  const [search, setSearch] = useState('')
  const { data, isLoading } = usePayroll({ month, search: search || undefined })

  const items = data?.items ?? []

  return (
    <div>
      <PageHeader
        title="Salary Management"
        description="Earned salary overview by month"
        actions={
          <Link to={`/admin/payroll?month=${month}`}>
            <Button variant="outline" theme="admin">Payroll Report</Button>
          </Link>
        }
      />

      <div className="mb-4 rounded-lg border border-indigo-100 bg-indigo-50 p-4 text-sm text-indigo-800 dark:border-indigo-900 dark:bg-indigo-950/50 dark:text-indigo-200">
        Full monthly salary is paid when an employee completes {TARGET_MONTHLY_HOURS} net work hours. Below that, pay is proportional.
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 max-w-lg">
        <Input
          label="Month"
          type="month"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
        />
        <Input
          label="Search"
          placeholder="Employee name or ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {isLoading ? (
        <PageLoader />
      ) : items.length === 0 ? (
        <EmptyState title="No salary records" />
      ) : (
        <Table>
          <TableHead>
            <TableRow>
              <TableHeader>Employee</TableHeader>
              <TableHeader>Work Hours</TableHeader>
              <TableHeader>Progress</TableHeader>
              <TableHeader>Full Net</TableHeader>
              <TableHeader>Earned Net</TableHeader>
              <TableHeader className="text-right">Actions</TableHeader>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((row, index) => {
              const hours = getSalaryNetHours(row)
              const target = row.target_hours ?? TARGET_MONTHLY_HOURS
              const employeeId = getSalaryEmployeeId(row)
              const progress = row.progress_percent ?? Math.min((hours / target) * 100, 100)

              return (
                <TableRow key={employeeId || index}>
                  <TableCell>
                    <span className="font-medium">{row.employee?.name ?? row.name ?? '—'}</span>
                    <span className="ml-1 block text-xs text-gray-400">
                      {row.employee?.employee_id ?? row.emp_code} · {row.department ?? row.employee?.department?.name ?? '—'}
                    </span>
                  </TableCell>
                  <TableCell>
                    {hours.toFixed(1)}h / {target}h
                  </TableCell>
                  <TableCell className="min-w-[120px]">
                    <ProgressBar value={progress} max={100} label={`${progress.toFixed(0)}%`} />
                  </TableCell>
                  <TableCell>{formatCurrency(getSalaryBase(row))}</TableCell>
                  <TableCell className="font-medium text-indigo-600 dark:text-indigo-400">
                    {formatCurrency(getSalaryEarned(row))}
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end">
                      <Link to={`/admin/salary/${employeeId}`}>
                        <Button variant="ghost" size="sm" theme="admin">
                          <Eye className="h-4 w-4" />
                          Manage
                        </Button>
                      </Link>
                    </div>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      )}
    </div>
  )
}
