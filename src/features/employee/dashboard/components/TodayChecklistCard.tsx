import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { CheckCircle2, Circle, Plus, Trash2 } from 'lucide-react'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { PageLoader } from '@/components/ui/Spinner'
import { useToast } from '@/components/feedback/ToastContext'
import {
  useDailyChecklist,
  useDailyChecklistMutations,
} from '@/features/employee/checklist/hooks/useDailyChecklist'
import { todayISO } from '@/lib/format'
import { cn } from '@/lib/cn'
import type { DailyChecklistItem } from '@/api/types/checklist'

function DashboardTaskRow({
  item,
  onToggle,
  onDelete,
}: {
  item: DailyChecklistItem
  onToggle: () => void
  onDelete: () => void
}) {
  return (
    <li
      className={cn(
        'group flex items-center gap-2 rounded-lg px-2 py-1.5',
        item.is_completed && 'opacity-70',
      )}
    >
      <button
        type="button"
        onClick={onToggle}
        className="shrink-0 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
        aria-label={item.is_completed ? 'Mark incomplete' : 'Mark complete'}
      >
        {item.is_completed ? (
          <CheckCircle2 className="h-5 w-5 text-emerald-500" />
        ) : (
          <Circle className="h-5 w-5 text-slate-300 transition hover:text-sky-500 dark:text-slate-600" />
        )}
      </button>
      <span
        className={cn(
          'min-w-0 flex-1 truncate text-sm',
          item.is_completed
            ? 'text-slate-400 line-through dark:text-slate-500'
            : 'text-slate-700 dark:text-slate-200',
        )}
      >
        {item.title}
      </span>
      <button
        type="button"
        onClick={onDelete}
        className="shrink-0 rounded p-1 text-slate-300 opacity-0 transition hover:text-red-500 group-hover:opacity-100 focus:opacity-100"
        aria-label="Delete task"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </li>
  )
}

export function TodayChecklistCard() {
  const date = todayISO()
  const [title, setTitle] = useState('')
  const { data, isLoading } = useDailyChecklist(date)
  const { create, toggle, remove } = useDailyChecklistMutations(date)
  const { success, error: toastError } = useToast()

  const items = data?.items ?? []
  const total = data?.total ?? 0
  const completed = data?.completed ?? 0

  const handleAdd = async (e: FormEvent) => {
    e.preventDefault()
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
    <Card>
      <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
        <div>
          <CardTitle className="text-base font-semibold">Today&apos;s checklist</CardTitle>
          <p className="text-xs text-slate-500">
            {completed}/{total || 0} completed
          </p>
        </div>
        <Link to="/employee/checklist" className="text-xs font-medium text-sky-600 hover:underline">
          View all
        </Link>
      </CardHeader>

      {total > 0 && (
        <ProgressBar
          value={completed}
          max={Math.max(total, 1)}
          showTimer={false}
          completeClass="bg-emerald-500"
          className="mb-3"
        />
      )}

      {isLoading ? (
        <PageLoader />
      ) : (
        <>
          {items.length > 0 ? (
            <ul className="mb-3 max-h-56 space-y-0.5 overflow-y-auto">
              {items.map((item) => (
                <DashboardTaskRow
                  key={item.id}
                  item={item}
                  onToggle={() => void handleToggle(item.id)}
                  onDelete={() => void handleDelete(item.id)}
                />
              ))}
            </ul>
          ) : (
            <p className="mb-3 text-sm text-slate-500">No tasks yet — add one below.</p>
          )}

          <form onSubmit={(e) => void handleAdd(e)} className="flex gap-2">
            <div className="min-w-0 flex-1">
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Add a task for today…"
                maxLength={255}
                className="h-9"
              />
            </div>
            <Button
              type="submit"
              size="sm"
              theme="employee"
              loading={create.isPending}
              disabled={!title.trim()}
            >
              <Plus className="mr-1 h-4 w-4" />
              Add
            </Button>
          </form>
        </>
      )}
    </Card>
  )
}
