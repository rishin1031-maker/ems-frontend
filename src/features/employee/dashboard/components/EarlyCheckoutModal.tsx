import { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Textarea } from '@/components/ui/Textarea'
import { Button } from '@/components/ui/Button'
import { useEmployeeAttendanceMutations } from '@/features/employee/attendance/hooks/useEmployeeAttendance'
import { useToast } from '@/components/feedback/ToastContext'
import { formatLiveTimer } from '@/lib/format'

interface EarlyCheckoutModalProps {
  open: boolean
  onClose: () => void
  isComplete?: boolean
  netSeconds?: number
  breakSeconds?: number
}

export function EarlyCheckoutModal({
  open,
  onClose,
  isComplete = false,
  netSeconds = 0,
  breakSeconds = 0,
}: EarlyCheckoutModalProps) {
  const [reason, setReason] = useState('')
  const [error, setError] = useState('')
  const { checkOut } = useEmployeeAttendanceMutations()
  const { success, error: toastError } = useToast()

  const handleSubmit = async () => {
    if (!isComplete && reason.trim().length < 5) {
      setError('Please provide a reason (minimum 5 characters)')
      return
    }
    try {
      await checkOut.mutateAsync(isComplete ? undefined : { early_reason: reason.trim() })
      success('Checked out successfully')
      setReason('')
      setError('')
      onClose()
    } catch (err) {
      toastError((err as Error).message ?? 'Check-out failed')
    }
  }

  const handleClose = () => {
    setReason('')
    setError('')
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={isComplete ? 'Confirm Check Out' : 'Early Check Out'}
      description={
        isComplete
          ? 'You have completed your 8-hour workday. Great work!'
          : "You haven't completed 8 hours of net work. Please provide a reason."
      }
    >
      <div className="mb-4 space-y-2 rounded-lg bg-gray-50 p-3 text-sm dark:bg-gray-900/50">
        <div className="flex justify-between">
          <span className="text-gray-500">Net work time</span>
          <span className={`font-bold ${isComplete ? 'text-green-600' : 'text-red-600'}`}>
            {formatLiveTimer(netSeconds)}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Total break</span>
          <span className="font-medium text-orange-500">{formatLiveTimer(breakSeconds)}</span>
        </div>
      </div>

      {!isComplete && (
        <Textarea
          label="Reason for early checkout"
          value={reason}
          onChange={(e) => {
            setReason(e.target.value)
            setError('')
          }}
          error={error}
          placeholder="Minimum 5 characters..."
          rows={4}
        />
      )}

      <div className="mt-4 flex justify-end gap-3">
        <Button variant="outline" theme="employee" onClick={handleClose}>
          Cancel
        </Button>
        <Button theme="employee" onClick={handleSubmit} loading={checkOut.isPending}>
          Confirm Check Out
        </Button>
      </div>
    </Modal>
  )
}
