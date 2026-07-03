import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import type { PaginationMeta } from '@/api/types/common'

interface PaginationProps {
  meta: PaginationMeta
  onPageChange: (page: number) => void
}

export function Pagination({ meta, onPageChange }: PaginationProps) {
  const { current_page, last_page, total, per_page } = meta

  if (last_page <= 1) return null

  const from = (current_page - 1) * per_page + 1
  const to = Math.min(current_page * per_page, total)

  return (
    <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Showing {from}–{to} of {total}
      </p>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={current_page <= 1}
          onClick={() => onPageChange(current_page - 1)}
          theme="admin"
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Button>
        <span className="text-sm text-gray-600 dark:text-gray-400">
          Page {current_page} of {last_page}
        </span>
        <Button
          variant="outline"
          size="sm"
          disabled={current_page >= last_page}
          onClick={() => onPageChange(current_page + 1)}
          theme="admin"
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
