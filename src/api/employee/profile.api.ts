import { apiGet, apiPatch } from '@/api/client'
import type { AuthUser } from '@/api/types/common'

export interface UpdatePhonePayload {
  phone: string
}

export const employeeProfileApi = {
  get: () => apiGet<AuthUser>('/employee/profile'),

  updatePhone: (payload: UpdatePhonePayload) =>
    apiPatch<AuthUser>('/employee/profile/phone', payload),
}
