import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { Bar, Doughnut } from 'react-chartjs-2'
import { useTheme } from '@/hooks/useTheme'
import { formatHoursDecimal } from '@/lib/format'
import type { AdminAttendanceChartData } from '@/api/types/adminAttendanceChart'

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend)

interface AdminAttendanceChartsProps {
  data: AdminAttendanceChartData
}

export function AdminAttendanceCharts({ data }: AdminAttendanceChartsProps) {
  const { isDark } = useTheme()
  const textColor = isDark ? '#9ca3af' : '#6b7280'
  const gridColor = isDark ? '#374151' : '#e5e7eb'
  const isDaily = data.view === 'daily'

  const statusChart = {
    labels: data.labels,
    datasets: [
      { label: 'Present', data: data.present, backgroundColor: 'rgba(34, 197, 94, 0.85)', borderRadius: 4, stack: 'status' as const },
      { label: 'Absent', data: data.absent, backgroundColor: 'rgba(239, 68, 68, 0.85)', borderRadius: 4, stack: 'status' as const },
      { label: 'Half day', data: data.half_day, backgroundColor: 'rgba(234, 179, 8, 0.85)', borderRadius: 4, stack: 'status' as const },
      { label: 'On leave', data: data.on_leave, backgroundColor: 'rgba(59, 130, 246, 0.85)', borderRadius: 4, stack: 'status' as const },
    ],
  }

  const workChart = {
    labels: data.labels,
    datasets: [
      {
        label: 'Net work hours',
        data: data.work_hours,
        backgroundColor: 'rgba(99, 102, 241, 0.85)',
        borderColor: 'rgb(99, 102, 241)',
        borderWidth: 1,
        borderRadius: 4,
        maxBarThickness: data.view === 'monthly' || data.view === 'yearly' ? 18 : 40,
      },
      {
        label: 'Break time',
        data: data.break_hours,
        backgroundColor: 'rgba(251, 146, 60, 0.85)',
        borderColor: 'rgb(251, 146, 60)',
        borderWidth: 1,
        borderRadius: 4,
        maxBarThickness: data.view === 'monthly' || data.view === 'yearly' ? 18 : 40,
      },
    ],
  }

  const statusOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'bottom' as const, labels: { color: textColor, boxWidth: 12 } } },
    scales: {
      x: {
        stacked: true,
        grid: { color: isDaily ? 'transparent' : gridColor },
        ticks: { color: textColor, maxRotation: data.view === 'monthly' ? 0 : 45, autoSkip: data.view === 'monthly', maxTicksLimit: data.view === 'monthly' ? 15 : undefined },
      },
      y: { stacked: true, beginAtZero: true, grid: { color: gridColor }, ticks: { color: textColor, stepSize: 1 } },
    },
  }

  const workOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index' as const, intersect: false },
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx: { dataset: { label?: string }; parsed: { y: number } }) =>
            `${ctx.dataset.label}: ${formatHoursDecimal(ctx.parsed.y)} (${Math.round(ctx.parsed.y * 60)} min)`,
        },
      },
    },
    scales: {
      x: {
        grid: { color: gridColor },
        ticks: { color: textColor, maxRotation: data.view === 'monthly' ? 0 : 45, autoSkip: data.view === 'monthly', maxTicksLimit: data.view === 'monthly' ? 15 : undefined },
      },
      y: {
        beginAtZero: true,
        grid: { color: gridColor },
        ticks: { color: textColor, callback: (v: number | string) => formatHoursDecimal(Number(v)) },
        title: { display: true, text: 'Hours & minutes', color: textColor },
      },
    },
  }

  const breakdown = data.status_breakdown
  const pieData = breakdown
    ? {
        labels: ['Present', 'Absent', 'Half day', 'On leave', 'Not marked'],
        datasets: [{
          data: [breakdown.present ?? 0, breakdown.absent ?? 0, breakdown.half_day ?? 0, breakdown.on_leave ?? 0, breakdown.not_marked ?? 0],
          backgroundColor: ['#22c55e', '#ef4444', '#eab308', '#3b82f6', '#9ca3af'],
          borderWidth: 0,
        }],
      }
    : null

  return (
    <div className="space-y-5">
      <div className={`grid gap-5 ${isDaily && pieData ? 'xl:grid-cols-2' : ''}`}>
        <div>
          <h4 className="mb-3 text-sm font-semibold text-gray-800 dark:text-gray-200">
            Attendance status <span className="font-normal text-gray-400">({data.view})</span>
          </h4>
          <div style={{ height: isDaily ? 260 : 300 }}>
            <Bar data={statusChart} options={statusOptions} />
          </div>
        </div>
        {isDaily && pieData && (
          <div>
            <h4 className="mb-3 text-sm font-semibold text-gray-800 dark:text-gray-200">Today&apos;s breakdown</h4>
            <div style={{ height: 260 }}>
              <Doughnut
                data={pieData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { position: 'bottom', labels: { color: textColor, boxWidth: 12 } } },
                }}
              />
            </div>
          </div>
        )}
      </div>

      <div>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200">
            Work hours vs break time <span className="font-normal text-gray-400">({data.view})</span>
          </h4>
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-sm bg-indigo-500" /> Net work</span>
            <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-sm bg-orange-400" /> Break</span>
          </div>
        </div>
        <div style={{ height: data.view === 'monthly' || data.view === 'yearly' ? 340 : 300 }}>
          <Bar data={workChart} options={workOptions} />
        </div>
      </div>
    </div>
  )
}
