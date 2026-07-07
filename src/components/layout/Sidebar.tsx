import type { LucideIcon } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/cn'
import { APP_NAME, APP_TAGLINE } from '@/lib/nav'

export interface NavItem {
  label: string
  to: string
  icon: LucideIcon
}

interface SidebarProps {
  items: NavItem[]
  title?: string
  subtitle?: string
  theme: 'admin' | 'employee'
  open: boolean
  collapsed: boolean
  onClose: () => void
  onToggleCollapse: () => void
}

export function Sidebar({
  items,
  theme,
  open,
  collapsed,
  onClose,
  onToggleCollapse,
}: SidebarProps) {
  const activeClass =
    theme === 'admin' ? 'glass-nav-active-admin' : 'glass-nav-active-employee'

  const logoGradient =
    theme === 'admin'
      ? 'bg-gradient-to-br from-blue-500 to-blue-700'
      : 'bg-gradient-to-br from-sky-500 to-sky-700'

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40 glass-overlay lg:hidden"
          onClick={onClose}
          aria-hidden
        />
      )}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex flex-col glass-panel-strong transition-all duration-200 lg:static',
          collapsed ? 'w-[72px]' : 'w-64',
          open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        )}
      >
        <div className={cn('flex h-16 items-center border-b border-slate-100 dark:border-slate-800', collapsed ? 'justify-center px-2' : 'gap-3 px-5')}>
          <div className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-xs font-bold text-white shadow-sm', logoGradient)}>
            {APP_NAME.slice(0, 2)}
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="truncate font-semibold leading-tight text-slate-900 dark:text-slate-100">{APP_NAME}</p>
              <p className="truncate text-[11px] text-slate-500">{APP_TAGLINE}</p>
            </div>
          )}
        </div>

        <nav className="flex-1 space-y-2 overflow-y-auto p-3 scrollbar-thin">
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              title={collapsed ? item.label : undefined}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                  collapsed && 'justify-center px-2',
                  isActive
                    ? activeClass
                    : 'glass-nav-hover text-slate-600 dark:text-slate-400 dark:hover:text-slate-100',
                )
              }
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        {!collapsed && (
          <div className="mx-3 mb-3 rounded-xl glass-chip p-3">
            <p className="text-xs font-medium text-slate-700 dark:text-slate-200">HR workspace</p>
            <p className="mt-0.5 text-[11px] leading-relaxed text-slate-500">
              Manage attendance, leaves, and payroll in one place.
            </p>
          </div>
        )}

        <div className="border-t border-slate-100 p-3 dark:border-slate-800">
          <button
            type="button"
            onClick={onToggleCollapse}
            className={cn(
              'hidden w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-slate-500 transition hover:bg-slate-50 hover:text-slate-700 lg:flex dark:hover:bg-slate-800',
              collapsed && 'justify-center px-2',
            )}
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            {!collapsed && 'Collapse'}
          </button>
        </div>
      </aside>
    </>
  )
}
