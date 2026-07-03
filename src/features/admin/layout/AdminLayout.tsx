import { useState } from 'react'
import { Outlet } from 'react-router-dom'
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
} from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { Sidebar, type NavItem } from '@/components/layout/Sidebar'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { ROLES } from '@/lib/constants'

const navItems: NavItem[] = [
  { label: 'Dashboard', to: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'Employees', to: '/admin/employees', icon: Users },
  { label: 'Departments', to: '/admin/departments', icon: Building2 },
  { label: 'Designations', to: '/admin/designations', icon: Briefcase },
  { label: 'Leaves', to: '/admin/leaves', icon: CalendarDays },
  { label: 'Attendance', to: '/admin/attendance', icon: Clock },
  { label: 'Salary', to: '/admin/salary', icon: IndianRupee },
  { label: 'Payroll', to: '/admin/payroll', icon: FileText },
  { label: 'Notifications', to: '/admin/notifications', icon: Bell },
]

export function AdminLayout() {
  const { user, logout } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
      <Sidebar
        items={navItems}
        title="Admin Portal"
        subtitle="Management"
        theme="admin"
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <Header
          userName={user?.name}
          onMenuClick={() => setSidebarOpen(true)}
          onLogout={() => void logout()}
          theme="admin"
          role={ROLES.ADMIN}
        />
        <main className="flex-1 overflow-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
