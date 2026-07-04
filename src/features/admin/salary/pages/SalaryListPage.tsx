import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Eye, Plus, History } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { PageLoader } from '@/components/ui/Spinner'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { Pagination } from '@/components/ui/Pagination'
import {
  Table, TableHead, TableBody, TableRow, TableHeader, TableCell,
} from '@/components/ui/Table'
import { EmptyState } from '@/components/feedback/EmptyState'
import { AddSalaryModal } from '@/features/admin/salary/components/AddSalaryModal'
import { usePayroll, useSalaryList } from '@/features/admin/salary/hooks/useSalary'
import { formatCurrency, formatDate, currentMonth } from '@/lib/format'
import { TARGET_MONTHLY_HOURS } from '@/lib/constants'
import {
  buildPayrollEarnedMap,
  employeeHasSalary,
  getSalaryBase,
  getSalaryEarned,
  getSalaryEmployeeId,
  getSalaryNetHours,
} from '@/api/types/salary'

export function SalaryListPage() {
  const [month, setMonth] = useState(currentMonth())
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [addOpen, setAddOpen] = useState(false)

  const { data, isLoading } = useSalaryList({ month, search: search || undefined, page, per_page: 15 })
  const { data: payrollData } = usePayroll({ month, search: search || undefined })

  const earnedMap = useMemo(
    () => buildPayrollEarnedMap(payrollData?.items ?? []),
    [payrollData?.items],
  )

  const items = data?.items ?? []

  return (
    <div>
      <PageHeader
        title="Salary Management"
        description="Manage employee salaries and view earned pay by month"
        actions={
          <div className="flex flex-wrap gap-2">
            <Button theme="admin" onClick={() => setAddOpen(true)}>
              <Plus className="h-4 w-4" />
              Add Salary
            </Button>
            <Link to={`/admin/payroll?month=${month}`}>
              <Button variant="outline" theme="admin">Payroll Report</Button>
            </Link>
          </div>
        }
      />

      <div className="mb-4 rounded-lg border border-indigo-100 bg-indigo-50 p-4 text-sm text-indigo-800 dark:border-indigo-900 dark:bg-indigo-950/50 dark:text-indigo-200">
        Full monthly salary is paid when an employee completes {TARGET_MONTHLY_HOURS} net work hours. Below that, pay is proportional.
      </div>

      <div className="mb-6 grid max-w-lg gap-4 sm:grid-cols-2">
        <Input
          label="Month"
          type="month"
          value={month}
          onChange={(e) => {
            setMonth(e.target.value)
            setPage(1)
          }}
        />
        <Input
          label="Search"
          placeholder="Employee name or ID..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            setPage(1)
          }}
        />
      </div>

      {isLoading ? (
        <PageLoader />
      ) : items.length === 0 ? (
        <EmptyState
          title="No employees found"
          description="Try adjusting your search or add salary for a new employee."
          action={
            <Button theme="admin" onClick={() => setAddOpen(true)}>
              <Plus className="h-4 w-4" />
              Add Salary
            </Button>
          }
        />
      ) : (
        <>
          <Table>
            <TableHead>
              <TableRow>
                <TableHeader>Employee</TableHeader>
                <TableHeader>Work Hours</TableHeader>
                <TableHeader>Progress</TableHeader>
                <TableHeader>Full Net</TableHeader>
                <TableHeader>Earned Net</TableHeader>
                <TableHeader>Effective From</TableHeader>
                <TableHeader className="text-right">Actions</TableHeader>
              </TableRow>
            </TableHead>
            <TableBody>
              {items.map((row) => {
                const employeeId = getSalaryEmployeeId(row)
                const earned = earnedMap.get(employeeId)
                const hasSalary = employeeHasSalary(row)
                const hours = earned ? getSalaryNetHours(earned) : 0
                const target = earned?.target_hours ?? TARGET_MONTHLY_HOURS
                const progress = earned?.progress_percent ?? (hasSalary ? Math.min((hours / target) * 100, 100) : 0)

                return (
                  <TableRow key={employeeId}>
                    <TableCell>
                      <span className="font-medium">{row.employee.name}</span>
                      <span className="ml-1 block text-xs text-gray-400">
                        {row.employee.employee_id} · {row.employee.department?.name ?? '—'}
                      </span>
                    </TableCell>
                    <TableCell>
                      {hasSalary && earned ? (
                        <>
                          {hours.toFixed(1)}h / {target}h
                        </>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </TableCell>
                    <TableCell className="min-w-[120px]">
                      {hasSalary && earned ? (
                        <ProgressBar value={progress} max={100} label={`${progress.toFixed(0)}%`} />
                      ) : (
                        <span className="text-xs text-gray-400">No salary set</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {hasSalary ? formatCurrency(getSalaryBase(row)) : '—'}
                    </TableCell>
                    <TableCell className="font-medium text-indigo-600 dark:text-indigo-400">
                      {hasSalary && earned ? formatCurrency(getSalaryEarned(earned)) : '—'}
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {row.salary?.effective_from ? formatDate(row.salary.effective_from) : '—'}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-1">
                        <Link to={`/admin/salary/${employeeId}`}>
                          <Button variant="ghost" size="sm" theme="admin" title={hasSalary ? 'Manage salary' : 'Add salary'}>
                            {hasSalary ? (
                              <>
                                <Eye className="h-4 w-4" />
                                Manage
                              </>
                            ) : (
                              <>
                                <Plus className="h-4 w-4" />
                                Add
                              </>
                            )}
                          </Button>
                        </Link>
                        {hasSalary && (
                          <Link to={`/admin/salary/${employeeId}#history`}>
                            <Button variant="ghost" size="sm" theme="admin" title="Salary history">
                              <History className="h-4 w-4" />
                            </Button>
                          </Link>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>

          {data?.meta && data.meta.last_page > 1 && (
            <div className="mt-4">
              <Pagination meta={data.meta} onPageChange={setPage} />
            </div>
          )}
        </>
      )}

      <AddSalaryModal open={addOpen} onClose={() => setAddOpen(false)} />
    </div>
  )
}
