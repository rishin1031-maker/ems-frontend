import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

interface GlassShellProps {
  children: ReactNode
  variant?: 'admin' | 'employee'
  className?: string
}

export function GlassShell({ children, variant = 'admin', className }: GlassShellProps) {
  return (
    <div
      className={cn(
        'glass-shell relative min-h-screen',
        variant === 'employee' && 'glass-shell-employee',
        className,
      )}
    >
      <div className="glass-orb glass-orb-1" aria-hidden="true" />
      <div className="glass-orb glass-orb-2" aria-hidden="true" />
      <div className="glass-orb glass-orb-3" aria-hidden="true" />
      {children}
    </div>
  )
}
