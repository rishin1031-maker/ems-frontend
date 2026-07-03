import type { Role } from '@/lib/constants'

export interface ApiResponse<T = unknown> {
  success: boolean
  message: string
  data?: T
  errors?: Record<string, string[]>
  code?: string
}

export interface PaginatedResponse<T> {
  items: T[]
  meta: PaginationMeta
}

export interface PaginationMeta {
  current_page: number
  last_page: number
  per_page: number
  total: number
}

export interface PaginationParams {
  page?: number
  per_page?: number
  search?: string
}

export interface ApiError extends Error {
  status?: number
  code?: string
  errors?: Record<string, string[]>
  isNetworkError?: boolean
  isServiceUnavailable?: boolean
}

export function createApiError(
  message: string,
  extras?: Partial<ApiError>,
): ApiError {
  const error = new Error(message) as ApiError
  if (extras) Object.assign(error, extras)
  return error
}

export interface LoginPayload {
  access_token: string
  token_type: string
  expires_in: number
  user: AuthUser
}

export interface AuthUser {
  id: number
  name: string
  email: string
  role?: Role
  employee_id?: string
  must_change_password?: boolean
  phone?: string | null
  department?: { id: number; name: string } | null
  designation?: { id: number; name: string } | null
  [key: string]: unknown
}

export interface AdminLoginRequest {
  email: string
  password: string
}

export interface EmployeeLoginRequest {
  login: string
  password: string
}

export interface ChangePasswordRequest {
  current_password: string
  password: string
  password_confirmation: string
}
