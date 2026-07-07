import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

interface StatCardProps {
  title: string
  value: string | number
  icon?: ReactNode
  description?: string
  trend?: { label: string; positive?: boolean }
  progress?: { value: number; color?: 'blue' | 'orange' | 'green' }
  theme?: 'admin' | 'employee'
  className?: string
}

const accentClass = {
  admin: 'text-blue-600 dark:text-blue-400',
  employee: 'text-sky-600 dark:text-sky-400',
}

const iconBgClass = {
  admin: 'glass-chip text-blue-600 dark:text-blue-400',
  employee: 'glass-chip text-sky-600 dark:text-sky-400',
}

const progressBarClass = {
  blue: 'bg-blue-500',
  orange: 'bg-orange-400',
  green: 'bg-emerald-500',
}

export function StatCard({
  title,
  value,
  icon,
  description,
  trend,
  progress,
  theme = 'admin',
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        'rounded-2xl glass-card p-5',
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className={cn('mt-2 text-3xl font-semibold tabular-nums tracking-tight text-slate-900 dark:text-slate-100')}>
            {value}
          </p>
          {trend && (
            <p className={cn('mt-1.5 text-xs font-medium', trend.positive ? 'text-emerald-600' : 'text-slate-400')}>
              {trend.positive ? '↑ ' : ''}{trend.label}
            </p>
          )}
          {description && !trend && (
            <p className="mt-1.5 text-xs text-slate-400">{description}</p>
          )}
          {progress != null && (
            <div className="mt-3">
              <div className="h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                <div
                  className={cn('h-full rounded-full transition-all duration-500', progressBarClass[progress.color ?? 'blue'])}
                  style={{ width: `${Math.min(progress.value, 100)}%` }}
                />
              </div>
              <p className="mt-1 text-[11px] text-slate-400">{Math.round(progress.value)}% of total</p>
            </div>
          )}
        </div>
        {icon && (
          <div className={cn('rounded-xl p-2.5', iconBgClass[theme])}>{icon}</div>
        )}
      </div>
    </div>
  )
}

export function StatCardAccent({ className, children }: { className?: string; children: ReactNode }) {
  return <span className={cn('font-medium', className)}>{children}</span>
}

export { accentClass as statAccentClass }
