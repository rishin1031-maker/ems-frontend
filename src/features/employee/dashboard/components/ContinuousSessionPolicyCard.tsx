import { useQuery } from '@tanstack/react-query'
import { Info, TimerReset } from 'lucide-react'
import { employeePolicyApi } from '@/api/employee/policy.api'
import { Card } from '@/components/ui/Card'
import { formatDuration } from '@/lib/format'

export function ContinuousSessionPolicyCard() {
  const { data } = useQuery({
    queryKey: ['employee', 'policy', 'continuous-session'],
    queryFn: employeePolicyApi.continuousSession,
    staleTime: 60_000,
  })

  const policy = data?.continuous_session
  if (!policy?.enabled) return null

  return (
    <Card className="mb-6 border-sky-200/80 bg-sky-50/40 dark:border-sky-900/50 dark:bg-sky-950/20">
      <div className="flex gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-100 text-sky-700 dark:bg-sky-900/50 dark:text-sky-300">
          <Info className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Continuous working policy
          </h3>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            You can work any total hours in a day. You should not stay in one continuous stretch longer
            than <strong>{formatDuration(policy.limit_seconds)}</strong> without a break of at least{' '}
            <strong>{policy.min_break_minutes} min</strong>.
          </p>
          <ul className="mt-2 space-y-1 text-xs text-slate-500 dark:text-slate-400">
            <li className="flex items-start gap-1.5">
              <TimerReset className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              Reminder ~{policy.reminder_before_minutes} min before the limit
            </li>
            <li>
              After the limit{policy.grace_minutes > 0 ? ` + ${policy.grace_minutes}m grace` : ''}, you
              are auto-checked out with a recorded reason
            </li>
          </ul>
        </div>
      </div>
    </Card>
  )
}
