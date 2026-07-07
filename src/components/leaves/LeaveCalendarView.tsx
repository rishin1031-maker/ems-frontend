import { useEffect, useMemo, useRef } from 'react'
import { Link } from 'react-router-dom'
import {
  getLeaveDays,
  getLeaveEndDate,
  getLeaveStartDate,
  type Leave,
} from '@/api/types/leave'
import { statusLabel } from '@/lib/format'
import { cn } from '@/lib/cn'

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const

const STATUS_COLORS: Record<string, string> = {
  approved: 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-900',
  pending: 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-900',
  rejected: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-950/50 dark:text-red-300 dark:border-red-900',
}

interface LeaveCalendarViewProps {
  leaves: Leave[]
  showEmployee?: boolean
  adminLinks?: boolean
  theme?: 'admin' | 'employee'
}

function parseDate(iso?: string): Date | null {
  if (!iso) return null
  const d = new Date(iso.slice(0, 10) + 'T12:00:00')
  return Number.isNaN(d.getTime()) ? null : d
}

function sameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

function dateInRange(day: Date, start: Date, end: Date): boolean {
  const t = day.getTime()
  return t >= start.getTime() && t <= end.getTime()
}

function buildMonthRange(leaves: Leave[]): Date[] {
  const now = new Date()
  let min = new Date(now.getFullYear(), now.getMonth() - 2, 1)
  let max = new Date(now.getFullYear(), now.getMonth() + 3, 0)

  for (const leave of leaves) {
    const start = parseDate(getLeaveStartDate(leave))
    const end = parseDate(getLeaveEndDate(leave))
    if (start && start < min) min = new Date(start.getFullYear(), start.getMonth(), 1)
    if (end && end > max) max = new Date(end.getFullYear(), end.getMonth() + 1, 0)
  }

  const months: Date[] = []
  const cursor = new Date(min.getFullYear(), min.getMonth(), 1)
  while (cursor <= max) {
    months.push(new Date(cursor))
    cursor.setMonth(cursor.getMonth() + 1)
  }
  return months
}

function MonthCard({
  monthDate,
  leaves,
  showEmployee,
  adminLinks,
  theme,
}: {
  monthDate: Date
  leaves: Leave[]
  showEmployee?: boolean
  adminLinks?: boolean
  theme: 'admin' | 'employee'
}) {
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) el.classList.add('is-visible')
      },
      { threshold: 0.2, rootMargin: '0px 0px -10% 0px' },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const year = monthDate.getFullYear()
  const month = monthDate.getMonth()
  const firstDay = new Date(year, month, 1)
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const startOffset = firstDay.getDay()

  const monthLeaves = useMemo(() => {
    const monthStart = new Date(year, month, 1)
    const monthEnd = new Date(year, month + 1, 0)
    return leaves.filter((leave) => {
      const start = parseDate(getLeaveStartDate(leave))
      const end = parseDate(getLeaveEndDate(leave))
      if (!start || !end) return false
      return end >= monthStart && start <= monthEnd
    })
  }, [leaves, year, month])

  const label = monthDate.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
  const accent = theme === 'admin' ? 'text-blue-600' : 'text-sky-600'

  return (
    <section
      ref={ref}
      className="calendar-month-enter calendar-scroll-item min-w-[min(100%,320px)] shrink-0 snap-center rounded-xl glass-card p-4"
    >
      <h3 className={cn('mb-3 text-sm font-semibold', accent)}>{label}</h3>
      <div className="mb-2 grid grid-cols-7 gap-1 text-center text-[10px] font-medium uppercase text-slate-400">
        {WEEKDAYS.map((d) => (
          <span key={d}>{d}</span>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: startOffset }).map((_, i) => (
          <div key={`pad-${i}`} className="aspect-square" />
        ))}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const dayNum = i + 1
          const dayDate = new Date(year, month, dayNum)
          const dayLeaves = monthLeaves.filter((leave) => {
            const start = parseDate(getLeaveStartDate(leave))!
            const end = parseDate(getLeaveEndDate(leave))!
            return dateInRange(dayDate, start, end)
          })
          const isToday = sameDay(dayDate, new Date())

          return (
            <div
              key={dayNum}
              className={cn(
                'relative flex aspect-square flex-col items-center rounded-lg border border-transparent p-0.5 text-xs',
                isToday && 'border-blue-300 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/30',
                dayLeaves.length > 0 && !isToday && 'bg-slate-50 dark:bg-slate-800/40',
              )}
            >
              <span className={cn('text-[11px] font-medium', isToday ? 'text-blue-700 dark:text-blue-300' : 'text-slate-600 dark:text-slate-300')}>
                {dayNum}
              </span>
              <div className="mt-auto flex w-full flex-col gap-0.5">
                {dayLeaves.slice(0, 2).map((leave) => (
                  <span
                    key={leave.id}
                    title={
                      showEmployee
                        ? `${leave.employee?.name ?? 'Employee'} · ${statusLabel(leave.status)}`
                        : `${statusLabel(leave.type)} · ${statusLabel(leave.status)}`
                    }
                    className={cn(
                      'truncate rounded border px-0.5 text-[8px] leading-tight',
                      STATUS_COLORS[leave.status] ?? STATUS_COLORS.pending,
                    )}
                  >
                    {showEmployee ? (leave.employee?.name?.split(' ')[0] ?? 'Leave') : leave.type.slice(0, 3)}
                  </span>
                ))}
                {dayLeaves.length > 2 && (
                  <span className="text-center text-[8px] text-slate-400">+{dayLeaves.length - 2}</span>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {monthLeaves.length > 0 && (
        <ul className="mt-4 space-y-2 border-t border-slate-100 pt-3 dark:border-slate-800">
          {monthLeaves.slice(0, 4).map((leave) => {
            const content = (
              <>
                <p className="truncate text-xs font-medium text-slate-800 dark:text-slate-200">
                  {showEmployee ? (leave.employee?.name ?? 'Employee') : statusLabel(leave.type)}
                </p>
                <p className="text-[10px] text-slate-500">
                  {getLeaveStartDate(leave)?.slice(0, 10)} · {getLeaveDays(leave) ?? '—'}d · {statusLabel(leave.status)}
                </p>
              </>
            )
            return (
              <li key={leave.id}>
                {adminLinks ? (
                  <Link
                    to={`/admin/leaves/${leave.id}`}
                    className="block rounded-lg px-2 py-1.5 transition hover:bg-slate-50 dark:hover:bg-slate-800/60"
                  >
                    {content}
                  </Link>
                ) : (
                  <div className="rounded-lg px-2 py-1.5">{content}</div>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}

export function LeaveCalendarView({
  leaves,
  showEmployee = false,
  adminLinks = false,
  theme = 'admin',
}: LeaveCalendarViewProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const months = useMemo(() => buildMonthRange(leaves), [leaves])

  useEffect(() => {
    const container = scrollRef.current
    if (!container) return
    const currentIdx = months.findIndex(
      (m) => m.getFullYear() === new Date().getFullYear() && m.getMonth() === new Date().getMonth(),
    )
    if (currentIdx >= 0) {
      const child = container.children[currentIdx] as HTMLElement | undefined
      child?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })
    }
  }, [months])

  if (leaves.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-slate-200 px-6 py-12 text-center text-sm text-slate-500 dark:border-slate-700">
        No leave requests to show on the calendar yet.
      </p>
    )
  }

  return (
    <div
      ref={scrollRef}
      className="calendar-scroll-snap flex gap-4 overflow-x-auto pb-4 scrollbar-thin"
    >
      {months.map((monthDate) => (
        <MonthCard
          key={`${monthDate.getFullYear()}-${monthDate.getMonth()}`}
          monthDate={monthDate}
          leaves={leaves}
          showEmployee={showEmployee}
          adminLinks={adminLinks}
          theme={theme}
        />
      ))}
    </div>
  )
}
