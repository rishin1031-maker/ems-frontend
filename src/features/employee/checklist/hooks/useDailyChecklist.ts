import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { employeeChecklistApi } from '@/api/employee/checklist.api'
import type { CreateChecklistItemPayload, UpdateChecklistItemPayload } from '@/api/types/checklist'

export function useDailyChecklist(date?: string) {
  return useQuery({
    queryKey: ['employee', 'checklist', date ?? 'today'],
    queryFn: () => employeeChecklistApi.list(date ? { date } : undefined),
  })
}

export function useDailyChecklistMutations(date?: string) {
  const qc = useQueryClient()
  const key = ['employee', 'checklist', date ?? 'today'] as const

  const invalidate = () => {
    void qc.invalidateQueries({ queryKey: ['employee', 'checklist'] })
  }

  const create = useMutation({
    mutationFn: (payload: CreateChecklistItemPayload) => employeeChecklistApi.create(payload),
    onSuccess: invalidate,
  })

  const update = useMutation({
    mutationFn: ({ id, payload }: { id: number | string; payload: UpdateChecklistItemPayload }) =>
      employeeChecklistApi.update(id, payload),
    onSuccess: invalidate,
  })

  const toggle = useMutation({
    mutationFn: (id: number | string) => employeeChecklistApi.toggle(id),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: key })
      const previous = qc.getQueryData(key)
      qc.setQueryData(key, (old: Awaited<ReturnType<typeof employeeChecklistApi.list>> | undefined) => {
        if (!old) return old
        const items = old.items.map((item) =>
          item.id === Number(id)
            ? {
                ...item,
                is_completed: !item.is_completed,
                completed_at: !item.is_completed ? new Date().toISOString() : null,
              }
            : item,
        )
        const completed = items.filter((i) => i.is_completed).length
        return {
          ...old,
          items,
          completed,
          pending: items.length - completed,
          total: items.length,
        }
      })
      return { previous }
    },
    onError: (_err, _id, context) => {
      if (context?.previous) qc.setQueryData(key, context.previous)
    },
    onSettled: invalidate,
  })

  const remove = useMutation({
    mutationFn: (id: number | string) => employeeChecklistApi.remove(id),
    onSuccess: invalidate,
  })

  return { create, update, toggle, remove }
}
