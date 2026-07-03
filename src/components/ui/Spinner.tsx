import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/cn'
import { PageSkeleton } from '@/components/ui/Skeleton'

interface SpinnerProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
  label?: string
}

const sizes = {
  sm: 'h-4 w-4',
  md: 'h-8 w-8',
  lg: 'h-12 w-12',
}

export function Spinner({ className, size = 'md', label = 'Loading...' }: SpinnerProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-2', className)} role="status">
      <Loader2 className={cn('animate-spin text-indigo-600 dark:text-indigo-400', sizes[size])} />
      {label && <span className="sr-only">{label}</span>}
    </div>
  )
}

interface PageLoaderProps {
  skeleton?: boolean
}

export function PageLoader({ skeleton = true }: PageLoaderProps) {
  if (skeleton) return <PageSkeleton />
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <Spinner size="lg" />
    </div>
  )
}
