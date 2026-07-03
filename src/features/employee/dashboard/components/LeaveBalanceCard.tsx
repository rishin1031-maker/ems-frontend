import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { LEAVE_TYPES } from '@/lib/constants'
import { statusLabel } from '@/lib/format'
import { getLeaveBalanceRemaining, type NormalizedLeaveBalance } from '@/lib/liveStats'

interface LeaveBalanceCardProps {
  balance?: NormalizedLeaveBalance | null
}

export function LeaveBalanceCard({ balance }: LeaveBalanceCardProps) {
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
      <div className="grid gap-3 sm:grid-cols-3">
        {LEAVE_TYPES.map((type) => {
          const remaining = getLeaveBalanceRemaining(balance, type)
          if (remaining == null) return null
          const entry = balance[type]
          const detail = typeof entry === 'object' ? entry : null

          return (
            <div
              key={type}
              className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-center dark:border-gray-800 dark:bg-gray-900/50"
            >
              <p className="text-2xl font-bold text-teal-600 dark:text-teal-400">{remaining}</p>
              <p className="text-sm text-gray-500 capitalize">{statusLabel(type)}</p>
              {detail && (
                <p className="mt-1 text-xs text-gray-400">
                  {detail.used} used / {detail.total} total
                </p>
              )}
            </div>
          )
        })}
      </div>
    </Card>
  )
}
