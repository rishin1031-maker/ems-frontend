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
  ScrollText,
  Inbox,
  UsersRound,
} from 'lucide-react'
import { GlassShell } from '@/components/layout/GlassShell'
import { Header } from '@/components/layout/Header'
import { CommandPalette } from '@/components/layout/CommandPalette'
import { CommandPaletteProvider } from '@/components/layout/CommandPaletteContext'
import { Sidebar, type NavItem } from '@/components/layout/Sidebar'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { ROLES } from '@/lib/constants'

const navItems: NavItem[] = [
  { label: 'Dashboard', to: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'Team Overview', to: '/admin/team', icon: UsersRound },
  { label: 'Approval Inbox', to: '/admin/inbox', icon: Inbox },
  { label: 'Employees', to: '/admin/employees', icon: Users },
  { label: 'Departments', to: '/admin/departments', icon: Building2 },
  { label: 'Designations', to: '/admin/designations', icon: Briefcase },
  { label: 'Leave Management', to: '/admin/leaves', icon: CalendarDays },
  { label: 'Attendance', to: '/admin/attendance', icon: Clock },
  { label: 'Payroll', to: '/admin/salary', icon: IndianRupee },
  { label: 'Reports', to: '/admin/payroll', icon: FileText },
  { label: 'Activity Log', to: '/admin/activity-log', icon: ScrollText },
  { label: 'Notifications', to: '/admin/notifications', icon: Bell },
]

export function AdminLayout() {
  const { logout } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)

  return (
    <CommandPaletteProvider>
      <GlassShell variant="admin">
        <div className="relative z-10 flex min-h-screen">
          <Sidebar
            items={navItems}
            theme="admin"
            open={sidebarOpen}
            collapsed={collapsed}
            onClose={() => setSidebarOpen(false)}
            onToggleCollapse={() => setCollapsed((v) => !v)}
          />
          <div className="flex min-w-0 flex-1 flex-col">
            <Header
              onMenuClick={() => setSidebarOpen(true)}
              onLogout={() => void logout()}
              theme="admin"
              role={ROLES.ADMIN}
            />
            <main className="flex-1 overflow-auto p-4 lg:p-8">
              <Outlet />
            </main>
          </div>
          <CommandPalette role={ROLES.ADMIN} />
        </div>
      </GlassShell>
    </CommandPaletteProvider>
  )
}
