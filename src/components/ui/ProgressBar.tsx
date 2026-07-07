import { cn } from '@/lib/cn'
import { TARGET_WORK_SECONDS } from '@/lib/constants'
import { formatDuration, formatLiveTimer } from '@/lib/format'

interface ProgressBarProps {
  value: number
  max?: number
  label?: string
  showTimer?: boolean
  className?: string
  completeClass?: string
}

export function ProgressBar({
  value,
  max = TARGET_WORK_SECONDS,
  label,
  showTimer,
  className,
  completeClass = 'bg-green-500',
}: ProgressBarProps) {
  const pct = Math.min((value / max) * 100, 100)
  const complete = value >= max

  return (
    <div className={cn('space-y-1', className)}>
      {(label || showTimer) && (
        <div className="flex justify-between text-xs text-gray-500">
          {label && <span>{label}</span>}
          {showTimer && (
            <span>
              {formatLiveTimer(value)} / {formatDuration(max)}
            </span>
          )}
        </div>
      )}
      <div className="h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
        <div
          className={cn('h-full rounded-full transition-[width] duration-1000 ease-linear', complete ? completeClass : 'bg-blue-500')}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
