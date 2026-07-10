import type { LucideIcon } from 'lucide-react'
import {
  LayoutDashboard,
  Users,
  Building2,
  Briefcase,
  CalendarDays,
  Clock,
  IndianRupee,
  FileText,
  Bell,
  User,
  BarChart3,
  CheckSquare,
  Settings,
} from 'lucide-react'

export interface CommandNavItem {
  label: string
  to: string
  icon: LucideIcon
  keywords?: string
}

export const ADMIN_COMMAND_NAV: CommandNavItem[] = [
  { label: 'Dashboard', to: '/admin/dashboard', icon: LayoutDashboard, keywords: 'home overview stats' },
  { label: 'Employees', to: '/admin/employees', icon: Users, keywords: 'staff team people' },
  { label: 'Departments', to: '/admin/departments', icon: Building2, keywords: 'org units teams' },
  { label: 'Designations', to: '/admin/designations', icon: Briefcase, keywords: 'roles titles jobs' },
  { label: 'Leave Management', to: '/admin/leaves', icon: CalendarDays, keywords: 'time off vacation requests' },
  { label: 'Attendance', to: '/admin/attendance', icon: Clock, keywords: 'present absent daily' },
  { label: 'Payroll', to: '/admin/salary', icon: IndianRupee, keywords: 'salary wages pay' },
  { label: 'Payroll Report', to: '/admin/payroll', icon: FileText, keywords: 'report earnings monthly' },
  { label: 'Notifications', to: '/admin/notifications', icon: Bell, keywords: 'alerts messages' },
  { label: 'System Settings', to: '/admin/settings', icon: Settings, keywords: 'policy continuous session auto checkout break' },
]

export const EMPLOYEE_COMMAND_NAV: CommandNavItem[] = [
  { label: 'Dashboard', to: '/employee/dashboard', icon: LayoutDashboard, keywords: 'home overview' },
  { label: 'Attendance', to: '/employee/attendance', icon: Clock, keywords: 'clock in out history' },
  { label: 'Work Hours', to: '/employee/attendance/charts', icon: BarChart3, keywords: 'charts analytics' },
  { label: 'My Leaves', to: '/employee/leaves', icon: CalendarDays, keywords: 'time off vacation apply' },
  { label: 'Apply Leave', to: '/employee/leaves/apply', icon: CalendarDays, keywords: 'request new leave' },
  { label: 'Daily Checklist', to: '/employee/checklist', icon: CheckSquare, keywords: 'tasks todo daily list complete' },
  { label: 'My Profile', to: '/employee/profile', icon: User, keywords: 'account settings' },
  { label: 'Notifications', to: '/employee/notifications', icon: Bell, keywords: 'alerts messages' },
]

export function filterCommandNav(items: CommandNavItem[], query: string): CommandNavItem[] {
  const q = query.trim().toLowerCase()
  if (!q) return items
  return items.filter(
    (item) =>
      item.label.toLowerCase().includes(q) ||
      item.to.toLowerCase().includes(q) ||
      item.keywords?.toLowerCase().includes(q),
  )
}
