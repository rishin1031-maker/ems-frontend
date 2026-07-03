import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import {
  LayoutDashboard,
  User,
  Clock,
  BarChart3,
  CalendarDays,
  Bell,
} from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { Sidebar, type NavItem } from '@/components/layout/Sidebar'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { ROLES } from '@/lib/constants'

const navItems: NavItem[] = [
  { label: 'Dashboard', to: '/employee/dashboard', icon: LayoutDashboard },
  { label: 'Attendance', to: '/employee/attendance', icon: Clock },
  { label: 'Work Hours', to: '/employee/attendance/charts', icon: BarChart3 },
  { label: 'My Leaves', to: '/employee/leaves', icon: CalendarDays },
  { label: 'My Profile', to: '/employee/profile', icon: User },
  { label: 'Notifications', to: '/employee/notifications', icon: Bell },
]

export function EmployeeLayout() {
  const { user, logout } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
      <Sidebar
        items={navItems}
        title="Employee Portal"
        subtitle={user?.employee_id as string | undefined}
        theme="employee"
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <Header
          userName={user?.name}
          onMenuClick={() => setSidebarOpen(true)}
          onLogout={() => void logout()}
          theme="employee"
          role={ROLES.EMPLOYEE}
        />
        <main className="flex-1 overflow-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
