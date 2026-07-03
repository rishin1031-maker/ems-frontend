import type { PaginatedResponse, PaginationParams } from './auth'

export interface Notification {
  id: string
  title?: string
  message: string
  type?: string
  icon?: string
  color?: string
  url?: string
  read_at?: string | null
  is_read?: boolean
  created_at?: string
  data?: Record<string, unknown>
}

export interface NotificationListParams extends PaginationParams {
  unread_only?: boolean | string
}

export interface UnreadCount {
  count: number
  unread_count?: number
}

export type NotificationListResponse = PaginatedResponse<Notification>

function asRecord(value: unknown): Record<string, unknown> {
  return value != null && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {}
}

export function normalizeNotification(raw: unknown): Notification {
  const row = asRecord(raw)
  const payload = asRecord(row.data)
  const readAt = row.read_at as string | null | undefined
  const isRead = row.is_read as boolean | undefined

  const title =
    (row.title as string | undefined) ??
    (payload.title as string | undefined)

  const message = String(
    row.message ??
      row.body ??
      row.content ??
      payload.message ??
      payload.body ??
      payload.content ??
      '',
  )

  return {
    id: String(row.id ?? ''),
    title,
    message,
    type: row.type as string | undefined,
    icon: payload.icon as string | undefined,
    color: payload.color as string | undefined,
    url: payload.url as string | undefined,
    read_at: readAt,
    is_read: isRead ?? Boolean(readAt),
    created_at: row.created_at as string | undefined,
    data: Object.keys(payload).length > 0 ? payload : undefined,
  }
}

export function normalizeNotificationList(raw: unknown): NotificationListResponse {
  if (Array.isArray(raw)) {
    const items = raw.map(normalizeNotification)
    return {
      items,
      meta: { current_page: 1, last_page: 1, per_page: items.length, total: items.length },
    }
  }

  const data = asRecord(raw)
  const itemsRaw = data.items ?? data.notifications ?? data.data ?? []
  const items = Array.isArray(itemsRaw) ? itemsRaw.map(normalizeNotification) : []
  const metaRaw = asRecord(data.meta)

  return {
    items,
    meta: {
      current_page: Number(metaRaw.current_page ?? 1),
      last_page: Number(metaRaw.last_page ?? 1),
      per_page: Number(metaRaw.per_page ?? items.length),
      total: Number(metaRaw.total ?? items.length),
    },
  }
}

export function normalizeUnreadCount(raw: unknown): number {
  if (typeof raw === 'number') return raw
  const data = asRecord(raw)
  const count = data.count ?? data.unread_count ?? data.unread
  return typeof count === 'number' ? count : Number(count ?? 0)
}

export function isNotificationRead(n: Notification): boolean {
  return n.is_read ?? Boolean(n.read_at)
}
