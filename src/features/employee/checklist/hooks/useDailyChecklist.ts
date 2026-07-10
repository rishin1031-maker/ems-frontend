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
    onSettled: invalidate,
  })

  const remove = useMutation({
    mutationFn: (id: number | string) => employeeChecklistApi.remove(id),
    onSuccess: invalidate,
  })

  return { create, update, toggle, remove }
}
