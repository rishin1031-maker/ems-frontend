import type { PaginatedResponse, PaginationParams } from './auth'

export interface Department {
  id: number
  name: string
  description?: string | null
  status: 'active' | 'inactive'
  designations_count?: number
  employees_count?: number
  created_at?: string
  updated_at?: string
}

export interface DepartmentListParams extends PaginationParams {
  status?: 'active' | 'inactive' | ''
}

export interface CreateDepartmentPayload {
  name: string
  description?: string
  status?: 'active' | 'inactive'
}

export interface UpdateDepartmentPayload {
  name?: string
  description?: string
  status?: 'active' | 'inactive'
}

export type DepartmentListResponse = PaginatedResponse<Department>
