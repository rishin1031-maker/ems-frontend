import { formatCurrency, formatDate } from '@/lib/format'
import type { SalaryBreakdown, SalaryHistoryEntry } from '@/api/types/salary'
import { cn } from '@/lib/cn'

interface PayslipBreakdownProps {
  salary: SalaryBreakdown
  historyEntry?: SalaryHistoryEntry | null
  earnedNet?: number
  workHours?: number
  className?: string
}

function Line({
  label,
  value,
  bold,
  negative,
  highlight,
}: {
  label: string
  value: number | string | undefined
  bold?: boolean
  negative?: boolean
  highlight?: boolean
}) {
  if (value == null || value === '') return null
  const num = typeof value === 'number' ? value : Number(value)
  const display = typeof value === 'string' && Number.isNaN(num) ? value : formatCurrency(num)

  return (
    <div className={cn('flex justify-between gap-4 py-1.5 text-sm', bold && 'font-semibold', highlight && 'text-emerald-600 dark:text-emerald-400')}>
      <span className={cn('text-slate-600 dark:text-slate-400', negative && 'text-red-500')}>{label}</span>
      <span className={cn('tabular-nums', negative && 'text-red-600')}>{negative ? `− ${display}` : display}</span>
    </div>
  )
}

export function PayslipBreakdown({ salary, historyEntry, earnedNet, workHours, className }: PayslipBreakdownProps) {
  const allowances =
    (salary.hra ?? 0) +
    (salary.transport ?? 0) +
    (salary.medical ?? 0) +
    (salary.other_allowance ?? 0)

  const deductions =
    (salary.pf_deduction ?? 0) +
    (salary.tax_deduction ?? 0) +
    (salary.other_deduction ?? 0)

  const gross = salary.gross_salary ?? (salary.basic ?? 0) + allowances
  const net = salary.net_salary ?? gross - deductions
  const effective = historyEntry?.effective_from ?? salary.effective_from

  return (
    <div className={cn('rounded-2xl glass-card p-6 font-mono text-sm', className)}>
      <div className="border-b border-dashed border-slate-200 pb-4 dark:border-slate-700">
        <p className="text-center text-xs uppercase tracking-widest text-slate-400">Payslip Breakdown</p>
        {effective && (
          <p className="mt-1 text-center text-xs text-slate-500">Effective {formatDate(effective)}</p>
        )}
      </div>

      <div className="mt-4 space-y-1">
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">Earnings</p>
        <Line label="Basic salary" value={salary.basic} />
        <Line label="HRA" value={salary.hra} />
        <Line label="Transport" value={salary.transport} />
        <Line label="Medical" value={salary.medical} />
        <Line label="Other allowance" value={salary.other_allowance} />
        <div className="my-2 border-t border-dashed border-slate-200 dark:border-slate-700" />
        <Line label="Gross salary" value={gross} bold />
      </div>

      <div className="mt-4 space-y-1">
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">Deductions</p>
        <Line label="PF" value={salary.pf_deduction} negative />
        <Line label="Tax" value={salary.tax_deduction} negative />
        <Line label="Other" value={salary.other_deduction} negative />
        <div className="my-2 border-t border-dashed border-slate-200 dark:border-slate-700" />
        <Line label="Total deductions" value={deductions} negative bold />
      </div>

      <div className="mt-4 rounded-xl bg-slate-50/80 p-4 dark:bg-slate-800/40">
        <Line label="Net salary (full month)" value={net} bold highlight />
        {earnedNet != null && workHours != null && (
          <>
            <p className="mt-2 text-xs text-slate-500">{workHours.toFixed(1)}h worked this month</p>
            <Line label="Earned this month" value={earnedNet} bold highlight />
          </>
        )}
      </div>

      {(salary.note || historyEntry?.note) && (
        <p className="mt-4 text-xs text-slate-500 italic">
          Note: {historyEntry?.note ?? salary.note}
        </p>
      )}

      <p className="mt-4 text-center text-[10px] text-slate-400">— end of payslip —</p>
    </div>
  )
}
