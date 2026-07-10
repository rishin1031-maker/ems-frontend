import { useOptimistic, useTransition } from 'react'
import { useDailyChecklist, useDailyChecklistMutations } from '@/features/employee/checklist/hooks/useDailyChecklist'
import type { DailyChecklistItem } from '@/api/types/checklist'
import { todayISO } from '@/lib/format'

type ChecklistAction =
  | { type: 'toggle'; id: number; is_completed: boolean }
  | { type: 'delete'; id: number }
  | { type: 'add'; title: string; task_date: string; tempId: number }

function reduceChecklist(current: DailyChecklistItem[], action: ChecklistAction): DailyChecklistItem[] {
  switch (action.type) {
    case 'toggle':
      return current.map((item) =>
        item.id === action.id
          ? {
              ...item,
              is_completed: action.is_completed,
              completed_at: action.is_completed ? (item.completed_at ?? new Date().toISOString()) : null,
            }
          : item,
      )
    case 'delete':
      return current.filter((item) => item.id !== action.id)
    case 'add':
      return [
        ...current,
        {
          id: action.tempId,
          employee_id: 0,
          task_date: action.task_date,
          title: action.title,
          is_completed: false,
          completed_at: null,
          sort_order: current.length + 1,
        },
      ]
    default:
      return current
  }
}

export function useOptimisticChecklist(date?: string) {
  const taskDate = date ?? todayISO()
  const { data, isLoading } = useDailyChecklist(taskDate)
  const { create, toggle, remove } = useDailyChecklistMutations(taskDate)
  const [, startTransition] = useTransition()

  const serverItems = data?.items ?? []
  const [optimisticItems, addOptimistic] = useOptimistic(serverItems, reduceChecklist)

  const completed = optimisticItems.filter((i) => i.is_completed).length
  const total = optimisticItems.length

  const addTask = (title: string) =>
    new Promise<void>((resolve, reject) => {
      const trimmed = title.trim()
      if (!trimmed) {
        resolve()
        return
      }
      const tempId = -Date.now()
      startTransition(async () => {
        addOptimistic({ type: 'add', title: trimmed, task_date: taskDate, tempId })
        try {
          await create.mutateAsync({ title: trimmed, task_date: taskDate })
          resolve()
        } catch (err) {
          reject(err)
        }
      })
    })

  const toggleTask = (id: number) =>
    new Promise<void>((resolve, reject) => {
      if (id < 0) {
        resolve()
        return
      }
      const current = serverItems.find((item) => item.id === id)
      const nextCompleted = !(current?.is_completed ?? false)
      startTransition(async () => {
        addOptimistic({ type: 'toggle', id, is_completed: nextCompleted })
        try {
          await toggle.mutateAsync(id)
          resolve()
        } catch (err) {
          reject(err)
        }
      })
    })

  const deleteTask = (id: number) =>
    new Promise<void>((resolve, reject) => {
      if (id < 0) {
        resolve()
        return
      }
      startTransition(async () => {
        addOptimistic({ type: 'delete', id })
        try {
          await remove.mutateAsync(id)
          resolve()
        } catch (err) {
          reject(err)
        }
      })
    })

  return {
    items: optimisticItems,
    completed,
    total,
    isLoading,
    isMutating: create.isPending || toggle.isPending || remove.isPending,
    addTask,
    toggleTask,
    deleteTask,
  }
}
