import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { Bar } from 'react-chartjs-2'
import { useTheme } from '@/hooks/useTheme'
import { formatHoursDecimal } from '@/lib/format'
import type { WorkHoursChartData } from '@/api/types/workHoursChart'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

interface WorkHoursChartProps {
  data: WorkHoursChartData
  height?: number
}

export function WorkHoursChart({ data, height = 280 }: WorkHoursChartProps) {
  const { isDark } = useTheme()
  const textColor = isDark ? '#9ca3af' : '#6b7280'
  const gridColor = isDark ? '#374151' : '#e5e7eb'

  const chartData = {
    labels: data.labels,
    datasets: [
      {
        label: 'Net work hours',
        data: data.work_hours,
        backgroundColor: 'rgba(20, 184, 166, 0.85)',
        borderColor: 'rgb(20, 184, 166)',
        borderWidth: 1,
        borderRadius: 4,
        maxBarThickness: data.view === 'monthly' ? 14 : 40,
      },
      {
        label: 'Break time',
        data: data.break_hours,
        backgroundColor: 'rgba(251, 146, 60, 0.85)',
        borderColor: 'rgb(251, 146, 60)',
        borderWidth: 1,
        borderRadius: 4,
        maxBarThickness: data.view === 'monthly' ? 14 : 40,
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index' as const, intersect: false },
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx: { dataset: { label?: string }; parsed: { y: number } }) => {
            const h = ctx.parsed.y
            const mins = Math.round(h * 60)
            return `${ctx.dataset.label}: ${formatHoursDecimal(h)} (${mins} min)`
          },
        },
      },
    },
    scales: {
      x: {
        grid: { color: gridColor },
        ticks: {
          color: textColor,
          maxRotation: data.view === 'monthly' ? 0 : 45,
          autoSkip: data.view === 'monthly',
          maxTicksLimit: data.view === 'monthly' ? 15 : undefined,
        },
      },
      y: {
        beginAtZero: true,
        grid: { color: gridColor },
        ticks: {
          color: textColor,
          callback: (v: number | string) => formatHoursDecimal(Number(v)),
        },
        title: { display: true, text: 'Hours & minutes', color: textColor },
      },
    },
  }

  return (
    <div style={{ height: data.view === 'monthly' ? 320 : height }}>
      <Bar data={chartData} options={options} />
    </div>
  )
}
