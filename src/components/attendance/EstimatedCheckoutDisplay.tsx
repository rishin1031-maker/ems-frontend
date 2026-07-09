import { LogOut } from 'lucide-react'
import { estimateCheckout } from '@/lib/estimatedCheckout'
import { TARGET_WORK_SECONDS } from '@/lib/constants'
import { cn } from '@/lib/cn'

interface EstimatedCheckoutDisplayProps {
  netSeconds: number
  targetSeconds?: number
  isOnBreak?: boolean
  isComplete?: boolean
  isCheckedIn?: boolean
  compact?: boolean
  className?: string
}

const kindClass = {
  time: 'text-teal-700 dark:text-teal-300',
  complete: 'text-emerald-600 dark:text-emerald-400',
  paused: 'text-amber-600 dark:text-amber-400',
  none: 'text-slate-500',
} as const

export function EstimatedCheckoutDisplay({
  netSeconds,
  targetSeconds = TARGET_WORK_SECONDS,
  isOnBreak = false,
  isComplete = false,
  isCheckedIn = true,
  compact = false,
  className,
}: EstimatedCheckoutDisplayProps) {
  const result = estimateCheckout({
    netSeconds,
    targetSeconds,
    isOnBreak,
    isComplete,
    isCheckedIn,
  })

  if (result.kind === 'none') return null

  return (
    <div
      className={cn(
        'flex items-center gap-2',
        compact ? 'text-xs' : 'rounded-xl bg-teal-50/60 px-4 py-3 dark:bg-teal-950/20',
        className,
      )}
    >
      <LogOut
        className={cn(
          'shrink-0',
          compact ? 'h-3.5 w-3.5 text-slate-400' : 'h-4 w-4 text-teal-600 dark:text-teal-400',
        )}
        aria-hidden
      />
      <div className="min-w-0">
        {!compact && (
          <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
            Est. check-out
          </p>
        )}
        <p
          className={cn(
            'font-semibold tabular-nums',
            compact ? 'text-xs' : 'text-lg',
            kindClass[result.kind],
          )}
          aria-live="polite"
        >
          {compact && <span className="mr-1 font-normal text-slate-500">Est. out</span>}
          {result.label}
        </p>
      </div>
    </div>
  )
}
