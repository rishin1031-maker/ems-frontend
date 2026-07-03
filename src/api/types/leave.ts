import type { PaginatedResponse, PaginationParams } from './auth'
import type { LeaveType, LeaveStatus } from '@/lib/constants'

export interface LeaveEmployee {
  id: number
  employee_id: string
  name: string
  email?: string
  department?: { id: number; name: string } | null
  designation?: { id: number; name: string } | null
}

export interface Leave {
  id: number
  employee_id: number
  employee?: LeaveEmployee
  type: LeaveType
  status: LeaveStatus
  from_date?: string
  to_date?: string
  start_date?: string
  end_date?: string
  days?: number
  reason?: string
  admin_note?: string | null
  actioned_at?: string | null
  created_at?: string
  updated_at?: string
}

export interface LeaveListParams extends PaginationParams {
  status?: LeaveStatus | ''
  type?: LeaveType | ''
  employee_id?: number | string
  from_date?: string
  to_date?: string
}

export interface CreateLeavePayload {
  employee_id: number
  type: LeaveType
  from_date: string
  to_date: string
  reason: string
  status: LeaveStatus
}

export interface ApplyLeavePayload {
  type: LeaveType
  from_date: string
  to_date: string
  reason: string
}

export interface LeaveActionPayload {
  admin_note?: string
}

export type LeaveListResponse = PaginatedResponse<Leave>

export function getLeaveStartDate(leave: Leave): string | undefined {
  return leave.from_date ?? leave.start_date
}

export function getLeaveEndDate(leave: Leave): string | undefined {
  return leave.to_date ?? leave.end_date
}

export function getLeaveDays(leave: Leave): number | undefined {
  return leave.days
}

export function getLeaveType(leave: Leave): LeaveType {
  return leave.type
}
