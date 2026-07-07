import { useState } from 'react'
import { IndianRupee, Users, Clock, Download } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { StatCard } from '@/components/layout/StatCard'
import { ReportSkeleton } from '@/components/ui/Skeleton'
import { ProgressBar } from '@/components/ui/ProgressBar'
import {
  Table, TableHead, TableBody, TableRow, TableHeader, TableCell,
} from '@/components/ui/Table'
import { EmptyState } from '@/components/feedback/EmptyState'
import { usePayroll } from '@/features/admin/salary/hooks/useSalary'
import { formatCurrency, formatNumber, currentMonth } from '@/lib/format'
import { TARGET_MONTHLY_HOURS } from '@/lib/constants'
import {
  getPayrollAvgHours,
  getPayrollEmployeeCount,
  getPayrollTotalPayroll,
  getSalaryBase,
  getSalaryEarned,
  getSalaryNetHours,
  getSalaryTotal,
} from '@/api/types/salary'
import { downloadExcelCsv } from '@/lib/exportCsv'

export function PayrollPage() {
  const [month, setMonth] = useState(currentMonth())
  const [search, setSearch] = useState('')
  const { data, isLoading } = usePayroll({ month, search: search || undefined })

  const summary = data?.summary
  const items = data?.items ?? []

  const handleExport = () => {
    downloadExcelCsv(
      `payroll-${data?.month ?? month}.csv`,
      ['Employee', 'Employee ID', 'Department', 'Base Salary', 'Net Hours', 'Target Hours', 'Progress %', 'Earned', 'Total Payout'],
      items.map((row) => {
        const hours = getSalaryNetHours(row)
        const target = row.target_hours ?? TARGET_MONTHLY_HOURS
        return [
          row.employee?.name ?? row.name ?? '',
          row.employee?.employee_id ?? row.emp_code ?? '',
          row.employee?.department?.name ?? row.department ?? '',
          getSalaryBase(row),
          hours.toFixed(1),
          target,
          row.progress_percent ?? Math.min((hours / target) * 100, 100),
          getSalaryEarned(row),
          getSalaryTotal(row),
        ]
      }),
    )
  }

  return (
    <div>
      <PageHeader
        title="Payroll Report"
        description="Monthly payroll summary for all employees"
        actions={
          !isLoading && items.length > 0 ? (
            <Button variant="outline" theme="admin" onClick={handleExport}>
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
          ) : undefined
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 max-w-lg">
        <Input label="Month" type="month" value={month} onChange={(e) => setMonth(e.target.value)} />
        <Input label="Search" placeholder="Employee..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {isLoading ? (
        <ReportSkeleton />
      ) : (
        <>
          {summary && (
            <div className="mb-6 grid gap-4 sm:grid-cols-3">
              <StatCard
                title="Total Payroll"
                value={formatCurrency(getPayrollTotalPayroll(summary))}
                icon={<IndianRupee className="h-5 w-5" />}
                theme="admin"
              />
              <StatCard
                title="Employees"
                value={getPayrollEmployeeCount(summary, items) ?? '—'}
                icon={<Users className="h-5 w-5" />}
                theme="admin"
              />
              <StatCard
                title="Avg Hours"
                value={formatNumber(getPayrollAvgHours(summary))}
                icon={<Clock className="h-5 w-5" />}
                theme="admin"
              />
            </div>
          )}

          {items.length === 0 ? (
            <EmptyState title="No payroll data" />
          ) : (
            <Card padding="none">
              <CardHeader className="px-6 pt-6">
                <CardTitle>Payroll — {data?.month ?? month}</CardTitle>
              </CardHeader>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableHeader>Employee</TableHeader>
                    <TableHeader>Department</TableHeader>
                    <TableHeader>Base Salary</TableHeader>
                    <TableHeader>Net Hours</TableHeader>
                    <TableHeader>Progress</TableHeader>
                    <TableHeader>Earned</TableHeader>
                    <TableHeader>Total Payout</TableHeader>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {items.map((row, index) => {
                    const hours = getSalaryNetHours(row)
                    const target = row.target_hours ?? TARGET_MONTHLY_HOURS
                    const rowKey = row.employee_id || row.employee?.id || index

                    return (
                      <TableRow key={rowKey}>
                        <TableCell>
                          <span className="font-medium">{row.employee?.name ?? '—'}</span>
                          {row.employee?.employee_id && (
                            <span className="ml-1 text-xs text-gray-400">{row.employee.employee_id}</span>
                          )}
                        </TableCell>
                        <TableCell>{row.employee?.department?.name ?? '—'}</TableCell>
                        <TableCell>{formatCurrency(getSalaryBase(row))}</TableCell>
                        <TableCell>{hours.toFixed(1)}h / {target}h</TableCell>
                        <TableCell className="min-w-[100px]">
                          <ProgressBar value={hours * 3600} max={target * 3600} />
                        </TableCell>
                        <TableCell>{formatCurrency(getSalaryEarned(row))}</TableCell>
                        <TableCell className="font-semibold text-indigo-600 dark:text-indigo-400">
                          {formatCurrency(getSalaryTotal(row))}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </Card>
          )}
        </>
      )}
    </div>
  )
}
