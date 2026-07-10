import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/cn'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  theme?: 'admin' | 'employee' | 'neutral'
}

const variantStyles = {
  primary: '',
  secondary:
    'border border-slate-300 bg-white text-slate-800 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700',
  danger: 'bg-red-600 text-white hover:bg-red-700 border border-red-700/20',
  ghost:
    'border border-transparent bg-transparent text-slate-700 hover:border-slate-200 hover:bg-white/90 dark:text-slate-200 dark:hover:border-slate-700 dark:hover:bg-slate-800/90',
  outline:
    'border-2 border-slate-400 bg-white text-slate-800 hover:border-slate-500 hover:bg-slate-50 dark:border-slate-500 dark:bg-slate-900 dark:text-slate-100 dark:hover:border-slate-400 dark:hover:bg-slate-800',
}

const themePrimary = {
  admin:
    'bg-blue-500 text-white hover:bg-blue-600 border border-blue-400/40 dark:bg-blue-500 dark:hover:bg-blue-600 dark:border-blue-400/30',
  employee:
    'bg-sky-500 text-white hover:bg-sky-600 border border-sky-400/40 dark:bg-sky-500 dark:hover:bg-sky-600 dark:border-sky-400/30',
  neutral:
    'bg-slate-800 text-white hover:bg-slate-700 border border-slate-700/30 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white dark:border-slate-300',
}

const sizes = {
  sm: 'h-8 px-3 text-sm',
  md: 'h-10 px-4 text-sm',
  lg: 'h-11 px-6 text-base',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      loading,
      disabled,
      theme = 'admin',
      children,
      ...props
    },
    ref,
  ) => (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
        'disabled:pointer-events-none disabled:opacity-50',
        variant === 'primary' ? themePrimary[theme] : variantStyles[variant],
        variant === 'primary' && theme === 'admin' && 'focus-visible:ring-blue-500',
        variant === 'primary' && theme === 'employee' && 'focus-visible:ring-sky-500',
        sizes[size],
        className,
      )}
      {...props}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  ),
)

Button.displayName = 'Button'
