import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js'
import { Bar, Line } from 'react-chartjs-2'
import { useTheme, getChartThemeColors } from '@/hooks/useTheme'
import type { AttendanceChartData } from '@/api/types/attendance'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  Filler,
)

interface AttendanceChartProps {
  data: AttendanceChartData
  type?: 'bar' | 'line'
  height?: number
}

export function AttendanceChart({ data, type = 'bar', height = 280 }: AttendanceChartProps) {
  const { theme } = useTheme()
  const { text: textColor, grid: gridColor } = getChartThemeColors(theme)

  const chartData = {
    labels: data.labels ?? [],
    datasets: (data.datasets ?? []).map((ds, i) => ({
      ...ds,
      backgroundColor: type === 'bar'
        ? ['#6366f1', '#0d9488', '#f59e0b', '#ef4444'][i % 4] + '99'
        : undefined,
      borderColor: ['#6366f1', '#0d9488', '#f59e0b', '#ef4444'][i % 4],
      borderWidth: 2,
      fill: type === 'line' ? false : undefined,
      tension: 0.3,
    })),
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { labels: { color: textColor } },
    },
    scales: {
      x: { ticks: { color: textColor }, grid: { color: gridColor } },
      y: { ticks: { color: textColor }, grid: { color: gridColor }, beginAtZero: true },
    },
  }

  return (
    <div style={{ height }}>
      {type === 'line' ? (
        <Line data={chartData} options={options} />
      ) : (
        <Bar data={chartData} options={options} />
      )}
    </div>
  )
}
