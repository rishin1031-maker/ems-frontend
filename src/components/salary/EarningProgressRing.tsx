import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { ProgressRing } from '@/components/ui/ProgressRing'
import { formatCurrency } from '@/lib/format'
import { TARGET_MONTHLY_HOURS } from '@/lib/constants'

export interface MonthlyEarnings {
  month?: string
  work_hours?: number
  target_hours?: number
  progress_percent?: number
  base_net?: number
  earned_net?: number
  remaining_hours?: number
  is_full_month?: boolean
}

interface EarningProgressRingProps {
  earnings?: MonthlyEarnings | null
  theme?: 'admin' | 'employee'
}

export function EarningProgressRing({ earnings, theme = 'employee' }: EarningProgressRingProps) {
  if (!earnings) {
    return (
      <Card>
        <CardHeader><CardTitle>Monthly Earnings</CardTitle></CardHeader>
        <p className="text-sm text-slate-500">No salary record on file yet. Contact HR to set up your salary.</p>
      </Card>
    )
  }

  const target = earnings.target_hours ?? TARGET_MONTHLY_HOURS
  const hours = earnings.work_hours ?? 0
  const pct = earnings.progress_percent ?? Math.min((hours / target) * 100, 100)
  const color = theme === 'employee' ? '#0284c7' : '#2563eb'

  return (
    <Card>
      <CardHeader>
        <CardTitle>Monthly Earnings Progress</CardTitle>
        <p className="text-xs text-slate-500">
          {earnings.month ?? 'This month'} · {hours.toFixed(1)}h / {target}h target
        </p>
      </CardHeader>
      <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-around">
        <ProgressRing
          value={pct}
          max={100}
          size={140}
          stroke={12}
          color={color}
          label={`${Math.round(pct)}%`}
          sublabel="of target"
        />
        <div className="space-y-3 text-sm">
          <div>
            <p className="text-xs text-slate-500">Full monthly net</p>
            <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              {formatCurrency(earnings.base_net ?? 0)}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Projected earned (live)</p>
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {formatCurrency(earnings.earned_net ?? 0)}
            </p>
          </div>
          {!earnings.is_full_month && (earnings.remaining_hours ?? 0) > 0 && (
            <p className="text-xs text-slate-500">
              {(earnings.remaining_hours ?? 0).toFixed(1)}h more to reach full payout
            </p>
          )}
          {earnings.is_full_month && (
            <p className="text-xs font-medium text-emerald-600">Full month target reached</p>
          )}
        </div>
      </div>
    </Card>
  )
}
