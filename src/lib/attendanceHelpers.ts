const EARLY_CHECKOUT_PREFIX = 'Early checkout:'
const AUTO_CHECKOUT_PREFIX = 'Auto checkout:'

export function isEarlyCheckoutNote(note?: string | null): boolean {
  if (!note) return false
  return note.toLowerCase().includes('early checkout') || note.startsWith(EARLY_CHECKOUT_PREFIX)
}

export function isAutoCheckoutNote(note?: string | null): boolean {
  if (!note) return false
  return note.toLowerCase().includes('auto checkout') || note.startsWith(AUTO_CHECKOUT_PREFIX)
}

export function getEarlyCheckoutReason(note?: string | null): string | null {
  if (!note || !isEarlyCheckoutNote(note)) return null
  const idx = note.indexOf(':')
  if (idx === -1) return note
  return note.slice(idx + 1).trim() || null
}

export function getAutoCheckoutReason(note?: string | null): string | null {
  if (!note || !isAutoCheckoutNote(note)) return null
  const idx = note.indexOf(':')
  if (idx === -1) return note
  return note.slice(idx + 1).trim() || null
}

export interface StreakResult {
  current: number
  best: number
  label: string
}

interface AttendanceDayLike {
  date: string
  status?: string
}

export function computePresentStreak(days: AttendanceDayLike[]): StreakResult {
  const sorted = [...days]
    .filter((d) => d.date)
    .sort((a, b) => b.date.localeCompare(a.date))

  let current = 0
  let best = 0
  let run = 0

  for (const day of sorted) {
    const present = day.status === 'present' || day.status === 'half_day'
    if (present) {
      run += 1
      best = Math.max(best, run)
    } else if (day.status === 'absent') {
      run = 0
    }
  }

  for (const day of sorted) {
    const present = day.status === 'present' || day.status === 'half_day'
    if (present) current += 1
    else if (day.status === 'absent' || day.status === 'on_leave') break
    else if (day.date < new Date().toISOString().slice(0, 10)) break
  }

  const label =
    current >= 5 ? 'On fire!' : current >= 3 ? 'Great streak' : current >= 1 ? 'Keep it up' : 'Start a streak'

  return { current, best, label }
}
