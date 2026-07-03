import { useState } from 'react'
import { Bell, CheckCheck } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/Button'
import { Pagination } from '@/components/ui/Pagination'
import { TableSkeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/feedback/EmptyState'
import {
  useNotifications,
  useNotificationMutations,
  useUnreadNotificationCount,
} from '@/features/notifications/hooks/useNotifications'
import { isNotificationRead } from '@/api/types/notification'
import { formatDateTime } from '@/lib/format'
import { cn } from '@/lib/cn'
import { ROLES, type Role } from '@/lib/constants'
import type { NotificationListParams } from '@/api/types/notification'

interface NotificationsPageProps {
  role: Role
}

export function NotificationsPage({ role }: NotificationsPageProps) {
  const [params, setParams] = useState<NotificationListParams>({ page: 1, per_page: 15 })
  const theme = role === ROLES.ADMIN ? 'admin' : 'employee'

  const { data, isLoading } = useNotifications(role, params)
  const { data: unreadCount = 0 } = useUnreadNotificationCount(role)
  const { markRead, markAllRead } = useNotificationMutations(role)

  const items = data?.items ?? []

  return (
    <div>
      <PageHeader
        title="Notifications"
        description={
          unreadCount > 0
            ? `${unreadCount} unread notification${unreadCount === 1 ? '' : 's'}`
            : 'All caught up'
        }
        actions={
          unreadCount > 0 ? (
            <Button
              variant="outline"
              theme={theme}
              onClick={() => markAllRead.mutate()}
              loading={markAllRead.isPending}
            >
              <CheckCheck className="h-4 w-4" />
              Mark all as read
            </Button>
          ) : undefined
        }
      />

      {isLoading ? (
        <TableSkeleton rows={6} cols={1} />
      ) : items.length === 0 ? (
        <EmptyState
          title="No notifications"
          description="You're all caught up. New notifications will appear here."
        />
      ) : (
        <>
          <div className="divide-y divide-gray-200 overflow-hidden rounded-xl border border-gray-200 dark:divide-gray-800 dark:border-gray-800">
            {items.map((n) => {
              const read = isNotificationRead(n)
              return (
                <div
                  key={n.id}
                  className={cn(
                    'flex items-start gap-4 bg-white p-4 dark:bg-gray-900',
                    !read && 'bg-indigo-50/40 dark:bg-indigo-950/15',
                  )}
                >
                  <div
                    className={cn(
                      'mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full',
                      read
                        ? 'bg-gray-100 text-gray-400 dark:bg-gray-800'
                        : theme === 'admin'
                          ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400'
                          : 'bg-teal-100 text-teal-600 dark:bg-teal-950 dark:text-teal-400',
                    )}
                  >
                    <Bell className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    {(n.title || n.message) && (
                      <>
                        {n.title && (
                          <p className={cn('font-medium text-gray-900 dark:text-gray-100', !read && 'font-semibold')}>
                            {n.title}
                          </p>
                        )}
                        {n.message && (
                          <p className="mt-0.5 text-sm text-gray-600 dark:text-gray-400">{n.message}</p>
                        )}
                      </>
                    )}
                    {n.created_at && (
                      <p className="mt-1 text-xs text-gray-400">{formatDateTime(n.created_at)}</p>
                    )}
                  </div>
                  {!read && (
                    <Button
                      variant="ghost"
                      size="sm"
                      theme={theme}
                      onClick={() => markRead.mutate(n.id)}
                      loading={markRead.isPending}
                    >
                      Mark read
                    </Button>
                  )}
                </div>
              )
            })}
          </div>

          {data?.meta && data.meta.last_page > 1 && (
            <div className="mt-4">
              <Pagination
                meta={data.meta}
                onPageChange={(page) => setParams((p) => ({ ...p, page }))}
              />
            </div>
          )}
        </>
      )}
    </div>
  )
}
