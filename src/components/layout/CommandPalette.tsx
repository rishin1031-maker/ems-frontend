import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Building2,
  CalendarDays,
  Command,
  Loader2,
  Search,
  Users,
} from 'lucide-react'
import { useCommandPalette } from '@/components/layout/CommandPaletteContext'
import { useGlobalSearch } from '@/hooks/useGlobalSearch'
import {
  ADMIN_COMMAND_NAV,
  EMPLOYEE_COMMAND_NAV,
  filterCommandNav,
  type CommandNavItem,
} from '@/lib/commandNav'
import { ROLES, type Role } from '@/lib/constants'
import type { GlobalSearchResult } from '@/lib/globalSearch'
import { cn } from '@/lib/cn'

interface PaletteItem {
  key: string
  label: string
  subtitle?: string
  href: string
  icon: React.ReactNode
  section: 'navigation' | 'search'
}

function navToItem(item: CommandNavItem): PaletteItem {
  const Icon = item.icon
  return {
    key: `nav-${item.to}`,
    label: item.label,
    href: item.to,
    icon: <Icon className="h-4 w-4 shrink-0 text-slate-400" />,
    section: 'navigation',
  }
}

function searchToItem(result: GlobalSearchResult): PaletteItem {
  const icons = {
    employee: Users,
    department: Building2,
    leave: CalendarDays,
  } as const
  const Icon = icons[result.kind]
  return {
    key: `${result.kind}-${result.id}`,
    label: result.title,
    subtitle: result.subtitle,
    href: result.href,
    icon: <Icon className="h-4 w-4 shrink-0 text-slate-400" />,
    section: 'search',
  }
}

interface CommandPaletteProps {
  role: Role
}

export function CommandPalette({ role }: CommandPaletteProps) {
  const { open, setOpen, initialQuery } = useCommandPalette()
  const navigate = useNavigate()
  const inputRef = useRef<HTMLInputElement>(null)
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)

  const navItems = role === ROLES.ADMIN ? ADMIN_COMMAND_NAV : EMPLOYEE_COMMAND_NAV
  const { data: searchResults = [], isFetching } = useGlobalSearch(query, role, open)

  useEffect(() => {
    if (open) {
      setQuery(initialQuery)
      setActiveIndex(0)
      window.setTimeout(() => inputRef.current?.focus(), 0)
    }
  }, [open, initialQuery])

  const items = useMemo(() => {
    const trimmed = query.trim()
    const nav = filterCommandNav(navItems, trimmed).map(navToItem)
    const search = trimmed.length >= 2 ? searchResults.map(searchToItem) : []
    if (trimmed.length >= 2) return [...search, ...nav]
    return nav
  }, [query, navItems, searchResults])

  useEffect(() => {
    setActiveIndex(0)
  }, [query, items.length])

  const selectItem = (item: PaletteItem) => {
    setOpen(false)
    setQuery('')
    navigate(item.href)
  }

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex((i) => Math.min(i + 1, items.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Enter' && items[activeIndex]) {
      e.preventDefault()
      selectItem(items[activeIndex])
    }
  }

  if (!open) return null

  let lastSection: PaletteItem['section'] | null = null

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center glass-overlay p-4 pt-[12vh]">
      <button
        type="button"
        className="absolute inset-0"
        aria-label="Close command palette"
        onClick={() => setOpen(false)}
      />
      <div className="relative w-full max-w-xl overflow-hidden rounded-2xl glass-panel-strong shadow-2xl">
        <div className="flex items-center gap-3 border-b border-white/20 px-4 dark:border-white/10">
          <Search className="h-4 w-4 shrink-0 text-slate-400" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder={
              role === ROLES.ADMIN
                ? 'Search employees, departments, leaves, or jump to a page…'
                : 'Search leaves or jump to a page…'
            }
            className="h-12 flex-1 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400 dark:text-slate-100"
          />
          {isFetching && <Loader2 className="h-4 w-4 animate-spin text-slate-400" />}
          <kbd className="hidden rounded-md border border-slate-200 px-1.5 py-0.5 text-[10px] text-slate-400 sm:inline dark:border-slate-700">
            ESC
          </kbd>
        </div>

        <ul className="max-h-[min(60vh,420px)] overflow-y-auto p-2">
          {items.length === 0 ? (
            <li className="px-3 py-8 text-center text-sm text-slate-500">
              {query.trim().length >= 2 ? 'No results found' : 'Type to search or pick a destination'}
            </li>
          ) : (
            items.map((item, index) => {
              const showHeading = item.section !== lastSection
              lastSection = item.section
              return (
                <li key={item.key}>
                  {showHeading && (
                    <p className="px-3 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                      {item.section === 'search' ? 'Results' : 'Navigation'}
                    </p>
                  )}
                  <button
                    type="button"
                    onClick={() => selectItem(item)}
                    onMouseEnter={() => setActiveIndex(index)}
                    className={cn(
                      'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition',
                      index === activeIndex
                        ? 'glass-chip text-blue-900 dark:text-blue-100'
                        : 'glass-nav-hover text-slate-700 dark:text-slate-200',
                    )}
                  >
                    {item.icon}
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{item.label}</p>
                      {item.subtitle && (
                        <p className="truncate text-xs text-slate-500">{item.subtitle}</p>
                      )}
                    </div>
                  </button>
                </li>
              )
            })
          )}
        </ul>

        <div className="flex items-center justify-between border-t border-white/20 px-4 py-2 text-[11px] text-slate-400 dark:border-white/10">
          <span className="flex items-center gap-1">
            <Command className="h-3 w-3" />
            Navigate
          </span>
          <span>↑↓ select · Enter open · Esc close</span>
        </div>
      </div>
    </div>
  )
}
