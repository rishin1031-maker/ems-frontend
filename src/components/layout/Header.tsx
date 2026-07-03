import { LogOut, Menu, Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { NotificationBell } from '@/components/layout/NotificationBell'
import { useTheme } from '@/hooks/useTheme'
import { ROLES, type Role } from '@/lib/constants'

interface HeaderProps {
  title?: string
  userName?: string
  onMenuClick: () => void
  onLogout: () => void
  theme?: 'admin' | 'employee'
  role?: Role
}

export function Header({
  title,
  userName,
  onMenuClick,
  onLogout,
  theme = 'admin',
  role = ROLES.ADMIN,
}: HeaderProps) {
  const { isDark, toggleTheme } = useTheme()

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4 dark:border-gray-800 dark:bg-gray-900 lg:px-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 lg:hidden dark:text-gray-300 dark:hover:bg-gray-800"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        {title && (
          <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{title}</h1>
        )}
      </div>

      <div className="flex items-center gap-2">
        {userName && (
          <span className="hidden text-sm text-gray-600 sm:inline dark:text-gray-400">
            {userName}
          </span>
        )}
        <NotificationBell role={role} theme={theme} />
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleTheme}
          aria-label="Toggle theme"
          theme={theme}
        >
          {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>
        <Button variant="ghost" size="sm" onClick={onLogout} theme={theme}>
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">Logout</span>
        </Button>
      </div>
    </header>
  )
}
