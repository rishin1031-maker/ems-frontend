import { useLocation } from 'react-router-dom'
import { LogOut, Menu, Moon, Sun, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { GlobalSearchInput } from '@/components/layout/GlobalSearchInput'
import { NotificationBell } from '@/components/layout/NotificationBell'
import { useTheme } from '@/hooks/useTheme'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { ROLES, type Role } from '@/lib/constants'
import { resolvePageTitle } from '@/lib/nav'
import { cn } from '@/lib/cn'

interface HeaderProps {
  onMenuClick: () => void
  onLogout: () => void
  theme?: 'admin' | 'employee'
  role?: Role
  showSearch?: boolean
}

function UserAvatar({ name }: { name?: string }) {
  const initials = (name ?? 'U')
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <div className="flex h-9 w-9 items-center justify-center rounded-full glass-chip text-xs font-semibold text-blue-700 dark:text-blue-300">
      {initials}
    </div>
  )
}

export function Header({
  onMenuClick,
  onLogout,
  theme = 'admin',
  role = ROLES.ADMIN,
  showSearch = true,
}: HeaderProps) {
  const { isDark, toggleTheme } = useTheme()
  const { user } = useAuth()
  const location = useLocation()
  const pageTitle = resolvePageTitle(location.pathname)

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 glass-panel-strong px-4 lg:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden dark:hover:bg-slate-800"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <h1 className="truncate text-lg font-semibold text-slate-900 dark:text-slate-100">{pageTitle}</h1>
      </div>

      {showSearch && (
        <div className="mx-auto hidden max-w-xl flex-1 md:block">
          <GlobalSearchInput role={role} theme={theme} />
        </div>
      )}

      <div className="ml-auto flex items-center gap-1 sm:gap-2">
        <NotificationBell role={role} theme={theme} />
        <Button variant="ghost" size="sm" onClick={toggleTheme} aria-label="Toggle theme" theme={theme}>
          {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>

        <div className="hidden items-center gap-2 rounded-xl glass-chip px-2 py-1 sm:flex">
          <UserAvatar name={user?.name} />
          <div className="hidden min-w-0 lg:block">
            <p className="truncate text-sm font-medium text-slate-900 dark:text-slate-100">{user?.name ?? 'User'}</p>
            <p className="truncate text-[11px] text-slate-500">
              {role === ROLES.ADMIN ? 'Administrator' : (user?.employee_id as string) ?? 'Employee'}
            </p>
          </div>
          <ChevronDown className="hidden h-4 w-4 text-slate-400 lg:block" />
        </div>

        <Button variant="ghost" size="sm" onClick={onLogout} theme={theme} className="text-slate-500">
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">Logout</span>
        </Button>
      </div>
    </header>
  )
}

export function PageSection({
  title,
  description,
  actions,
  children,
  className,
}: {
  title?: string
  description?: string
  actions?: React.ReactNode
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn(className)}>
      {(title || actions) && (
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          {(title || description) && (
            <div>
              {title && <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">{title}</h2>}
              {description && <p className="mt-0.5 text-sm text-slate-500">{description}</p>}
            </div>
          )}
          {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
        </div>
      )}
      {children}
    </div>
  )
}
