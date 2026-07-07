import { useEffect, useRef, useState } from 'react'
import { LIVE_STATUS_POLL_MS, LIVE_TIMER_TICK_MS } from '@/lib/constants'
import {
  computeBreakDisplay,
  createAnchor,
  syncBreakAnchor,
  type TimerAnchor,
} from '@/hooks/liveTimerEngine'

interface LiveBreakInput {
  total_break_seconds?: number
  is_on_break?: boolean
}

/**
 * Extrapolates break seconds locally while on break; re-anchors on poll without visible jumps.
 */
export function useLiveBreakTimer(
  liveStats: LiveBreakInput | null | undefined,
  pollFn: () => Promise<LiveBreakInput | null>,
) {
  const [displaySeconds, setDisplaySeconds] = useState(0)
  const anchorRef = useRef<TimerAnchor>(createAnchor())
  const pollFnRef = useRef(pollFn)
  pollFnRef.current = pollFn

  const applySync = (breakSeconds: number, isOnBreak: boolean) => {
    const { anchor, forceDisplay } = syncBreakAnchor(anchorRef.current, breakSeconds, isOnBreak)
    anchorRef.current = anchor
    if (forceDisplay != null) setDisplaySeconds(forceDisplay)
  }

  useEffect(() => {
    if (!liveStats) {
      anchorRef.current = createAnchor()
      setDisplaySeconds(0)
      return
    }
    applySync(liveStats.total_break_seconds ?? 0, Boolean(liveStats.is_on_break))
  }, [liveStats?.total_break_seconds, liveStats?.is_on_break, liveStats])

  useEffect(() => {
    const tick = () => setDisplaySeconds(computeBreakDisplay(anchorRef.current))
    tick()
    const id = setInterval(tick, LIVE_TIMER_TICK_MS)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    let cancelled = false

    const poll = async () => {
      try {
        const data = await pollFnRef.current()
        if (!data || cancelled) return
        applySync(data.total_break_seconds ?? 0, Boolean(data.is_on_break))
      } catch {
        // keep extrapolating
      }
    }

    void poll()
    const id = setInterval(() => void poll(), LIVE_STATUS_POLL_MS)
    return () => {
      cancelled = true
      clearInterval(id)
    }
  }, [])

  return displaySeconds
}
