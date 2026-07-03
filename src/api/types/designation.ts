import type { PaginatedResponse, PaginationParams } from './auth'

export interface Designation {
  id: number
  name: string
  description?: string | null
  status: 'active' | 'inactive'
  department_id?: number
  department_name?: string
  employees_count?: number
  created_at?: string
  updated_at?: string
}

export interface DesignationListParams extends PaginationParams {
  status?: 'active' | 'inactive' | ''
  department_id?: number | string
}

export interface CreateDesignationPayload {
  name: string
  department_id: number
  description?: string
  status?: 'active' | 'inactive'
}

export interface UpdateDesignationPayload {
  name?: string
  department_id?: number
  description?: string
  status?: 'active' | 'inactive'
}

export type DesignationListResponse = PaginatedResponse<Designation>
