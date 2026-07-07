import { Flame } from 'lucide-react'
import { cn } from '@/lib/cn'
import type { StreakResult } from '@/lib/attendanceHelpers'

interface AttendanceStreakBadgeProps {
  streak: StreakResult
  className?: string
}

export function AttendanceStreakBadge({ streak, className }: AttendanceStreakBadgeProps) {
  if (streak.current === 0 && streak.best === 0) return null

  const hot = streak.current >= 5

  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 rounded-xl glass-chip px-4 py-2',
        hot && 'ring-1 ring-orange-300/50',
        className,
      )}
    >
      <Flame className={cn('h-5 w-5', hot ? 'text-orange-500' : 'text-slate-400')} />
      <div>
        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
          {streak.current} day{streak.current !== 1 ? 's' : ''} streak
        </p>
        <p className="text-[11px] text-slate-500">
          {streak.label} · Best: {streak.best}
        </p>
      </div>
    </div>
  )
}
