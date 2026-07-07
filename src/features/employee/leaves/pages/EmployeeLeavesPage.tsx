import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Trash2 } from 'lucide-react'
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
import { ConfirmDialog } from '@/components/feedback/ConfirmDialog'
import { LeaveBalanceCard } from '@/features/employee/dashboard/components/LeaveBalanceCard'
import {
  useEmployeeLeaves,
  useEmployeeLeaveMutations,
  useLeaveBalance,
} from '@/features/employee/leaves/hooks/useEmployeeLeaves'
import { useToast } from '@/components/feedback/ToastContext'
import { formatDate, statusLabel } from '@/lib/format'
import {
  getLeaveDays,
  getLeaveEndDate,
  getLeaveStartDate,
  getLeaveType,
  type Leave,
} from '@/api/types/leave'
import { LEAVE_STATUSES, type LeaveStatus } from '@/lib/constants'
import { LEAVE_TYPES, type LeaveType } from '@/lib/constants'
import type { EmployeeLeaveListParams } from '@/api/employee/leaves.api'

export function EmployeeLeavesPage() {
  const [filters, setFilters] = useState<EmployeeLeaveListParams>({ page: 1, per_page: 15 })
  const [cancelTarget, setCancelTarget] = useState<Leave | null>(null)

  const { data, isLoading } = useEmployeeLeaves(filters)
  const { data: balance } = useLeaveBalance()
  const { cancel } = useEmployeeLeaveMutations()
  const { success, error: toastError } = useToast()

  const items = data?.items ?? []

  const handleCancel = async () => {
    if (!cancelTarget) return
    try {
      await cancel.mutateAsync(cancelTarget.id)
      success('Leave cancelled')
      setCancelTarget(null)
    } catch (err) {
      toastError((err as Error).message ?? 'Failed to cancel leave')
    }
  }

  return (
    <div>
      <PageHeader
        title="My Leaves"
        description="View and manage your leave requests"
        actions={
          <Link to="/employee/leaves/apply">
            <Button theme="employee">
              <Plus className="h-4 w-4" />
              Apply Leave
            </Button>
          </Link>
        }
      />

      <div className="mb-6">
        <LeaveBalanceCard balance={balance} />
      </div>
      <div className="flex gap-6">
        <div className="mb-6 max-w-xl">
          <Select
            label="Status"
            placeholder="All statuses"
            options={LEAVE_STATUSES.map((s) => ({ value: s, label: statusLabel(s) }))}
            value={filters.status ?? ''}
            onChange={(e) =>
              setFilters({ ...filters, status: (e.target.value as LeaveStatus) || undefined, page: 1 })
            }
          />
        </div>
        <div className="mb-6 max-w-xl">
          <Select
            label="Type"
            placeholder="All Type"
            options={LEAVE_TYPES.map((s) => ({ value: s, label: statusLabel(s) }))}
            value={filters.status ?? ''}
            onChange={(e) =>
              setFilters({ ...filters, type: (e.target.value as LeaveType) || undefined, page: 1 })
            }
          />
        </div>
        </div>

      {isLoading ? (
        <PageLoader />
      ) : items.length === 0 ? (
        <EmptyState
          action={
            <Link to="/employee/leaves/apply">
              <Button theme="employee">Apply Leave</Button>
            </Link>
          }
        />
      ) : (
        <>
          <Table>
            <TableHead>
              <TableRow>
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
                  <TableCell className="capitalize">{getLeaveType(leave) ?? '—'}</TableCell>
                  <TableCell>{formatDate(getLeaveStartDate(leave))}</TableCell>
                  <TableCell>{formatDate(getLeaveEndDate(leave))}</TableCell>
                  <TableCell>{getLeaveDays(leave) ?? '—'}</TableCell>
                  <TableCell>
                    <Badge variant={statusToBadgeVariant(leave.status)}>{statusLabel(leave.status)}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end">
                      {leave.status === 'pending' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          theme="employee"
                          onClick={() => setCancelTarget(leave)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                          Cancel
                        </Button>
                      )}
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

      <ConfirmDialog
        open={Boolean(cancelTarget)}
        onClose={() => setCancelTarget(null)}
        onConfirm={handleCancel}
        title="Cancel Leave"
        description="Are you sure you want to cancel this leave request?"
        confirmLabel="Cancel Leave"
        loading={cancel.isPending}
      />
    </div>
  )
}
