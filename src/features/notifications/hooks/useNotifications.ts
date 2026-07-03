import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { adminNotificationsApi, employeeNotificationsApi } from '@/api/notifications.api'
import type { NotificationListParams } from '@/api/types/notification'
import { ROLES, type Role } from '@/lib/constants'

function getApi(role: Role) {
  return role === ROLES.ADMIN ? adminNotificationsApi : employeeNotificationsApi
}

function queryKey(role: Role, suffix?: string | Record<string, unknown>) {
  return suffix
    ? (['notifications', role, suffix] as const)
    : (['notifications', role] as const)
}

export function useNotifications(role: Role, params: NotificationListParams = { page: 1, per_page: 20 }) {
  const api = getApi(role)
  return useQuery({
    queryKey: queryKey(role, params),
    queryFn: () => api.list(params),
  })
}

export function useUnreadNotificationCount(role: Role) {
  const api = getApi(role)
  return useQuery({
    queryKey: queryKey(role, 'unread-count'),
    queryFn: api.unreadCount,
    refetchInterval: 60_000,
  })
}

export function useNotificationMutations(role: Role) {
  const api = getApi(role)
  const qc = useQueryClient()

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['notifications', role] })
  }

  const markRead = useMutation({
    mutationFn: (id: number | string) => api.markRead(id),
    onSuccess: invalidate,
  })

  const markAllRead = useMutation({
    mutationFn: () => api.markAllRead(),
    onSuccess: invalidate,
  })

  return { markRead, markAllRead }
}
