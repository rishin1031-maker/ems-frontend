import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { ArrowLeft, Check, X } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge, statusToBadgeVariant } from '@/components/ui/Badge'
import { Textarea } from '@/components/ui/Textarea'
import { PageLoader } from '@/components/ui/Spinner'
import { ConfirmDialog } from '@/components/feedback/ConfirmDialog'
import { useLeave, useLeaveMutations } from '@/features/admin/leaves/hooks/useLeaves'
import { useToast } from '@/components/feedback/ToastContext'
import { formatDate, statusLabel } from '@/lib/format'
import { getLeaveDays, getLeaveEndDate, getLeaveStartDate, getLeaveType } from '@/api/types/leave'

export function LeaveDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data: leave, isLoading } = useLeave(id)
  const { approve, reject } = useLeaveMutations()
  const { error: toastError } = useToast()

  const [adminNote, setAdminNote] = useState('')
  const [action, setAction] = useState<'approve' | 'reject' | null>(null)

  const handleAction = async () => {
    if (!id || !action) return
    try {
      const payload = adminNote ? { admin_note: adminNote } : undefined
      if (action === 'approve') {
        await approve.mutateAsync({ id, payload })
      } else {
        await reject.mutateAsync({ id, payload })
      }
      setAction(null)
      setAdminNote('')
    } catch (err) {
      toastError((err as Error).message ?? 'Action failed')
    }
  }

  if (isLoading) return <PageLoader />
  if (!leave) return <p className="text-gray-500">Leave not found</p>

  const isPending = leave.status === 'pending'

  return (
    <div>
      <PageHeader
        title="Leave Details"
        actions={
          <Button variant="outline" theme="admin" onClick={() => window.history.back()}>
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        }
      />

      <Card className="max-w-2xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{leave.employee?.name ?? 'Employee'}</CardTitle>
            <Badge variant={statusToBadgeVariant(leave.status)}>{statusLabel(leave.status)}</Badge>
          </div>
        </CardHeader>

        <dl className="grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-xs text-gray-500">Employee ID</dt>
            <dd className="font-medium">{leave.employee?.employee_id ?? '—'}</dd>
          </div>
          <div>
            <dt className="text-xs text-gray-500">Leave Type</dt>
            <dd className="capitalize font-medium">{getLeaveType(leave) ?? '—'}</dd>
          </div>
          <div>
            <dt className="text-xs text-gray-500">Start Date</dt>
            <dd className="font-medium">{formatDate(getLeaveStartDate(leave))}</dd>
          </div>
          <div>
            <dt className="text-xs text-gray-500">End Date</dt>
            <dd className="font-medium">{formatDate(getLeaveEndDate(leave))}</dd>
          </div>
          <div>
            <dt className="text-xs text-gray-500">Days</dt>
            <dd className="font-medium">{getLeaveDays(leave) ?? '—'}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-xs text-gray-500">Reason</dt>
            <dd className="mt-1 text-sm">{leave.reason ?? '—'}</dd>
          </div>
          {leave.admin_note && (
            <div className="sm:col-span-2">
              <dt className="text-xs text-gray-500">Admin Note</dt>
              <dd className="mt-1 text-sm">{leave.admin_note}</dd>
            </div>
          )}
        </dl>

        {isPending && (
          <div className="mt-6 space-y-4 border-t border-gray-100 pt-6 dark:border-gray-800">
            <Textarea
              label="Admin Note (optional)"
              value={adminNote}
              onChange={(e) => setAdminNote(e.target.value)}
              placeholder="Add a note for the employee..."
            />
            <div className="flex gap-3">
              <Button theme="admin" onClick={() => setAction('approve')}>
                <Check className="h-4 w-4" />
                Approve
              </Button>
              <Button variant="danger" onClick={() => setAction('reject')}>
                <X className="h-4 w-4" />
                Reject
              </Button>
            </div>
          </div>
        )}
      </Card>

      <ConfirmDialog
        open={action === 'approve'}
        onClose={() => setAction(null)}
        onConfirm={handleAction}
        title="Approve Leave"
        description={`Approve leave request for ${leave.employee?.name}?`}
        confirmLabel="Approve"
        variant="primary"
        loading={approve.isPending}
      />

      <ConfirmDialog
        open={action === 'reject'}
        onClose={() => setAction(null)}
        onConfirm={handleAction}
        title="Reject Leave"
        description={`Reject leave request for ${leave.employee?.name}?`}
        confirmLabel="Reject"
        loading={reject.isPending}
      />
    </div>
  )
}
