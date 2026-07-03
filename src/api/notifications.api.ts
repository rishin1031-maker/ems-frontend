import { apiGet, apiPost } from '@/api/client'
import {
  normalizeNotificationList,
  normalizeUnreadCount,
  type Notification,
  type NotificationListParams,
} from '@/api/types/notification'

function createNotificationsApi(basePath: string) {
  return {
    list: async (params?: NotificationListParams) => {
      const raw = await apiGet<unknown>(basePath, params as Record<string, unknown>)
      return normalizeNotificationList(raw)
    },

    unreadCount: async () => {
      const raw = await apiGet<unknown>(`${basePath}/unread-count`)
      return normalizeUnreadCount(raw)
    },

    markAllRead: () => apiPost<null>(`${basePath}/read-all`),

    markRead: (id: number | string) => apiPost<Notification>(`${basePath}/${id}/read`),
  }
}

export const adminNotificationsApi = createNotificationsApi('/admin/notifications')
export const employeeNotificationsApi = createNotificationsApi('/employee/notifications')
