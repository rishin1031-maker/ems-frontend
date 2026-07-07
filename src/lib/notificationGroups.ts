import type { Notification } from '@/api/types/notification'

export type NotificationCategory = 'leave' | 'salary' | 'system'

export const NOTIFICATION_CATEGORIES: { id: NotificationCategory | 'all'; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'leave', label: 'Leave' },
  { id: 'salary', label: 'Salary' },
  { id: 'system', label: 'System' },
]

export function categorizeNotification(n: Notification): NotificationCategory {
  const type = (n.type ?? '').toLowerCase()
  if (type.includes('leave')) return 'leave'
  if (type.includes('salary')) return 'salary'
  return 'system'
}

export function groupNotificationsByCategory(items: Notification[]): Record<NotificationCategory, Notification[]> {
  const groups: Record<NotificationCategory, Notification[]> = {
    leave: [],
    salary: [],
    system: [],
  }
  for (const n of items) {
    groups[categorizeNotification(n)].push(n)
  }
  return groups
}

export function countUnreadByCategory(items: Notification[]): Record<NotificationCategory | 'all', number> {
  const groups = groupNotificationsByCategory(items.filter((n) => !n.read_at && !n.is_read))
  return {
    all: items.filter((n) => !n.read_at && !n.is_read).length,
    leave: groups.leave.length,
    salary: groups.salary.length,
    system: groups.system.length,
  }
}

export function resolveNotificationUrl(url?: string): string | null {
  if (!url) return null
  return url
    .replace(/^\/admin\/leave\//, '/admin/leaves/')
    .replace(/^\/employee\/leave$/, '/employee/leaves')
}
