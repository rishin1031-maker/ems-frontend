import { apiGet, apiPut } from '@/api/client'
import type { ContinuousSessionPolicyUpdate, SystemSettings } from '@/api/types/settings'

export const adminSettingsApi = {
  get: () => apiGet<SystemSettings>('/admin/settings'),
  update: (payload: { continuous_session: ContinuousSessionPolicyUpdate }) =>
    apiPut<SystemSettings>('/admin/settings', payload),
}
