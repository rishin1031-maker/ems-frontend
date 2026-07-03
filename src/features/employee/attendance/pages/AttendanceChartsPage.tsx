import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Briefcase, Coffee, TrendingUp, Target, CalendarCheck } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { PageLoader } from '@/components/ui/Spinner'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { WorkHoursChart } from '@/components/ui/WorkHoursChart'
import { StatCard } from '@/components/layout/StatCard'
import { useEmployeeAttendanceCharts } from '@/features/employee/attendance/hooks/useEmployeeAttendance'
import { currentMonth, formatHoursDecimal, todayISO } from '@/lib/format'
import { cn } from '@/lib/cn'

const VIEWS = ['daily', 'weekly', 'monthly'] as const

export function AttendanceChartsPage() {
  const [view, setView] = useState<(typeof VIEWS)[number]>('weekly')
  const [date, setDate] = useState(todayISO())
  const [month, setMonth] = useState(currentMonth())

  const { data, isLoading } = useEmployeeAttendanceCharts({
    view,
    date: view !== 'monthly' ? date : undefined,
    month: view === 'monthly' ? month : undefined,
  })

  const summary = data?.summary
  const hasData = data?.has_data && (data.labels?.length ?? 0) > 0

  return (
    <div>
      <PageHeader
        title="Work Hours"
        description="Work hours vs break time"
        actions={
          <Link to="/employee/attendance">
            <Button variant="outline" theme="employee">
              <ArrowLeft className="h-4 w-4" />
              Attendance log
            </Button>
          </Link>
        }
      />

      <div className="mb-5 flex flex-wrap gap-2">
        {VIEWS.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setView(tab)}
            className={cn(
              'rounded-lg px-4 py-2 text-sm font-medium transition',
              view === tab
                ? 'bg-teal-600 text-white'
                : 'border border-gray-200 bg-white text-gray-600 hover:border-teal-400 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300',
            )}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      <Card className="mb-5">
        <div className="flex flex-wrap items-end gap-3">
          {view === 'monthly' ? (
            <Input label="Month" type="month" value={month} onChange={(e) => setMonth(e.target.value)} />
          ) : (
            <Input
              label={view === 'weekly' ? 'Week containing' : 'Date'}
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          )}
        </div>
        {data?.period_label && (
          <p className="mt-3 text-xs text-gray-500">
            Showing: <span className="font-medium text-gray-700 dark:text-gray-300">{data.period_label}</span>
            {view === 'weekly' && data.week_start && (
              <span className="text-gray-400"> (Mon–Sun week)</span>
            )}
          </p>
        )}
      </Card>

      {isLoading ? (
        <PageLoader />
      ) : (
        <>
          {summary && (
            <div className="mb-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard
                title="Total work"
                value={formatHoursDecimal(summary.total_work_hours)}
                description={`${summary.total_work_minutes ?? 0} min`}
                icon={<Briefcase className="h-5 w-5" />}
                theme="employee"
              />
              <StatCard
                title="Total break"
                value={formatHoursDecimal(summary.total_break_hours)}
                description={`${summary.total_break_minutes ?? 0} min`}
                icon={<Coffee className="h-5 w-5" />}
                theme="employee"
              />
              <StatCard
                title="Avg / active day"
                value={formatHoursDecimal(summary.avg_work_hours)}
                description={`${summary.avg_work_minutes ?? 0} min`}
                icon={<TrendingUp className="h-5 w-5" />}
                theme="employee"
              />
              {view === 'daily' ? (
                <StatCard
                  title={summary.target_complete ? 'Daily target' : 'Remaining'}
                  value={summary.target_complete ? 'Done' : formatHoursDecimal(summary.remaining_hours)}
                  description={summary.target_complete ? '8h target met' : `${summary.remaining_minutes ?? 0} min left`}
                  icon={<Target className="h-5 w-5" />}
                  theme="employee"
                />
              ) : (
                <StatCard
                  title="Days worked"
                  value={summary.days_worked ?? 0}
                  icon={<CalendarCheck className="h-5 w-5" />}
                  theme="employee"
                />
              )}
            </div>
          )}

          {(view === 'daily' || hasData) && summary && (
            <Card className="mb-5">
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2 text-sm">
                <span className="font-medium">{view.charAt(0).toUpperCase() + view.slice(1)} work target</span>
                <span className="text-gray-500">
                  {formatHoursDecimal(summary.total_work_hours)} of {formatHoursDecimal(summary.target_hours)}
                  {' · '}
                  <span className="font-semibold text-teal-600">{summary.progress_percent ?? 0}%</span>
                </span>
              </div>
              <ProgressBar
                value={summary.progress_percent ?? 0}
                max={100}
                completeClass={summary.target_complete && view === 'daily' ? 'bg-green-500' : 'bg-teal-500'}
              />
            </Card>
          )}

          <Card className="mb-5">
            <CardHeader>
              <CardTitle>
                Work hours vs break time
                <span className="ml-1 font-normal text-gray-400">({view})</span>
              </CardTitle>
            </CardHeader>
            {!hasData ? (
              <div className="py-16 text-center text-gray-400">
                <p className="text-sm">No attendance data for this period.</p>
                <p className="mt-1 text-xs">Check in and check out to see your work hours here.</p>
              </div>
            ) : (
              data && <WorkHoursChart data={data} />
            )}
          </Card>

          {hasData && data && (
            <Card padding="none">
              <CardHeader className="px-6 pt-6">
                <CardTitle>Daily breakdown</CardTitle>
              </CardHeader>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-xs uppercase text-gray-500 dark:bg-gray-900">
                    <tr>
                      <th className="px-6 py-3 text-left">Period</th>
                      <th className="px-6 py-3 text-right">Work time</th>
                      <th className="px-6 py-3 text-right">Break time</th>
                      <th className="px-6 py-3 text-right">Gross time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                    {data.labels.map((label, i) => {
                      const work = data.work_hours[i] ?? 0
                      const brk = data.break_hours[i] ?? 0
                      if (work <= 0 && brk <= 0) return null
                      const gross = work + brk
                      return (
                        <tr key={label} className="hover:bg-gray-50 dark:hover:bg-gray-900/50">
                          <td className="px-6 py-3 font-medium">{label}</td>
                          <td className="px-6 py-3 text-right text-teal-700">{formatHoursDecimal(work)}</td>
                          <td className="px-6 py-3 text-right text-orange-600">{formatHoursDecimal(brk)}</td>
                          <td className="px-6 py-3 text-right">{formatHoursDecimal(gross)}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  )
}
