import { useEffect, useRef, useState } from 'react'
import { LIVE_STATUS_POLL_MS, LIVE_TIMER_TICK_MS } from '@/lib/constants'

interface LiveBreakInput {
  total_break_seconds?: number
  is_on_break?: boolean
}

/**
 * Ticks break timer when on break; holds static total when working.
 */
export function useLiveBreakTimer(
  liveStats: LiveBreakInput | null | undefined,
  pollFn: () => Promise<LiveBreakInput | null>,
) {
  const [displaySeconds, setDisplaySeconds] = useState(0)
  const baseRef = useRef({ break: 0, fetchedAt: Date.now(), onBreak: false })

  useEffect(() => {
    if (!liveStats) return
    baseRef.current = {
      break: liveStats.total_break_seconds ?? 0,
      fetchedAt: Date.now(),
      onBreak: Boolean(liveStats.is_on_break),
    }
    setDisplaySeconds(baseRef.current.break)
  }, [liveStats])

  useEffect(() => {
    const tick = setInterval(() => {
      const { break: base, fetchedAt, onBreak } = baseRef.current
      if (!onBreak) {
        setDisplaySeconds(base)
        return
      }
      const elapsed = Math.floor((Date.now() - fetchedAt) / 1000)
      setDisplaySeconds(base + elapsed)
    }, LIVE_TIMER_TICK_MS)
    return () => clearInterval(tick)
  }, [])

  useEffect(() => {
    const poll = setInterval(async () => {
      try {
        const data = await pollFn()
        if (data) {
          baseRef.current = {
            break: data.total_break_seconds ?? 0,
            fetchedAt: Date.now(),
            onBreak: Boolean(data.is_on_break),
          }
          setDisplaySeconds(baseRef.current.break)
        }
      } catch {
        // ignore
      }
    }, LIVE_STATUS_POLL_MS)
    return () => clearInterval(poll)
  }, [pollFn])

  return displaySeconds
}
