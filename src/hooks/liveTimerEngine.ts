/** Shared anchor state for extrapolating live timers between server polls. */
export interface TimerAnchor {
  base: number
  fetchedAt: number
  onBreak: boolean
}

export function createAnchor(base = 0, onBreak = false): TimerAnchor {
  return { base, fetchedAt: Date.now(), onBreak }
}

/** Work timer: ticks while working, frozen while on break. */
export function computeWorkDisplay(anchor: TimerAnchor): number {
  if (anchor.onBreak) return anchor.base
  const elapsed = Math.floor((Date.now() - anchor.fetchedAt) / 1000)
  return anchor.base + elapsed
}

/** Break timer: ticks while on break, frozen while working. */
export function computeBreakDisplay(anchor: TimerAnchor): number {
  if (!anchor.onBreak) return anchor.base
  const elapsed = Math.floor((Date.now() - anchor.fetchedAt) / 1000)
  return anchor.base + elapsed
}

const DRIFT_THRESHOLD_SEC = 3

/**
 * Re-anchor to server time without snapping the visible clock when drift is small.
 * Returns forceDisplay only when break state changes or drift is large.
 */
export function syncWorkAnchor(
  anchor: TimerAnchor,
  netSeconds: number,
  isOnBreak: boolean,
): { anchor: TimerAnchor; forceDisplay?: number } {
  const onBreak = Boolean(isOnBreak)
  const next = createAnchor(netSeconds, onBreak)

  if (onBreak !== anchor.onBreak) {
    return { anchor: next, forceDisplay: netSeconds }
  }

  const projected = computeWorkDisplay(anchor)
  if (Math.abs(netSeconds - projected) > DRIFT_THRESHOLD_SEC) {
    return { anchor: next, forceDisplay: onBreak ? netSeconds : netSeconds }
  }

  return { anchor: next }
}

export function syncBreakAnchor(
  anchor: TimerAnchor,
  breakSeconds: number,
  isOnBreak: boolean,
): { anchor: TimerAnchor; forceDisplay?: number } {
  const onBreak = Boolean(isOnBreak)
  const next = createAnchor(breakSeconds, onBreak)

  if (onBreak !== anchor.onBreak) {
    return { anchor: next, forceDisplay: breakSeconds }
  }

  const projected = computeBreakDisplay(anchor)
  if (Math.abs(breakSeconds - projected) > DRIFT_THRESHOLD_SEC) {
    return { anchor: next, forceDisplay: breakSeconds }
  }

  return { anchor: next }
}
