import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { searchGlobal, type GlobalSearchResult } from '@/lib/globalSearch'
import type { Role } from '@/lib/constants'

export function useGlobalSearch(query: string, role: Role, enabled = true) {
  const [debounced, setDebounced] = useState(query)

  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(query), 250)
    return () => window.clearTimeout(timer)
  }, [query])

  return useQuery<GlobalSearchResult[]>({
    queryKey: ['global-search', role, debounced],
    queryFn: () => searchGlobal(debounced, role),
    enabled: enabled && debounced.trim().length >= 2,
    staleTime: 30_000,
    placeholderData: (prev) => prev,
  })
}
