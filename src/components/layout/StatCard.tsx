import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

interface StatCardProps {
  title: string
  value: string | number
  icon?: ReactNode
  description?: string
  theme?: 'admin' | 'employee'
  className?: string
}

export function StatCard({
  title,
  value,
  icon,
  description,
  theme = 'admin',
  className,
}: StatCardProps) {
  const accent =
    theme === 'admin'
      ? 'text-indigo-600 dark:text-indigo-400'
      : 'text-teal-600 dark:text-teal-400'

  return (
    <div
      className={cn(
        'rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900',
        className,
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
          <p className={cn('mt-2 text-3xl font-bold', accent)}>{value}</p>
          {description && (
            <p className="mt-1 text-xs text-gray-400">{description}</p>
          )}
        </div>
        {icon && <div className={cn('rounded-lg bg-gray-50 p-2 dark:bg-gray-800', accent)}>{icon}</div>}
      </div>
    </div>
  )
}
