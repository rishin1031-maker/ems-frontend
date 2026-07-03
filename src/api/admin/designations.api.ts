import { apiDelete, apiGet, apiPost, apiPut } from '@/api/client'
import type {
  CreateDesignationPayload,
  Designation,
  DesignationListParams,
  DesignationListResponse,
  UpdateDesignationPayload,
} from '@/api/types/designation'

export const adminDesignationsApi = {
  list: (params?: DesignationListParams) =>
    apiGet<DesignationListResponse>('/admin/designations', params as Record<string, unknown>),

  get: (id: number | string) => apiGet<Designation>(`/admin/designations/${id}`),

  create: (payload: CreateDesignationPayload) =>
    apiPost<Designation>('/admin/designations', payload),

  update: (id: number | string, payload: UpdateDesignationPayload) =>
    apiPut<Designation>(`/admin/designations/${id}`, payload),

  delete: (id: number | string) => apiDelete<null>(`/admin/designations/${id}`),

  toggleStatus: (id: number | string) =>
    apiPost<Designation>(`/admin/designations/${id}/toggle-status`),
}
