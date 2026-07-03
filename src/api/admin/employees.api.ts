import { apiDelete, apiGet, apiPost, apiPostForm, apiPut, apiPutForm } from '@/api/client'
import type {
  CreateEmployeePayload,
  Employee,
  EmployeeListParams,
  EmployeeListResponse,
  ResetPasswordPayload,
  UpdateEmployeePayload,
} from '@/api/types/employee'

function buildEmployeeFormData(payload: CreateEmployeePayload | UpdateEmployeePayload): FormData {
  const fd = new FormData()
  for (const [key, val] of Object.entries(payload)) {
    if (val === undefined || val === null || val === '') continue
    if (key === 'image' && val instanceof File) {
      fd.append('image', val)
    } else if (key !== 'image') {
      fd.append(key, String(val))
    }
  }
  return fd
}

function hasImageFile(payload: CreateEmployeePayload | UpdateEmployeePayload): boolean {
  return payload.image instanceof File
}

export const adminEmployeesApi = {
  list: (params?: EmployeeListParams) =>
    apiGet<EmployeeListResponse>('/admin/employees', params as Record<string, unknown>),

  get: (id: number | string) => apiGet<Employee>(`/admin/employees/${id}`),

  create: (payload: CreateEmployeePayload) => {
    if (hasImageFile(payload)) {
      return apiPostForm<Employee>('/admin/employees', buildEmployeeFormData(payload))
    }
    const { image: _image, ...body } = payload
    return apiPost<Employee>('/admin/employees', body)
  },

  update: (id: number | string, payload: UpdateEmployeePayload) => {
    if (hasImageFile(payload)) {
      return apiPutForm<Employee>(`/admin/employees/${id}`, buildEmployeeFormData(payload))
    }
    const { image: _image, ...body } = payload
    return apiPut<Employee>(`/admin/employees/${id}`, body)
  },

  delete: (id: number | string) => apiDelete<null>(`/admin/employees/${id}`),

  resetPassword: (id: number | string, payload: ResetPasswordPayload) =>
    apiPost<null>(`/admin/employees/${id}/reset-password`, payload),
}
