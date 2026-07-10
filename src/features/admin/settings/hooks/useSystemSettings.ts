import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { adminSettingsApi } from '@/api/admin/settings.api'
import type { ContinuousSessionPolicyUpdate } from '@/api/types/settings'

const SETTINGS_KEY = ['admin', 'settings'] as const

export function useSystemSettings() {
  return useQuery({
    queryKey: SETTINGS_KEY,
    queryFn: adminSettingsApi.get,
  })
}

export function useUpdateSystemSettings() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (continuous_session: ContinuousSessionPolicyUpdate) =>
      adminSettingsApi.update({ continuous_session }),
    onSuccess: (data) => {
      queryClient.setQueryData(SETTINGS_KEY, data)
    },
  })
}
