import { useEffect, useRef, useState } from 'react'
import { LIVE_STATUS_POLL_MS, LIVE_TIMER_TICK_MS } from '@/lib/constants'

interface LiveTimerInput {
  net_seconds: number
  is_on_break?: boolean
}

/**
 * Polls server net_seconds and ticks display every 1s when working (not on break).
 */
export function useLiveTimer(
  liveStats: LiveTimerInput | null | undefined,
  pollFn: () => Promise<LiveTimerInput | null>,
) {
  const [displaySeconds, setDisplaySeconds] = useState(0)
  const baseRef = useRef({ net: 0, fetchedAt: Date.now(), onBreak: false })

  useEffect(() => {
    if (!liveStats) return
    baseRef.current = {
      net: liveStats.net_seconds ?? 0,
      fetchedAt: Date.now(),
      onBreak: Boolean(liveStats.is_on_break),
    }
    setDisplaySeconds(baseRef.current.net)
  }, [liveStats])

  useEffect(() => {
    const tick = setInterval(() => {
      const { net, fetchedAt, onBreak } = baseRef.current
      if (onBreak) {
        setDisplaySeconds(net)
        return
      }
      const elapsed = Math.floor((Date.now() - fetchedAt) / 1000)
      setDisplaySeconds(net + elapsed)
    }, LIVE_TIMER_TICK_MS)
    return () => clearInterval(tick)
  }, [])

  useEffect(() => {
    const poll = setInterval(async () => {
      try {
        const data = await pollFn()
        if (data) {
          baseRef.current = {
            net: data.net_seconds ?? 0,
            fetchedAt: Date.now(),
            onBreak: Boolean(data.is_on_break),
          }
          setDisplaySeconds(baseRef.current.net)
        }
      } catch {
        // ignore poll errors
      }
    }, LIVE_STATUS_POLL_MS)
    return () => clearInterval(poll)
  }, [pollFn])

  return displaySeconds
}
