import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Bell, CheckCheck } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/cn'
import {
  useUnreadNotificationCount,
  useNotifications,
  useNotificationMutations,
} from '@/features/notifications/hooks/useNotifications'
import { isNotificationRead } from '@/api/types/notification'
import { formatDateTime } from '@/lib/format'
import { ROLES, type Role } from '@/lib/constants'

interface NotificationBellProps {
  role: Role
  theme?: 'admin' | 'employee'
}

export function NotificationBell({ role, theme = 'admin' }: NotificationBellProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const basePath = role === ROLES.ADMIN ? '/admin/notifications' : '/employee/notifications'

  const { data: count = 0 } = useUnreadNotificationCount(role)
  const { data } = useNotifications(role, { page: 1, per_page: 8 })
  const { markRead, markAllRead } = useNotificationMutations(role)

  const items = data?.items ?? []
  const unread = typeof count === 'number' ? count : 0

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [open])

  const accent =
    theme === 'admin'
      ? 'text-indigo-600 dark:text-indigo-400'
      : 'text-teal-600 dark:text-teal-400'

  const handleMarkRead = async (id: string) => {
    await markRead.mutateAsync(id)
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'relative rounded-lg p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800',
          open && 'bg-gray-100 dark:bg-gray-800',
        )}
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        {unread > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
            {unread > 99 ? '99+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-80 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl dark:border-gray-800 dark:bg-gray-900 sm:w-96">
          <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3 dark:border-gray-800">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">Notifications</h3>
            {unread > 0 && (
              <button
                type="button"
                onClick={() => markAllRead.mutate()}
                className={cn('flex items-center gap-1 text-xs font-medium hover:underline', accent)}
              >
                <CheckCheck className="h-3.5 w-3.5" />
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {items.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-gray-500">No notifications</p>
            ) : (
              items.map((n) => {
                const read = isNotificationRead(n)
                return (
                  <button
                    key={n.id}
                    type="button"
                    onClick={() => !read && handleMarkRead(n.id)}
                    className={cn(
                      'w-full border-b border-gray-100 px-4 py-3 text-left transition-colors last:border-0 dark:border-gray-800',
                      !read && 'bg-indigo-50/50 dark:bg-indigo-950/20',
                      'hover:bg-gray-50 dark:hover:bg-gray-800/50',
                    )}
                  >
                    {(n.title || n.message) && (
                      <>
                        {n.title && (
                          <p className={cn('text-sm font-medium', !read && accent)}>{n.title}</p>
                        )}
                        {n.message && (
                          <p className="text-sm text-gray-600 dark:text-gray-400">{n.message}</p>
                        )}
                      </>
                    )}
                    {n.created_at && (
                      <p className="mt-1 text-xs text-gray-400">{formatDateTime(n.created_at)}</p>
                    )}
                  </button>
                )
              })
            )}
          </div>

          <div className="border-t border-gray-200 p-2 dark:border-gray-800">
            <Link to={basePath} onClick={() => setOpen(false)}>
              <Button variant="ghost" size="sm" className="w-full" theme={theme}>
                View all notifications
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
