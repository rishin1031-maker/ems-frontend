import { apiDelete, apiGet, apiPost, apiPut } from '@/api/client'
import type {
  CreateDepartmentPayload,
  Department,
  DepartmentListParams,
  DepartmentListResponse,
  UpdateDepartmentPayload,
} from '@/api/types/department'

export const adminDepartmentsApi = {
  list: (params?: DepartmentListParams) =>
    apiGet<DepartmentListResponse>('/admin/departments', params as Record<string, unknown>),

  get: (id: number | string) => apiGet<Department>(`/admin/departments/${id}`),

  create: (payload: CreateDepartmentPayload) =>
    apiPost<Department>('/admin/departments', payload),

  update: (id: number | string, payload: UpdateDepartmentPayload) =>
    apiPut<Department>(`/admin/departments/${id}`, payload),

  delete: (id: number | string) => apiDelete<null>(`/admin/departments/${id}`),

  toggleStatus: (id: number | string) =>
    apiPost<Department>(`/admin/departments/${id}/toggle-status`),
}
