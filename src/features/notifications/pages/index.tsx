import { NotificationsPage } from '@/features/notifications/pages/NotificationsPage'
import { ROLES } from '@/lib/constants'

export function AdminNotificationsPage() {
  return <NotificationsPage role={ROLES.ADMIN} />
}

export function EmployeeNotificationsPage() {
  return <NotificationsPage role={ROLES.EMPLOYEE} />
}
