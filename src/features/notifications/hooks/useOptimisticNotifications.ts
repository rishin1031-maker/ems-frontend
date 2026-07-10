import { useOptimistic, useTransition } from 'react'
import {
  useNotifications,
  useNotificationMutations,
  useUnreadNotificationCount,
} from '@/features/notifications/hooks/useNotifications'
import {
  isNotificationRead,
  type Notification,
  type NotificationListParams,
} from '@/api/types/notification'
import type { Role } from '@/lib/constants'

type NotificationAction =
  | { type: 'markRead'; id: string }
  | { type: 'markAllRead' }

type UnreadAction = { type: 'markRead' } | { type: 'markAllRead' }

function reduceNotifications(current: Notification[], action: NotificationAction): Notification[] {
  switch (action.type) {
    case 'markRead':
      return current.map((n) =>
        n.id === action.id
          ? { ...n, is_read: true, read_at: n.read_at ?? new Date().toISOString() }
          : n,
      )
    case 'markAllRead':
      return current.map((n) =>
        isNotificationRead(n)
          ? n
          : { ...n, is_read: true, read_at: n.read_at ?? new Date().toISOString() },
      )
    default:
      return current
  }
}

function reduceUnread(current: number, action: UnreadAction): number {
  if (action.type === 'markAllRead') return 0
  return Math.max(0, current - 1)
}

export function useOptimisticNotifications(
  role: Role,
  params: NotificationListParams = { page: 1, per_page: 20 },
) {
  const { data, isLoading } = useNotifications(role, params)
  const { data: serverUnread = 0 } = useUnreadNotificationCount(role)
  const { markRead, markAllRead } = useNotificationMutations(role)
  const [, startTransition] = useTransition()

  const serverItems = data?.items ?? []
  const unreadCount = typeof serverUnread === 'number' ? serverUnread : 0

  const [optimisticItems, addOptimistic] = useOptimistic(serverItems, reduceNotifications)
  const [unread, addUnreadOptimistic] = useOptimistic(unreadCount, reduceUnread)

  const markOneRead = (id: string) =>
    new Promise<void>((resolve, reject) => {
      const alreadyRead = serverItems.find((n) => n.id === id && isNotificationRead(n))
      startTransition(async () => {
        addOptimistic({ type: 'markRead', id })
        if (!alreadyRead) addUnreadOptimistic({ type: 'markRead' })
        try {
          await markRead.mutateAsync(id)
          resolve()
        } catch (err) {
          reject(err)
        }
      })
    })

  const markEveryRead = () =>
    new Promise<void>((resolve, reject) => {
      startTransition(async () => {
        addOptimistic({ type: 'markAllRead' })
        addUnreadOptimistic({ type: 'markAllRead' })
        try {
          await markAllRead.mutateAsync()
          resolve()
        } catch (err) {
          reject(err)
        }
      })
    })

  return {
    items: optimisticItems,
    meta: data?.meta,
    unread,
    isLoading,
    isMutating: markRead.isPending || markAllRead.isPending,
    markOneRead,
    markEveryRead,
  }
}
