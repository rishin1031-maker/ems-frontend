import { cn } from '@/lib/cn'

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info'

interface BadgeProps {
  children: React.ReactNode
  variant?: BadgeVariant
  className?: string
}

const variants: Record<BadgeVariant, string> = {
  default: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  success: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300',
  danger: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
  info: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
}

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize',
        variants[variant],
        className,
      )}
    >
      {children}
    </span>
  )
}

export function statusToBadgeVariant(status: string): BadgeVariant {
  switch (status) {
    case 'approved':
    case 'present':
    case 'active':
      return 'success'
    case 'pending':
      return 'warning'
    case 'rejected':
    case 'absent':
    case 'inactive':
    case 'cancelled':
      return 'danger'
    case 'half_day':
    case 'on_leave':
      return 'info'
    default:
      return 'default'
  }
}
