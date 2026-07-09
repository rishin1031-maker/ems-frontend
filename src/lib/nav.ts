/** Route labels for the app header (WorkMate-style). */
export const ROUTE_TITLES: Record<string, string> = {
  '/admin/dashboard': 'Dashboard',
  '/admin/employees': 'Employees',
  '/admin/employees/create': 'Add Employee',
  '/admin/departments': 'Departments',
  '/admin/designations': 'Designations',
  '/admin/leaves': 'Leave Management',
  '/admin/attendance': 'Attendance',
  '/admin/salary': 'Payroll',
  '/admin/payroll': 'Payroll Report',
  '/admin/activity-log': 'Activity Log',
  '/admin/inbox': 'Approval Inbox',
  '/admin/team': 'Team Overview',
  '/admin/notifications': 'Notifications',
  '/employee/dashboard': 'Dashboard',
  '/employee/attendance': 'Attendance',
  '/employee/attendance/charts': 'Work Hours',
  '/employee/leaves': 'My Leaves',
  '/employee/leaves/apply': 'Apply Leave',
  '/employee/checklist': 'Daily Checklist',
  '/employee/profile': 'My Profile',
  '/employee/notifications': 'Notifications',
  '/employee/change-password': 'Change Password',
}

export function resolvePageTitle(pathname: string): string {
  if (ROUTE_TITLES[pathname]) return ROUTE_TITLES[pathname]

  if (/^\/admin\/employees\/[^/]+\/edit$/.test(pathname)) return 'Edit Employee'
  if (/^\/admin\/employees\/[^/]+$/.test(pathname)) return 'Employee Details'
  if (/^\/admin\/leaves\/[^/]+$/.test(pathname)) return 'Leave Details'
  if (/^\/admin\/salary\/[^/]+$/.test(pathname)) return 'Manage Salary'

  return 'EMS'
}

export const APP_NAME = 'EMS'
export const APP_TAGLINE = 'Employee Management'
