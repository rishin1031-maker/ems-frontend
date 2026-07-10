export const ROLES = {
  ADMIN: 'admin',
  EMPLOYEE: 'employee',
} as const

export type Role = (typeof ROLES)[keyof typeof ROLES]

export const TARGET_WORK_SECONDS = 28800 // 8 hours net
export const TARGET_MONTHLY_HOURS = 200

export const LEAVE_TYPES = ['casual', 'sick', 'annual'] as const
export const LEAVE_STATUSES = ['pending', 'approved', 'rejected', 'cancelled'] as const
export const ATTENDANCE_STATUSES = ['present', 'absent', 'half_day', 'on_leave'] as const

export type LeaveType = (typeof LEAVE_TYPES)[number]
export type LeaveStatus = (typeof LEAVE_STATUSES)[number]
export type AttendanceStatus = (typeof ATTENDANCE_STATUSES)[number]

export const EMPLOYEE_ID_PATTERN = /^EMP\d+$/i
export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export const AUTH_STORAGE_KEY = 'ems_auth'
export const THEME_STORAGE_KEY = 'ems_theme'

export const LIVE_STATUS_POLL_MS = 30_000
export const LIVE_TIMER_TICK_MS = 1_000
