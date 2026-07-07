import { useQuery } from '@tanstack/react-query'
import { adminActivityLogsApi, type ActivityLogListParams } from '@/api/admin/activityLogs.api'

export function useActivityLogs(params: ActivityLogListParams) {
  return useQuery({
    queryKey: ['admin', 'activity-logs', params],
    queryFn: () => adminActivityLogsApi.list(params),
  })
}
