import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Building2, CalendarDays, Loader2, Search, Users } from 'lucide-react'
import { useCommandPalette } from '@/components/layout/CommandPaletteContext'
import { useGlobalSearch } from '@/hooks/useGlobalSearch'
import { ROLES, type Role } from '@/lib/constants'
import type { GlobalSearchResult, GlobalSearchResultKind } from '@/lib/globalSearch'
import { cn } from '@/lib/cn'

const KIND_ICONS: Record<GlobalSearchResultKind, typeof Users> = {
  employee: Users,
  department: Building2,
  leave: CalendarDays,
}

const KIND_LABELS: Record<GlobalSearchResultKind, string> = {
  employee: 'Employees',
  department: 'Departments',
  leave: 'Leave requests',
}

interface GlobalSearchInputProps {
  role: Role
  theme?: 'admin' | 'employee'
}

export function GlobalSearchInput({ role, theme = 'admin' }: GlobalSearchInputProps) {
  const navigate = useNavigate()
  const { openWithQuery } = useCommandPalette()
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  const { data: results = [], isFetching } = useGlobalSearch(query, role, open && query.trim().length >= 2)

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  useEffect(() => {
    setActiveIndex(0)
  }, [query, results.length])

  const selectResult = (result: GlobalSearchResult) => {
    navigate(result.href)
    setQuery('')
    setOpen(false)
  }

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault()
      openWithQuery(query)
      setOpen(false)
      return
    }
    if (e.key === 'Escape') {
      setOpen(false)
      return
    }
    if (e.key === 'ArrowDown' && results.length > 0) {
      e.preventDefault()
      setActiveIndex((i) => Math.min(i + 1, results.length - 1))
    } else if (e.key === 'ArrowUp' && results.length > 0) {
      e.preventDefault()
      setActiveIndex((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Enter') {
      if (results[activeIndex]) {
        e.preventDefault()
        selectResult(results[activeIndex])
      } else if (query.trim()) {
        openWithQuery(query.trim())
        setOpen(false)
      }
    }
  }

  const focusRing = theme === 'admin' ? 'focus:ring-blue-500/20 focus:border-blue-500' : 'focus:ring-sky-500/20 focus:border-sky-500'
  const showDropdown = open && query.trim().length >= 2

  const grouped = results.reduce<Partial<Record<GlobalSearchResultKind, GlobalSearchResult[]>>>((acc, r) => {
    acc[r.kind] = acc[r.kind] ?? []
    acc[r.kind]!.push(r)
    return acc
  }, {})

  let flatIndex = -1

  return (
    <div ref={containerRef} className="relative w-full">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      <input
        type="search"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value)
          setOpen(true)
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={onKeyDown}
        placeholder={
          role === ROLES.ADMIN
            ? 'Search employees, departments, leaves…'
            : 'Search your leaves…'
        }
        className={cn(
          'h-10 w-full rounded-xl glass-input pl-10 pr-20 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 dark:text-slate-100',
          focusRing,
        )}
      />
      <kbd className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 rounded-md border border-slate-200 px-1.5 py-0.5 text-[10px] text-slate-400 sm:inline dark:border-slate-700">
        ⌘K
      </kbd>

      {showDropdown && (
        <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-50 overflow-hidden rounded-xl glass-panel-strong shadow-xl">
          {isFetching && results.length === 0 ? (
            <div className="flex items-center justify-center gap-2 px-4 py-6 text-sm text-slate-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              Searching…
            </div>
          ) : results.length === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-slate-500">No results for &ldquo;{query}&rdquo;</p>
          ) : (
            <ul className="max-h-72 overflow-y-auto p-1.5">
              {(Object.keys(grouped) as GlobalSearchResultKind[]).map((kind) => (
                <li key={kind}>
                  <p className="px-3 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                    {KIND_LABELS[kind]}
                  </p>
                  {grouped[kind]!.map((result) => {
                    flatIndex += 1
                    const idx = flatIndex
                    const Icon = KIND_ICONS[kind]
                    return (
                      <button
                        key={`${kind}-${result.id}`}
                        type="button"
                        onMouseEnter={() => setActiveIndex(idx)}
                        onClick={() => selectResult(result)}
                        className={cn(
                          'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition',
                          idx === activeIndex
                            ? 'glass-chip text-blue-900 dark:text-blue-100'
                            : 'glass-nav-hover text-slate-700 dark:text-slate-200',
                        )}
                      >
                        <Icon className="h-4 w-4 shrink-0 text-slate-400" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-medium">{result.title}</p>
                          <p className="truncate text-xs text-slate-500">{result.subtitle}</p>
                        </div>
                      </button>
                    )
                  })}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
