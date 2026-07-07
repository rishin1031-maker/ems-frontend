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
import { GlassShell } from '@/components/layout/GlassShell'
import { Header } from '@/components/layout/Header'
import { CommandPalette } from '@/components/layout/CommandPalette'
import { CommandPaletteProvider } from '@/components/layout/CommandPaletteContext'
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
  const { logout } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)

  return (
    <CommandPaletteProvider>
      <GlassShell variant="employee">
        <div className="relative z-10 flex min-h-screen">
          <Sidebar
            items={navItems}
            theme="employee"
            open={sidebarOpen}
            collapsed={collapsed}
            onClose={() => setSidebarOpen(false)}
            onToggleCollapse={() => setCollapsed((v) => !v)}
          />
          <div className="flex min-w-0 flex-1 flex-col">
            <Header
              onMenuClick={() => setSidebarOpen(true)}
              onLogout={() => void logout()}
              theme="employee"
              role={ROLES.EMPLOYEE}
            />
            <main className="flex-1 overflow-auto p-4 lg:p-8">
              <Outlet />
            </main>
          </div>
          <CommandPalette role={ROLES.EMPLOYEE} />
        </div>
      </GlassShell>
    </CommandPaletteProvider>
  )
}
