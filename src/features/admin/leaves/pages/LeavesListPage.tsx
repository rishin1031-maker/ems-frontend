import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Eye } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'
import { Badge, statusToBadgeVariant } from '@/components/ui/Badge'
import { Pagination } from '@/components/ui/Pagination'
import { PageLoader } from '@/components/ui/Spinner'
import {
  Table, TableHead, TableBody, TableRow, TableHeader, TableCell,
} from '@/components/ui/Table'
import { EmptyState } from '@/components/feedback/EmptyState'
import { CreateLeaveModal } from '@/features/admin/leaves/components/CreateLeaveModal'
import { useLeaves } from '@/features/admin/leaves/hooks/useLeaves'
import { formatDate, statusLabel } from '@/lib/format'
import { getLeaveDays, getLeaveEndDate, getLeaveStartDate, getLeaveType } from '@/api/types/leave'
import { LEAVE_STATUSES, LEAVE_TYPES, type LeaveStatus, type LeaveType } from '@/lib/constants'
import type { LeaveListParams } from '@/api/types/leave'

export function LeavesListPage() {
  const [filters, setFilters] = useState<LeaveListParams>({ page: 1, per_page: 15 })
  const [createOpen, setCreateOpen] = useState(false)

  const { data, isLoading } = useLeaves(filters)

  return (
    <div>
      <PageHeader
        title="Leave Management"
        description="Review and manage employee leave requests"
        actions={
          <Button theme="admin" onClick={() => setCreateOpen(true)}>
            <Plus className="h-4 w-4" />
            Create Leave
          </Button>
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
        <PageLoader />
      ) : (data?.items ?? []).length === 0 ? (
        <EmptyState action={<Button theme="admin" onClick={() => setCreateOpen(true)}>Create Leave</Button>} />
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
              {data.items.map((leave) => (
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
          {data.meta && (
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
