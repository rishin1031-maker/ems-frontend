import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { ProgressRing } from '@/components/ui/ProgressRing'
import { LEAVE_TYPES } from '@/lib/constants'
import { statusLabel } from '@/lib/format'
import { getLeaveBalanceRemaining, type NormalizedLeaveBalance } from '@/lib/liveStats'

const GAUGE_COLORS: Record<string, string> = {
  casual: '#2563eb',
  sick: '#f59e0b',
  annual: '#10b981',
}

interface LeaveBalanceGaugesProps {
  balance?: NormalizedLeaveBalance | null
}

export function LeaveBalanceGauges({ balance }: LeaveBalanceGaugesProps) {
  if (!balance || Object.keys(balance).length === 0) return null

  const year = balance.year

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Leave Balance
          {typeof year === 'number' ? ` (${year})` : ''}
        </CardTitle>
      </CardHeader>
      <div className="grid gap-6 sm:grid-cols-3">
        {LEAVE_TYPES.map((type) => {
          const remaining = getLeaveBalanceRemaining(balance, type)
          if (remaining == null) return null
          const entry = balance[type]
          const detail = typeof entry === 'object' ? entry : null
          const total = detail?.total ?? 0
          const used = detail?.used ?? 0
          const pct = total > 0 ? (remaining / total) * 100 : 0

          return (
            <div key={type} className="flex flex-col items-center gap-2">
              <ProgressRing
                value={remaining}
                max={total || 1}
                size={100}
                stroke={9}
                color={GAUGE_COLORS[type]}
                label={String(remaining)}
                sublabel="days left"
              />
              <p className="text-sm font-medium capitalize text-slate-700 dark:text-slate-200">
                {statusLabel(type)}
              </p>
              {detail && (
                <p className="text-xs text-slate-500">
                  {used} used · {total} total · {Math.round(pct)}% left
                </p>
              )}
            </div>
          )
        })}
      </div>
    </Card>
  )
}

/** @deprecated Use LeaveBalanceGauges */
export function LeaveBalanceCard(props: LeaveBalanceGaugesProps) {
  return <LeaveBalanceGauges {...props} />
}
