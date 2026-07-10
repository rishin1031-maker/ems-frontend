import { apiGet } from '@/api/client'
import type { SystemSettings } from '@/api/types/settings'

export const employeePolicyApi = {
  continuousSession: () => apiGet<SystemSettings>('/employee/policy/continuous-session'),
}
