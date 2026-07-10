import { useEffect, useState } from 'react'
import { Save, Timer } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { PageLoader } from '@/components/ui/Spinner'
import { useToast } from '@/components/feedback/ToastContext'
import {
  useSystemSettings,
  useUpdateSystemSettings,
} from '@/features/admin/settings/hooks/useSystemSettings'
import { formatDuration } from '@/lib/format'

function minutesToLabel(minutes: number): string {
  return formatDuration(minutes * 60)
}

export function SystemSettingsPage() {
  const { data, isLoading, isError, error, refetch } = useSystemSettings()
  const update = useUpdateSystemSettings()
  const { success, error: toastError } = useToast()

  const [enabled, setEnabled] = useState(true)
  const [limitMinutes, setLimitMinutes] = useState(465)
  const [reminderBefore, setReminderBefore] = useState(15)
  const [graceMinutes, setGraceMinutes] = useState(5)
  const [minBreakMinutes, setMinBreakMinutes] = useState(2)

  useEffect(() => {
    const policy = data?.continuous_session
    if (!policy) return
    setEnabled(policy.enabled)
    setLimitMinutes(policy.limit_minutes)
    setReminderBefore(policy.reminder_before_minutes)
    setGraceMinutes(policy.grace_minutes)
    setMinBreakMinutes(policy.min_break_minutes)
  }, [data])

  if (isLoading) return <PageLoader />

  if (isError) {
    return (
      <div>
        <PageHeader
          title="System Settings"
          description="Configure attendance policies that apply to all employees"
        />
        <Card>
          <p className="text-sm text-red-600 dark:text-red-400">
            Could not load settings
            {error instanceof Error && error.message ? `: ${error.message}` : '.'}
          </p>
          <p className="mt-2 text-xs text-slate-500">
            If this is a 404, restart the Laravel API so `/api/v1/admin/settings` is registered, then retry.
          </p>
          <div className="mt-4">
            <Button theme="admin" variant="secondary" onClick={() => void refetch()}>
              Retry
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  const reminderAt = Math.max(0, limitMinutes - reminderBefore)
  const autoAt = limitMinutes + graceMinutes

  const handleSave = async () => {
    try {
      await update.mutateAsync({
        enabled,
        limit_minutes: limitMinutes,
        reminder_before_minutes: reminderBefore,
        grace_minutes: graceMinutes,
        min_break_minutes: minBreakMinutes,
      })
      success('Continuous session policy saved')
    } catch (err) {
      toastError(err instanceof Error ? err.message : 'Failed to save settings')
    }
  }

  return (
    <div>
      <PageHeader
        title="System Settings"
        description="Configure attendance policies that apply to all employees"
      />

      <Card>
        <CardHeader className="flex flex-row items-start gap-3 border-b border-slate-100 pb-4 dark:border-slate-800">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-300">
            <Timer className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <CardTitle className="text-base font-semibold">Continuous working session</CardTitle>
            <p className="mt-1 text-sm text-slate-500">
              Employees may work any total hours, but must not stay in one continuous stretch without a
              qualifying break. Reminder, limit, and grace period are enforced automatically.
            </p>
          </div>
          <label className="flex shrink-0 items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-200">
            <input
              type="checkbox"
              checked={enabled}
              onChange={(e) => setEnabled(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            Enabled
          </label>
        </CardHeader>

        <div className="grid gap-5 sm:grid-cols-2">
          <Input
            label="Session limit (minutes)"
            type="number"
            min={30}
            max={1440}
            value={limitMinutes}
            onChange={(e) => setLimitMinutes(Number(e.target.value))}
            hint={`Auto-checkout threshold base: ${minutesToLabel(limitMinutes)}`}
          />
          <Input
            label="Reminder before limit (minutes)"
            type="number"
            min={0}
            max={240}
            value={reminderBefore}
            onChange={(e) => setReminderBefore(Number(e.target.value))}
            hint={`Reminder at ${minutesToLabel(reminderAt)} continuous work`}
          />
          <Input
            label="Grace period (minutes)"
            type="number"
            min={0}
            max={120}
            value={graceMinutes}
            onChange={(e) => setGraceMinutes(Number(e.target.value))}
            hint={`Auto-checkout at ${minutesToLabel(autoAt)} if no action`}
          />
          <Input
            label="Minimum break to reset (minutes)"
            type="number"
            min={1}
            max={60}
            value={minBreakMinutes}
            onChange={(e) => setMinBreakMinutes(Number(e.target.value))}
            hint="Shorter breaks do not reset the continuous timer"
          />
        </div>

        <div className="mt-6 rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-600 dark:bg-slate-800/50 dark:text-slate-300">
          <p className="font-medium text-slate-800 dark:text-slate-100">How it works</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>Continuous time starts at check-in and pauses during breaks.</li>
            <li>
              A break of at least {minBreakMinutes} minute{minBreakMinutes === 1 ? '' : 's'} resets the
              continuous timer.
            </li>
            <li>
              At {minutesToLabel(reminderAt)}, the employee gets a reminder to break or check out.
            </li>
            <li>
              At {minutesToLabel(autoAt)}, the system auto-checks them out and records the reason.
            </li>
          </ul>
        </div>

        <div className="mt-6 flex justify-end">
          <Button theme="admin" onClick={() => void handleSave()} disabled={update.isPending}>
            <Save className="h-4 w-4" />
            {update.isPending ? 'Saving…' : 'Save policy'}
          </Button>
        </div>
      </Card>
    </div>
  )
}
