import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

export function Table({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-800', className)}>
      <table className="w-full min-w-[640px] text-left text-sm">{children}</table>
    </div>
  )
}

export function TableHead({ children }: { children: ReactNode }) {
  return (
    <thead className="border-b border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900/50">
      {children}
    </thead>
  )
}

export function TableBody({ children }: { children: ReactNode }) {
  return <tbody className="divide-y divide-gray-100 dark:divide-gray-800">{children}</tbody>
}

export function TableRow({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <tr className={cn('bg-white transition-colors hover:bg-gray-50 dark:bg-gray-900 dark:hover:bg-gray-800/50', className)}>
      {children}
    </tr>
  )
}

export function TableHeader({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <th className={cn('px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400', className)}>
      {children}
    </th>
  )
}

export function TableCell({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <td className={cn('px-4 py-3 text-gray-700 dark:text-gray-300', className)}>
      {children}
    </td>
  )
}
