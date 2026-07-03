export function formatCurrency(amount: number | string | null | undefined): string {
  if (amount == null || amount === '') return '—'
  const value = typeof amount === 'string' ? parseFloat(amount) : amount
  if (Number.isNaN(value)) return '—'
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

export function formatNumber(
  value: number | string | null | undefined,
  decimals = 1,
): string {
  if (value == null || value === '') return '—'
  const n = typeof value === 'string' ? parseFloat(value) : value
  if (Number.isNaN(n)) return '—'
  return n.toFixed(decimals)
}

/** Format decimal hours (e.g. 7.5) as "7h 30m". */
export function formatHoursDecimal(hours: number | null | undefined): string {
  if (hours == null || Number.isNaN(hours)) return '—'
  const totalMinutes = Math.round(hours * 60)
  if (totalMinutes === 0) return '0m'
  const h = Math.floor(totalMinutes / 60)
  const m = totalMinutes % 60
  if (h === 0) return `${m}m`
  if (m === 0) return `${h}h`
  return `${h}h ${m}m`
}

export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  if (h > 0 && m > 0) return `${h}h ${m}m`
  if (h > 0) return `${h}h`
  if (m > 0) return `${m}m`
  return '0m'
}

export function formatLiveTimer(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  return [h, m, s].map((v) => String(v).padStart(2, '0')).join(':')
}

export function formatDate(
  date: string | Date | null | undefined,
  options?: Intl.DateTimeFormatOptions,
): string {
  if (date == null || date === '') return '—'
  const d = typeof date === 'string' ? new Date(date) : date
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleDateString('en-IN', options ?? { day: '2-digit', month: 'short', year: 'numeric' })
}

export function formatDateTime(date: string | Date | null | undefined): string {
  if (date == null || date === '') return '—'
  const d = typeof date === 'string' ? new Date(date) : date
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).replace(/_/g, ' ')
}

export function statusLabel(status: string): string {
  return capitalize(status)
}

export function todayISO(): string {
  return new Date().toISOString().slice(0, 10)
}

export function currentMonth(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

export function currentYear(): string {
  return String(new Date().getFullYear())
}
