import { useState } from 'react'
import { Users, UserCheck, Briefcase, Coffee, CalendarCheck } from 'lucide-react'
import { StatCard } from '@/components/layout/StatCard'
import { Select } from '@/components/ui/Select'
import { Input } from '@/components/ui/Input'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { PageLoader } from '@/components/ui/Spinner'
import { AdminAttendanceCharts } from '@/components/ui/AdminAttendanceCharts'
import { LiveWorkingPanel } from '@/features/admin/attendance/components/LiveWorkingPanel'
import { useAttendanceCharts } from '@/features/admin/attendance/hooks/useAttendance'
import { useDepartmentOptions } from '@/features/admin/departments/hooks/useDepartments'
import { useDesignationOptions } from '@/features/admin/designations/hooks/useDesignations'
import { currentMonth, currentYear, formatHoursDecimal, todayISO } from '@/lib/format'
import { cn } from '@/lib/cn'
import type { ChartView } from '@/api/types/attendance'

const CHART_VIEWS: ChartView[] = ['daily', 'weekly', 'monthly', 'yearly']

export function AnalyticsAttendanceTab() {
  const [chartView, setChartView] = useState<ChartView>('weekly')
  const [date, setDate] = useState(todayISO())
  const [month, setMonth] = useState(currentMonth())
  const [year, setYear] = useState(currentYear())
  const [search, setSearch] = useState('')
  const [departmentId, setDepartmentId] = useState<number | ''>('')
  const [designationId, setDesignationId] = useState<number | ''>('')

  const { data: deptData } = useDepartmentOptions()
  const { data: desigData } = useDesignationOptions()

  const chartParams = {
    chart_view: chartView,
    date: chartView === 'daily' || chartView === 'weekly' ? date : undefined,
    month: chartView === 'monthly' ? month : undefined,
    year: chartView === 'yearly' ? year : undefined,
    search: search || undefined,
    department_id: departmentId || undefined,
    designation_id: designationId || undefined,
  }

  const { data: chartData, isLoading: chartLoading } = useAttendanceCharts(chartParams)

  const summary = chartData?.summary
  const deptOptions = (deptData?.items ?? []).map((d) => ({ value: d.id, label: d.name }))
  const desigOptions = (desigData?.items ?? []).map((d) => ({
    value: d.id,
    label: d.department_name ? `${d.name} — ${d.department_name}` : d.name,
  }))

  return (
    <div className="space-y-6">
      <LiveWorkingPanel />

      <div className="flex flex-wrap gap-2">
        {CHART_VIEWS.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setChartView(tab)}
            className={cn(
              'rounded-lg px-4 py-2 text-sm font-medium transition',
              chartView === tab
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'border border-gray-200 bg-white text-gray-600 hover:border-indigo-400 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300',
            )}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Chart Filters</CardTitle>
        </CardHeader>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {chartView === 'yearly' && (
            <Input label="Year" type="number" value={year} onChange={(e) => setYear(e.target.value)} min={2020} />
          )}
          {chartView === 'monthly' && (
            <Input label="Month" type="month" value={month} onChange={(e) => setMonth(e.target.value)} />
          )}
          {(chartView === 'daily' || chartView === 'weekly') && (
            <Input
              label={chartView === 'weekly' ? 'Week containing' : 'Date'}
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          )}
          <Input label="Search employee" placeholder="Name, email, or ID" value={search} onChange={(e) => setSearch(e.target.value)} />
          <Select label="Department" placeholder="All" options={deptOptions} value={departmentId} onChange={(e) => setDepartmentId(e.target.value ? Number(e.target.value) : '')} />
          <Select label="Designation" placeholder="All" options={desigOptions} value={designationId} onChange={(e) => setDesignationId(e.target.value ? Number(e.target.value) : '')} />
        </div>
        {chartData?.period_label && (
          <p className="mt-3 text-xs text-gray-500">
            Showing: <span className="font-medium text-gray-700 dark:text-gray-300">{chartData.period_label}</span>
            {chartView === 'weekly' && <span className="text-gray-400"> (Mon–Sun week · org-wide totals)</span>}
            {chartView === 'yearly' && <span className="text-gray-400"> (monthly buckets · org-wide totals)</span>}
          </p>
        )}
      </Card>

      {chartLoading ? (
        <PageLoader />
      ) : (
        <>
          {summary && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard title="Total present" value={summary.total_present ?? '—'} icon={<UserCheck className="h-5 w-5" />} theme="admin" />
              <StatCard title="Net work" value={formatHoursDecimal(summary.total_work_hours)} description={`${summary.total_work_minutes ?? 0} min`} icon={<Briefcase className="h-5 w-5" />} theme="admin" />
              <StatCard title="Break time" value={formatHoursDecimal(summary.total_break_hours)} description={`${summary.total_break_minutes ?? 0} min`} icon={<Coffee className="h-5 w-5" />} theme="admin" />
              <StatCard title="Active days" value={summary.days_worked ?? '—'} icon={<CalendarCheck className="h-5 w-5" />} theme="admin" />
            </div>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Attendance Analytics</CardTitle>
            </CardHeader>
            {chartData?.has_data ? (
              <AdminAttendanceCharts data={chartData} />
            ) : (
              <div className="py-12 text-center text-gray-400">
                <Users className="mx-auto mb-3 h-10 w-10 opacity-40" />
                <p className="text-sm">No attendance data for this period.</p>
                <p className="mt-1 text-xs">Try a different date range or clear filters.</p>
              </div>
            )}
          </Card>
        </>
      )}
    </div>
  )
}
