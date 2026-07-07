import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Eye, LayoutList, CalendarDays } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'
import { Badge, statusToBadgeVariant } from '@/components/ui/Badge'
import { Pagination } from '@/components/ui/Pagination'
import { PageLoader } from '@/components/ui/Spinner'
import { LeaveCalendarSkeleton } from '@/components/ui/Skeleton'
import {
  Table, TableHead, TableBody, TableRow, TableHeader, TableCell,
} from '@/components/ui/Table'
import { EmptyState } from '@/components/feedback/EmptyState'
import { LeaveCalendarView } from '@/components/leaves/LeaveCalendarView'
import { CreateLeaveModal } from '@/features/admin/leaves/components/CreateLeaveModal'
import { useLeaves } from '@/features/admin/leaves/hooks/useLeaves'
import { formatDate, statusLabel } from '@/lib/format'
import { getLeaveDays, getLeaveEndDate, getLeaveStartDate, getLeaveType } from '@/api/types/leave'
import { LEAVE_STATUSES, LEAVE_TYPES, type LeaveStatus, type LeaveType } from '@/lib/constants'
import type { LeaveListParams } from '@/api/types/leave'
import { cn } from '@/lib/cn'

type ViewMode = 'list' | 'calendar'

export function LeavesListPage() {
  const [filters, setFilters] = useState<LeaveListParams>({ page: 1, per_page: 15 })
  const [createOpen, setCreateOpen] = useState(false)
  const [view, setView] = useState<ViewMode>('list')

  const listParams = view === 'calendar'
    ? { ...filters, page: 1, per_page: 200 }
    : filters

  const { data, isLoading } = useLeaves(listParams)
  const items = data?.items ?? []

  return (
    <div>
      <PageHeader
        title="Leave Management"
        description="Review and manage employee leave requests"
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex rounded-xl border border-slate-200 p-0.5 dark:border-slate-700">
              <button
                type="button"
                onClick={() => setView('list')}
                className={cn(
                  'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition',
                  view === 'list'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800',
                )}
              >
                <LayoutList className="h-4 w-4" />
                List
              </button>
              <button
                type="button"
                onClick={() => setView('calendar')}
                className={cn(
                  'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition',
                  view === 'calendar'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800',
                )}
              >
                <CalendarDays className="h-4 w-4" />
                Calendar
              </button>
            </div>
            <Button theme="admin" onClick={() => setCreateOpen(true)}>
              <Plus className="h-4 w-4" />
              Create Leave
            </Button>
          </div>
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Select
          label="Status"
          placeholder="All statuses"
          options={LEAVE_STATUSES.map((s) => ({ value: s, label: statusLabel(s) }))}
          value={filters.status ?? ''}
          onChange={(e) => setFilters({ ...filters, status: (e.target.value as LeaveStatus) || undefined, page: 1 })}
        />
        <Select
          label="Type"
          placeholder="All types"
          options={LEAVE_TYPES.map((t) => ({ value: t, label: statusLabel(t) }))}
          value={filters.type ?? ''}
          onChange={(e) => setFilters({ ...filters, type: (e.target.value as LeaveType) || undefined, page: 1 })}
        />
      </div>

      {isLoading ? (
        view === 'calendar' ? <LeaveCalendarSkeleton /> : <PageLoader />
      ) : items.length === 0 ? (
        <EmptyState action={<Button theme="admin" onClick={() => setCreateOpen(true)}>Create Leave</Button>} />
      ) : view === 'calendar' ? (
        <LeaveCalendarView leaves={items} showEmployee adminLinks theme="admin" />
      ) : (
        <>
          <Table>
            <TableHead>
              <TableRow>
                <TableHeader>Employee</TableHeader>
                <TableHeader>Type</TableHeader>
                <TableHeader>From</TableHeader>
                <TableHeader>To</TableHeader>
                <TableHeader>Days</TableHeader>
                <TableHeader>Status</TableHeader>
                <TableHeader className="text-right">Actions</TableHeader>
              </TableRow>
            </TableHead>
            <TableBody>
              {items.map((leave) => (
                <TableRow key={leave.id}>
                  <TableCell className="font-medium">
                    {leave.employee?.name ?? '—'}
                    <span className="ml-1 text-xs text-gray-400">{leave.employee?.employee_id}</span>
                  </TableCell>
                  <TableCell className="capitalize">{getLeaveType(leave) ?? '—'}</TableCell>
                  <TableCell>{formatDate(getLeaveStartDate(leave))}</TableCell>
                  <TableCell>{formatDate(getLeaveEndDate(leave))}</TableCell>
                  <TableCell>{getLeaveDays(leave) ?? '—'}</TableCell>
                  <TableCell>
                    <Badge variant={statusToBadgeVariant(leave.status)}>{statusLabel(leave.status)}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end">
                      <Link to={`/admin/leaves/${leave.id}`}>
                        <Button variant="ghost" size="sm" theme="admin">
                          <Eye className="h-4 w-4" />
                          View
                        </Button>
                      </Link>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {data?.meta && (
            <div className="mt-4">
              <Pagination meta={data.meta} onPageChange={(page) => setFilters((f) => ({ ...f, page }))} />
            </div>
          )}
        </>
      )}

      <CreateLeaveModal open={createOpen} onClose={() => setCreateOpen(false)} />
    </div>
  )
}
