export interface ContinuousSessionPolicy {
  enabled: boolean
  limit_minutes: number
  reminder_before_minutes: number
  grace_minutes: number
  min_break_minutes: number
  limit_seconds: number
  reminder_at_seconds: number
  grace_seconds: number
  min_break_seconds: number
  auto_checkout_at_seconds: number
}

export interface SystemSettings {
  continuous_session: ContinuousSessionPolicy
}

export type ContinuousSessionPolicyUpdate = Partial<{
  enabled: boolean
  limit_minutes: number
  reminder_before_minutes: number
  grace_minutes: number
  min_break_minutes: number
}>
