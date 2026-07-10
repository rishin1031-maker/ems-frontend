import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
} from 'chart.js'
import { Line } from 'react-chartjs-2'
import { useTheme, getChartThemeColors } from '@/hooks/useTheme'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip)

interface AttendanceOverviewChartProps {
  labels: string[]
  values: number[]
  height?: number
}

export function AttendanceOverviewChart({ labels, values, height = 220 }: AttendanceOverviewChartProps) {
  const { theme } = useTheme()
  const { text: textColor, grid: gridColor } = getChartThemeColors(theme)

  if (!labels.length) {
    return (
      <div className="flex items-center justify-center text-sm text-slate-400" style={{ height }}>
        No attendance data this week
      </div>
    )
  }

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Attendance %',
        data: values,
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.12)',
        fill: true,
        tension: 0.35,
        pointRadius: 4,
        pointBackgroundColor: '#3b82f6',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointHoverRadius: 6,
      },
    ],
  }

  return (
    <div style={{ height }}>
      <Line
        data={chartData}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          interaction: { mode: 'index', intersect: false },
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                label: (ctx) => `Attendance: ${ctx.parsed.y}%`,
              },
            },
          },
          scales: {
            x: {
              grid: { display: false },
              ticks: { color: textColor, font: { size: 11 } },
            },
            y: {
              min: 0,
              max: 100,
              grid: { color: gridColor },
              ticks: {
                color: textColor,
                stepSize: 25,
                callback: (v) => `${v}%`,
                font: { size: 11 },
              },
            },
          },
        }}
      />
    </div>
  )
}
