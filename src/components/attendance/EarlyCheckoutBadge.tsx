import { AlertTriangle } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { getEarlyCheckoutReason, isEarlyCheckoutNote } from '@/lib/attendanceHelpers'

interface EarlyCheckoutBadgeProps {
  note?: string | null
  isComplete?: boolean
  netHours?: string | number | null
}

export function EarlyCheckoutBadge({ note, isComplete, netHours }: EarlyCheckoutBadgeProps) {
  const isEarly = isEarlyCheckoutNote(note) || (isComplete === false && note)
  if (!isEarly && isComplete !== false) return null

  const reason = getEarlyCheckoutReason(note)

  return (
    <div className="mt-1.5 flex flex-wrap items-start gap-1">
      <Badge variant="warning" className="gap-1">
        <AlertTriangle className="h-3 w-3" />
        Early checkout
      </Badge>
      {reason && (
        <span className="text-[11px] text-amber-700 dark:text-amber-400" title={reason}>
          {reason.length > 48 ? `${reason.slice(0, 48)}…` : reason}
        </span>
      )}
      {!reason && isComplete === false && netHours != null && (
        <span className="text-[11px] text-amber-600">Under 8h net ({String(netHours)})</span>
      )}
    </div>
  )
}
