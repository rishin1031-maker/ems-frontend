import { cn } from '@/lib/cn'

interface ProgressRingProps {
  value: number
  max?: number
  size?: number
  stroke?: number
  label?: string
  sublabel?: string
  color?: string
  trackColor?: string
  className?: string
}

export function ProgressRing({
  value,
  max = 100,
  size = 120,
  stroke = 10,
  label,
  sublabel,
  color = '#2563eb',
  trackColor = 'rgba(148,163,184,0.25)',
  className,
}: ProgressRingProps) {
  const pct = max > 0 ? Math.min(Math.max((value / max) * 100, 0), 100) : 0
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (pct / 100) * circumference

  return (
    <div className={cn('relative inline-flex flex-col items-center', className)}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={trackColor}
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-[stroke-dashoffset] duration-700 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        {label && <span className="text-lg font-bold tabular-nums text-slate-900 dark:text-slate-100">{label}</span>}
        {sublabel && <span className="text-[10px] text-slate-500">{sublabel}</span>}
      </div>
    </div>
  )
}
