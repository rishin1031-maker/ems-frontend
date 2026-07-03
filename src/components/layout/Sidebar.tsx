import type { LucideIcon } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { cn } from '@/lib/cn'

export interface NavItem {
  label: string
  to: string
  icon: LucideIcon
}

interface SidebarProps {
  items: NavItem[]
  title: string
  subtitle?: string
  theme: 'admin' | 'employee'
  open: boolean
  onClose: () => void
}

export function Sidebar({ items, title, subtitle, theme, open, onClose }: SidebarProps) {
  const activeClass =
    theme === 'admin'
      ? 'bg-indigo-600 text-white'
      : 'bg-teal-600 text-white'

  const logoClass =
    theme === 'admin' ? 'bg-indigo-600' : 'bg-teal-600'

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
          aria-hidden
        />
      )}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-gray-900 text-gray-100 transition-transform lg:static lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex h-16 items-center gap-3 border-b border-gray-800 px-6">
          <div className={cn('flex h-9 w-9 items-center justify-center rounded-lg text-sm font-bold text-white', logoClass)}>
            EMS
          </div>
          <div>
            <p className="font-semibold leading-tight">{title}</p>
            {subtitle && <p className="text-xs text-gray-400">{subtitle}</p>}
          </div>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-4 scrollbar-thin">
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? activeClass
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white',
                )
              }
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  )
}
