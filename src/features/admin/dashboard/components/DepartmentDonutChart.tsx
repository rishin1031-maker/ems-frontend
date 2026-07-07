import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js'
import { Doughnut } from 'react-chartjs-2'
import type { DepartmentSlice } from '@/lib/dashboardHelpers'

ChartJS.register(ArcElement, Tooltip, Legend)

interface DepartmentDonutChartProps {
  slices: DepartmentSlice[]
  height?: number
}

export function DepartmentDonutChart({ slices, height = 220 }: DepartmentDonutChartProps) {
  if (!slices.length) {
    return (
      <div className="flex items-center justify-center text-sm text-slate-400" style={{ height }}>
        No employee data
      </div>
    )
  }

  const chartData = {
    labels: slices.map((s) => s.name),
    datasets: [
      {
        data: slices.map((s) => s.count),
        backgroundColor: slices.map((s) => s.color),
        borderWidth: 0,
        hoverOffset: 6,
      },
    ],
  }

  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
      <div className="mx-auto shrink-0" style={{ height, width: height }}>
        <Doughnut
          data={chartData}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            cutout: '68%',
            plugins: {
              legend: { display: false },
              tooltip: {
                callbacks: {
                  label: (ctx) => {
                    const slice = slices[ctx.dataIndex]
                    return `${slice.name}: ${slice.count} (${slice.percent}%)`
                  },
                },
              },
            },
          }}
        />
      </div>
      <ul className="min-w-0 flex-1 space-y-2">
        {slices.map((slice) => (
          <li key={slice.name} className="flex items-center justify-between gap-2 text-sm">
            <div className="flex min-w-0 items-center gap-2">
              <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: slice.color }} />
              <span className="truncate text-slate-700 dark:text-slate-300">{slice.name}</span>
            </div>
            <span className="shrink-0 tabular-nums text-slate-500">{slice.percent}%</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function DepartmentDonutLegend({ slices }: { slices: DepartmentSlice[] }) {
  return (
    <p className="text-xs text-slate-400">
      {slices.length} department{slices.length === 1 ? '' : 's'} · {slices.reduce((n, s) => n + s.count, 0)} employees
    </p>
  )
}
