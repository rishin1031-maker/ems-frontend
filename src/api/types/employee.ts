import type { PaginatedResponse } from './auth'

export interface DepartmentRef {
  id: number
  name: string
}

export interface DesignationRef {
  id: number
  name: string
  department_id?: number
  department_name?: string
}

export interface Employee {
  id: number
  employee_id: string
  name: string
  email: string
  phone?: string | null
  gender?: 'male' | 'female' | 'other'
  dob?: string | null
  status: 'active' | 'inactive'
  image_url?: string | null
  department?: DepartmentRef | null
  designation?: DesignationRef | null
  department_id?: number | null
  designation_id?: number | null
  must_change_password?: boolean
  last_login_at?: string | null
  created_at?: string
  updated_at?: string
}

export interface EmployeeListParams {
  page?: number
  per_page?: number
  search?: string
  department_id?: number | string
  designation_id?: number | string
  status?: 'active' | 'inactive' | ''
}

export interface CreateEmployeePayload {
  name: string
  email: string
  phone: string
  gender: 'male' | 'female' | 'other'
  dob?: string
  department_id: number
  designation_id: number
  status?: 'active' | 'inactive'
  image?: File | null
}

export interface UpdateEmployeePayload {
  name?: string
  email?: string
  phone?: string
  gender?: 'male' | 'female' | 'other'
  dob?: string
  department_id?: number
  designation_id?: number
  status?: 'active' | 'inactive'
  image?: File | null
}

export interface ResetPasswordPayload {
  new_password: string
  new_password_confirmation: string
}

export type EmployeeListResponse = PaginatedResponse<Employee>
