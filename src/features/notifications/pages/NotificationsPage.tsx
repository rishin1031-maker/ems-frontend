import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, CheckCheck } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/Button'
import { Pagination } from '@/components/ui/Pagination'
import { TableSkeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/feedback/EmptyState'
import { useOptimisticNotifications } from '@/features/notifications/hooks/useOptimisticNotifications'
import { isNotificationRead } from '@/api/types/notification'
import { formatDateTime } from '@/lib/format'
import {
  NOTIFICATION_CATEGORIES,
  categorizeNotification,
  resolveNotificationUrl,
  type NotificationCategory,
} from '@/lib/notificationGroups'
import { cn } from '@/lib/cn'
import { ROLES, type Role } from '@/lib/constants'
import type { NotificationListParams } from '@/api/types/notification'

interface NotificationsPageProps {
  role: Role
}

export function NotificationsPage({ role }: NotificationsPageProps) {
  const navigate = useNavigate()
  const [category, setCategory] = useState<NotificationCategory | 'all'>('all')
  const [params, setParams] = useState<NotificationListParams>({ page: 1, per_page: 30 })
  const theme = role === ROLES.ADMIN ? 'admin' : 'employee'

  const { items, meta, unread, isLoading, isMutating, markOneRead, markEveryRead } =
    useOptimisticNotifications(role, params)

  const filtered = useMemo(() => {
    if (category === 'all') return items
    return items.filter((n) => categorizeNotification(n) === category)
  }, [items, category])

  const categoryCounts = useMemo(() => {
    const counts = { all: 0, leave: 0, salary: 0, system: 0 }
    for (const n of items) {
      if (!isNotificationRead(n)) {
        counts.all += 1
        counts[categorizeNotification(n)] += 1
      }
    }
    return counts
  }, [items])

  const handleOpen = (id: string, url?: string) => {
    const path = resolveNotificationUrl(url)
    void markOneRead(id)
    if (path) navigate(path)
  }

  return (
    <div>
      <PageHeader
        title="Notifications"
        description={
          unread > 0
            ? `${unread} unread notification${unread === 1 ? '' : 's'}`
            : 'All caught up'
        }
        actions={
          unread > 0 ? (
            <Button
              variant="outline"
              theme={theme}
              onClick={() => void markEveryRead()}
              loading={isMutating}
            >
              <CheckCheck className="h-4 w-4" />
              Mark all as read
            </Button>
          ) : undefined
        }
      />

      <div className="mb-6 flex flex-wrap gap-2">
        {NOTIFICATION_CATEGORIES.map((cat) => {
          const count = categoryCounts[cat.id]
          const active = category === cat.id
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setCategory(cat.id)}
              className={cn(
                'rounded-xl px-4 py-2 text-sm font-medium transition',
                active
                  ? theme === 'admin'
                    ? 'glass-nav-active-admin'
                    : 'glass-nav-active-employee'
                  : 'glass-chip text-slate-600 dark:text-slate-300',
              )}
            >
              {cat.label}
              {count > 0 && (
                <span className="ml-2 rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
                  {count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {isLoading ? (
        <TableSkeleton rows={6} cols={1} />
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No notifications"
          description={category === 'all' ? "You're all caught up." : `No ${category} notifications in this view.`}
        />
      ) : (
        <>
          <div className="divide-y divide-slate-100 overflow-hidden rounded-2xl glass-card dark:divide-slate-800">
            {filtered.map((n) => {
              const read = isNotificationRead(n)
              const cat = categorizeNotification(n)
              return (
                <div
                  key={n.id}
                  role={n.url ? 'button' : undefined}
                  tabIndex={n.url ? 0 : undefined}
                  onClick={() => n.url && handleOpen(n.id, n.url)}
                  onKeyDown={(e) => e.key === 'Enter' && n.url && handleOpen(n.id, n.url)}
                  className={cn(
                    'flex items-start gap-4 p-4 transition',
                    !read && 'bg-blue-50/30 dark:bg-blue-950/15',
                    n.url && 'cursor-pointer hover:bg-slate-50/50 dark:hover:bg-slate-800/30',
                  )}
                >
                  <div
                    className={cn(
                      'mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full glass-chip',
                      !read && (theme === 'admin' ? 'text-blue-600' : 'text-sky-600'),
                    )}
                  >
                    <Bell className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium uppercase text-slate-500 dark:bg-slate-800">
                        {cat}
                      </span>
                    </div>
                    {n.title && (
                      <p className={cn('mt-1 font-medium text-slate-900 dark:text-slate-100', !read && 'font-semibold')}>
                        {n.title}
                      </p>
                    )}
                    {n.message && (
                      <p className="mt-0.5 text-sm text-slate-600 dark:text-slate-400">{n.message}</p>
                    )}
                    {n.created_at && (
                      <p className="mt-1 text-xs text-slate-400">{formatDateTime(n.created_at)}</p>
                    )}
                  </div>
                  {!read && (
                    <Button
                      variant="ghost"
                      size="sm"
                      theme={theme}
                      onClick={(e) => {
                        e.stopPropagation()
                        void markOneRead(n.id)
                      }}
                      loading={isMutating}
                    >
                      Mark read
                    </Button>
                  )}
                </div>
              )
            })}
          </div>

          {category === 'all' && meta && meta.last_page > 1 && (
            <div className="mt-4">
              <Pagination
                meta={meta}
                onPageChange={(page) => setParams((p) => ({ ...p, page }))}
              />
            </div>
          )}
        </>
      )}
    </div>
  )
}
