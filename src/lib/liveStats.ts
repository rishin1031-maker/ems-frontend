/** Normalize live attendance stats from Laravel API (field names vary). */
export interface NormalizedLiveStats {
  net_seconds: number
  break_seconds?: number
  total_break_seconds?: number
  is_checked_in: boolean
  is_on_break: boolean
  is_complete: boolean
  checked_out: boolean
  progress_percent?: number
  target_seconds?: number
  check_in?: string | null
  check_out?: string | null
}

/** Merge dashboard today_attendance with calculator live_stats (API omits checked_in on stats). */
export function mergeDashboardLiveStats(
  todayAttendance: Record<string, unknown> | null | undefined,
  liveStats: Record<string, unknown> | null | undefined,
  targetSeconds?: number,
): NormalizedLiveStats {
  const hasAttendance = todayAttendance != null
  const checkedOut = Boolean(todayAttendance?.check_out)

  return normalizeLiveStats({
    ...(liveStats ?? {}),
    checked_in: hasAttendance,
    checked_out: checkedOut,
    check_in: todayAttendance?.check_in,
    check_out: todayAttendance?.check_out,
    target_seconds: targetSeconds ?? liveStats?.target_seconds,
  })
}

export function extractLiveStatsFromMutationResponse(
  raw: Record<string, unknown>,
): NormalizedLiveStats {
  if (raw.live_stats && typeof raw.live_stats === 'object') {
    return normalizeLiveStats({
      ...(raw.live_stats as Record<string, unknown>),
      checked_in: true,
    })
  }
  if (raw.check_in != null || raw.id != null) {
    return mergeDashboardLiveStats(raw, null)
  }
  return normalizeLiveStats(raw)
}

export function normalizeLiveStats(raw: Record<string, unknown> | null | undefined): NormalizedLiveStats {
  if (!raw) {
    return {
      net_seconds: 0,
      is_checked_in: false,
      is_on_break: false,
      is_complete: false,
      checked_out: false,
    }
  }

  const checkedIn = Boolean(raw.checked_in ?? raw.is_checked_in)
  const checkedOut = Boolean(raw.checked_out ?? raw.is_checked_out)
  const onBreak = Boolean(raw.on_break ?? raw.is_on_break)

  return {
    net_seconds: Number(raw.net_seconds ?? 0),
    break_seconds: Number(raw.total_break_seconds ?? raw.break_seconds ?? 0),
    total_break_seconds: Number(raw.total_break_seconds ?? 0),
    is_checked_in: checkedIn && !checkedOut,
    is_on_break: onBreak,
    is_complete: Boolean(raw.is_complete ?? raw.is_eight_hours_complete),
    checked_out: checkedOut,
    progress_percent: raw.progress_percent != null ? Number(raw.progress_percent) : undefined,
    target_seconds: raw.target_seconds != null ? Number(raw.target_seconds) : undefined,
    check_in: (raw.check_in_time as string) ?? (raw.check_in as string) ?? null,
    check_out: (raw.check_out as string) ?? null,
  }
}

export interface LeaveBalanceEntry {
  total: number
  used: number
  remaining: number
}

export type NormalizedLeaveBalance = Record<string, LeaveBalanceEntry | number>

export function normalizeLeaveBalance(raw: unknown): NormalizedLeaveBalance {
  if (raw == null || typeof raw !== 'object') return {}
  const data = raw as Record<string, unknown>
  const result: NormalizedLeaveBalance = {}

  for (const [key, val] of Object.entries(data)) {
    if (key === 'year') {
      result.year = val as number
      continue
    }
    if (val && typeof val === 'object' && 'remaining' in (val as object)) {
      const e = val as LeaveBalanceEntry
      result[key] = {
        total: Number(e.total ?? 0),
        used: Number(e.used ?? 0),
        remaining: Number(e.remaining ?? 0),
      }
    } else if (typeof val === 'number') {
      result[key] = val
    }
  }
  return result
}

export function getLeaveBalanceRemaining(balance: NormalizedLeaveBalance, type: string): number | null {
  const entry = balance[type]
  if (entry == null) return null
  if (typeof entry === 'number') return entry
  return entry.remaining
}
