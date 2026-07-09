import { useState, type FormEvent, type KeyboardEvent } from 'react'
import { CheckSquare, Plus, Trash2, Circle, CheckCircle2 } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { PageLoader } from '@/components/ui/Spinner'
import { EmptyState } from '@/components/feedback/EmptyState'
import { useToast } from '@/components/feedback/ToastContext'
import {
  useDailyChecklist,
  useDailyChecklistMutations,
} from '@/features/employee/checklist/hooks/useDailyChecklist'
import { formatDate, todayISO } from '@/lib/format'
import { cn } from '@/lib/cn'
import type { DailyChecklistItem } from '@/api/types/checklist'

function ChecklistItemRow({
  item,
  onToggle,
  onDelete,
  busy,
}: {
  item: DailyChecklistItem
  onToggle: () => void
  onDelete: () => void
  busy?: boolean
}) {
  return (
    <li
      className={cn(
        'group flex items-center gap-3 rounded-xl px-3 py-3 transition',
        item.is_completed
          ? 'bg-emerald-50/50 dark:bg-emerald-950/20'
          : 'hover:bg-slate-50/80 dark:hover:bg-slate-800/40',
      )}
    >
      <button
        type="button"
        onClick={onToggle}
        disabled={busy}
        className="shrink-0 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
        aria-label={item.is_completed ? 'Mark incomplete' : 'Mark complete'}
      >
        {item.is_completed ? (
          <CheckCircle2 className="h-6 w-6 text-emerald-500" />
        ) : (
          <Circle className="h-6 w-6 text-slate-300 transition group-hover:text-sky-500 dark:text-slate-600" />
        )}
      </button>

      <span
        className={cn(
          'min-w-0 flex-1 text-sm',
          item.is_completed
            ? 'text-slate-400 line-through dark:text-slate-500'
            : 'font-medium text-slate-800 dark:text-slate-100',
        )}
      >
        {item.title}
      </span>

      <button
        type="button"
        onClick={onDelete}
        disabled={busy}
        className="shrink-0 rounded-lg p-1.5 text-slate-300 opacity-0 transition hover:bg-red-50 hover:text-red-500 group-hover:opacity-100 focus:opacity-100 focus:outline-none dark:hover:bg-red-950/30"
        aria-label="Delete task"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </li>
  )
}

export function DailyChecklistPage() {
  const [date, setDate] = useState(todayISO())
  const [title, setTitle] = useState('')
  const { data, isLoading } = useDailyChecklist(date)
  const { create, toggle, remove } = useDailyChecklistMutations(date)
  const { success, error: toastError } = useToast()

  const items = data?.items ?? []
  const total = data?.total ?? 0
  const completed = data?.completed ?? 0
  const isToday = date === todayISO()

  const handleAdd = async (e?: FormEvent) => {
    e?.preventDefault()
    const trimmed = title.trim()
    if (!trimmed) return

    try {
      await create.mutateAsync({ title: trimmed, task_date: date })
      setTitle('')
      success('Task added')
    } catch (err) {
      toastError((err as Error).message ?? 'Failed to add task')
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      void handleAdd()
    }
  }

  const handleToggle = async (id: number) => {
    try {
      await toggle.mutateAsync(id)
    } catch (err) {
      toastError((err as Error).message ?? 'Failed to update task')
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await remove.mutateAsync(id)
      success('Task removed')
    } catch (err) {
      toastError((err as Error).message ?? 'Failed to remove task')
    }
  }

  return (
    <div>
      <PageHeader
        title="Daily Checklist"
        description="Add your tasks for the day and tick them off as you go"
        actions={
          <Input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-auto"
            aria-label="Checklist date"
          />
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <Card className="px-5 py-4">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-400">Date</p>
          <p className="mt-1 text-lg font-semibold text-slate-900 dark:text-slate-100">
            {formatDate(date)}
            {isToday && (
              <span className="ml-2 text-xs font-medium text-sky-600 dark:text-sky-400">Today</span>
            )}
          </p>
        </Card>
        <Card className="px-5 py-4">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-400">Completed</p>
          <p className="mt-1 text-lg font-semibold text-emerald-600 dark:text-emerald-400">
            {completed} / {total}
          </p>
        </Card>
        <Card className="px-5 py-4">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-400">Progress</p>
          <div className="mt-2">
            <ProgressBar value={completed} max={Math.max(total, 1)} showTimer={false} />
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader className="border-b border-slate-100 pb-4 dark:border-slate-800">
          <CardTitle className="flex items-center gap-2 text-base">
            <CheckSquare className="h-5 w-5 text-sky-600" />
            Tasks
          </CardTitle>
        </CardHeader>

        <form onSubmit={(e) => void handleAdd(e)} className="mb-4 flex gap-2">
          <div className="min-w-0 flex-1">
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Add a task for this day…"
              maxLength={255}
              aria-label="New task title"
            />
          </div>
          <Button
            type="submit"
            theme="employee"
            loading={create.isPending}
            disabled={!title.trim()}
          >
            <Plus className="mr-1.5 h-4 w-4" />
            Add
          </Button>
        </form>

        {isLoading ? (
          <PageLoader />
        ) : items.length === 0 ? (
          <EmptyState
            title="No tasks yet"
            description="Add your first task above to start today’s checklist."
          />
        ) : (
          <ul className="divide-y divide-slate-100 dark:divide-slate-800">
            {items.map((item) => (
              <ChecklistItemRow
                key={item.id}
                item={item}
                busy={toggle.isPending || remove.isPending}
                onToggle={() => void handleToggle(item.id)}
                onDelete={() => void handleDelete(item.id)}
              />
            ))}
          </ul>
        )}
      </Card>
    </div>
  )
}
