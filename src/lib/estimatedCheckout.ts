import { TARGET_WORK_SECONDS } from '@/lib/constants'

export interface EstimatedCheckoutInput {
  netSeconds: number
  targetSeconds?: number
  isOnBreak?: boolean
  isComplete?: boolean
  isCheckedIn?: boolean
}

export type EstimatedCheckoutResult =
  | { kind: 'none' }
  | { kind: 'complete'; label: string }
  | { kind: 'paused'; label: string }
  | { kind: 'time'; at: Date; label: string }

export function computeRemainingSeconds(netSeconds: number, targetSeconds: number): number {
  return Math.max(0, targetSeconds - netSeconds)
}

export function formatCheckoutTime(date: Date): string {
  return date.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  })
}

export function estimateCheckout(input: EstimatedCheckoutInput): EstimatedCheckoutResult {
  const {
    netSeconds,
    targetSeconds = TARGET_WORK_SECONDS,
    isOnBreak = false,
    isComplete = false,
    isCheckedIn = true,
  } = input

  if (!isCheckedIn) {
    return { kind: 'none' }
  }

  if (isComplete || netSeconds >= targetSeconds) {
    return { kind: 'complete', label: 'Target reached' }
  }

  const remaining = computeRemainingSeconds(netSeconds, targetSeconds)

  if (remaining <= 0) {
    return { kind: 'complete', label: 'Target reached' }
  }

  if (isOnBreak) {
    return { kind: 'paused', label: 'Paused · on break' }
  }

  const at = new Date(Date.now() + remaining * 1000)
  return { kind: 'time', at, label: formatCheckoutTime(at) }
}
