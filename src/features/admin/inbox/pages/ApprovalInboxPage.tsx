import { useState, useOptimistic, useTransition } from 'react'
import { Link } from 'react-router-dom'
import { Check, Inbox, X } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/Button'
import { Badge, statusToBadgeVariant } from '@/components/ui/Badge'
import { Pagination } from '@/components/ui/Pagination'
import { TableSkeleton } from '@/components/ui/Skeleton'
import {
  Table, TableHead, TableBody, TableRow, TableHeader, TableCell,
} from '@/components/ui/Table'
import { EmptyState } from '@/components/feedback/EmptyState'
import { useLeaves, useLeaveMutations } from '@/features/admin/leaves/hooks/useLeaves'
import { useToast } from '@/components/feedback/ToastContext'
import { formatDate, statusLabel } from '@/lib/format'
import { getLeaveDays, getLeaveEndDate, getLeaveStartDate, getLeaveType } from '@/api/types/leave'
import type { Leave } from '@/api/types/leave'

type InboxAction =
  | { type: 'approve'; ids: number[] }
  | { type: 'reject'; ids: number[] }

export function ApprovalInboxPage() {
  const [selected, setSelected] = useState<Set<number>>(new Set())
  const [page, setPage] = useState(1)
  const [, startTransition] = useTransition()

  const { data, isLoading } = useLeaves({ status: 'pending', page, per_page: 20 })
  const { approve, reject } = useLeaveMutations()
  const { success, error: toastError } = useToast()

  const serverItems = data?.items ?? []
  const [optimisticItems, addOptimistic] = useOptimistic(
    serverItems,
    (current, action: InboxAction) => {
      const idSet = new Set(action.ids)
      // Pending inbox: remove actioned rows immediately
      return current.filter((leave) => !idSet.has(leave.id))
    },
  )

  const toggle = (id: number) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleAll = () => {
    if (selected.size === optimisticItems.length) setSelected(new Set())
    else setSelected(new Set(optimisticItems.map((l) => l.id)))
  }

  const bulkAction = (action: 'approve' | 'reject') => {
    const ids = [...selected]
    if (ids.length === 0) return

    startTransition(async () => {
      addOptimistic({ type: action, ids })
      setSelected(new Set())
      try {
        for (const id of ids) {
          if (action === 'approve') await approve.mutateAsync({ id })
          else await reject.mutateAsync({ id })
        }
        success(
          `${ids.length} leave request${ids.length > 1 ? 's' : ''} ${
            action === 'approve' ? 'approved' : 'rejected'
          }`,
        )
      } catch (err) {
        toastError((err as Error).message ?? 'Bulk action failed')
      }
    })
  }

  const isBusy = approve.isPending || reject.isPending

  return (
    <div>
      <PageHeader
        title="Approval Inbox"
        description="Pending leave requests — review individually or in bulk"
        actions={
          selected.size > 0 ? (
            <div className="flex flex-wrap gap-2">
              <Button theme="admin" onClick={() => bulkAction('approve')} loading={isBusy}>
                <Check className="h-4 w-4" />
                Approve ({selected.size})
              </Button>
              <Button variant="danger" onClick={() => bulkAction('reject')} loading={isBusy}>
                <X className="h-4 w-4" />
                Reject ({selected.size})
              </Button>
            </div>
          ) : undefined
        }
      />

      {isLoading ? (
        <TableSkeleton rows={6} cols={6} />
      ) : optimisticItems.length === 0 ? (
        <EmptyState
          title="Inbox zero"
          description="No pending leave requests right now."
          action={
            <Link to="/admin/leaves">
              <Button variant="outline" theme="admin">View all leaves</Button>
            </Link>
          }
        />
      ) : (
        <>
          <div className="mb-3 flex items-center gap-2 text-sm text-slate-500">
            <Inbox className="h-4 w-4" />
            {optimisticItems.length} pending
          </div>
          <div className="overflow-hidden rounded-2xl glass-card">
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeader>
                    <input
                      type="checkbox"
                      checked={selected.size === optimisticItems.length && optimisticItems.length > 0}
                      onChange={toggleAll}
                      aria-label="Select all"
                    />
                  </TableHeader>
                  <TableHeader>Employee</TableHeader>
                  <TableHeader>Type</TableHeader>
                  <TableHeader>Dates</TableHeader>
                  <TableHeader>Days</TableHeader>
                  <TableHeader className="text-right">Actions</TableHeader>
                </TableRow>
              </TableHead>
              <TableBody>
                {optimisticItems.map((leave: Leave) => (
                  <TableRow key={leave.id}>
                    <TableCell>
                      <input
                        type="checkbox"
                        checked={selected.has(leave.id)}
                        onChange={() => toggle(leave.id)}
                        aria-label={`Select ${leave.employee?.name}`}
                      />
                    </TableCell>
                    <TableCell>
                      <p className="font-medium">{leave.employee?.name ?? '—'}</p>
                      <p className="text-xs text-slate-400">{leave.employee?.employee_id}</p>
                    </TableCell>
                    <TableCell className="capitalize">{getLeaveType(leave)}</TableCell>
                    <TableCell className="text-sm">
                      {formatDate(getLeaveStartDate(leave))} – {formatDate(getLeaveEndDate(leave))}
                    </TableCell>
                    <TableCell>{getLeaveDays(leave) ?? '—'}</TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-1">
                        <Link to={`/admin/leaves/${leave.id}`}>
                          <Button variant="ghost" size="sm" theme="admin">Review</Button>
                        </Link>
                        <Badge variant={statusToBadgeVariant(leave.status)}>{statusLabel(leave.status)}</Badge>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {data?.meta && (
            <div className="mt-4">
              <Pagination meta={data.meta} onPageChange={setPage} />
            </div>
          )}
        </>
      )}
    </div>
  )
}
