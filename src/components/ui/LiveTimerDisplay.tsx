import { cn } from '@/lib/cn'
import { formatLiveTimer } from '@/lib/format'

type LiveTimerVariant = 'work' | 'break' | 'neutral'

interface LiveTimerDisplayProps {
  seconds: number
  label?: string
  status?: string
  variant?: LiveTimerVariant
  size?: 'md' | 'lg'
  className?: string
}

const variantClass: Record<LiveTimerVariant, string> = {
  work: 'text-blue-600 dark:text-blue-400',
  break: 'text-orange-500 dark:text-orange-400',
  neutral: 'text-gray-900 dark:text-gray-100',
}

export function LiveTimerDisplay({
  seconds,
  label,
  status,
  variant = 'neutral',
  size = 'lg',
  className,
}: LiveTimerDisplayProps) {
  return (
    <div className={cn('min-w-[8.5rem]', className)}>
      {label && (
        <p className="mb-1 text-[11px] font-medium uppercase tracking-wider text-gray-400">
          {label}
        </p>
      )}
      <p
        className={cn(
          'font-mono font-semibold tabular-nums tracking-tight',
          size === 'lg' ? 'text-2xl' : 'text-xl',
          variantClass[variant],
        )}
        aria-live="polite"
        aria-atomic
      >
        {formatLiveTimer(seconds)}
      </p>
      {status && <p className="mt-1 text-xs text-gray-500">{status}</p>}
    </div>
  )
}
