import { AlertTriangle, Coffee } from 'lucide-react'
import { formatDuration, formatLiveTimer } from '@/lib/format'
import type { ContinuousSessionPolicy } from '@/api/types/settings'
import { cn } from '@/lib/cn'

interface ContinuousSessionBannerProps {
  continuousSeconds: number
  warning: boolean
  inGrace: boolean
  onBreak: boolean
  policy?: ContinuousSessionPolicy | null
  className?: string
}

export function ContinuousSessionBanner({
  continuousSeconds,
  warning,
  inGrace,
  onBreak,
  policy,
  className,
}: ContinuousSessionBannerProps) {
  if (!policy?.enabled) return null
  if (!warning && !inGrace && continuousSeconds < policy.reminder_at_seconds) {
    // Still show a compact continuous timer when checked in and past 30 min for awareness
    if (continuousSeconds < 30 * 60) return null
  }

  const remaining = Math.max(0, policy.limit_seconds - continuousSeconds)
  const urgent = inGrace || continuousSeconds >= policy.limit_seconds

  return (
    <div
      className={cn(
        'mb-4 rounded-xl border px-4 py-3',
        urgent
          ? 'border-red-200 bg-red-50/80 text-red-900 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-100'
          : warning
            ? 'border-amber-200 bg-amber-50/80 text-amber-950 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-100'
            : 'border-slate-200 bg-slate-50/80 text-slate-700 dark:border-slate-700 dark:bg-slate-800/40 dark:text-slate-200',
        className,
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-start gap-2">
          {urgent || warning ? (
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          ) : (
            <Coffee className="mt-0.5 h-4 w-4 shrink-0" />
          )}
          <div>
            <p className="text-sm font-semibold">
              Continuous session: {formatLiveTimer(continuousSeconds)}
              {onBreak ? ' (paused on break)' : ''}
            </p>
            <p className="mt-0.5 text-xs opacity-90">
              {urgent
                ? `Limit reached. Auto-checkout in grace (${formatDuration(policy.grace_seconds)}) — take a ${policy.min_break_minutes}+ min break or check out now.`
                : warning
                  ? `Approaching the ${formatDuration(policy.limit_seconds)} continuous limit. About ${formatDuration(remaining)} left — take a break or check out.`
                  : `Limit ${formatDuration(policy.limit_seconds)}. A ${policy.min_break_minutes}+ min break resets this timer.`}
            </p>
          </div>
        </div>
        {!onBreak && (
          <span className="rounded-lg bg-white/70 px-2.5 py-1 text-xs font-medium tabular-nums dark:bg-black/20">
            {remaining > 0 ? `${formatDuration(remaining)} to limit` : 'Over limit'}
          </span>
        )}
      </div>
    </div>
  )
}
