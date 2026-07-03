import { useMutation, useQueryClient } from '@tanstack/react-query'
import { adminDepartmentsApi } from '@/api/admin/departments.api'
import type {
  CreateDepartmentPayload,
  UpdateDepartmentPayload,
} from '@/api/types/department'

export function useDepartmentMutations() {
  const queryClient = useQueryClient()

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['admin', 'departments'] })
  }

  const create = useMutation({
    mutationFn: (payload: CreateDepartmentPayload) => adminDepartmentsApi.create(payload),
    onSuccess: invalidate,
  })

  const update = useMutation({
    mutationFn: ({ id, payload }: { id: number | string; payload: UpdateDepartmentPayload }) =>
      adminDepartmentsApi.update(id, payload),
    onSuccess: invalidate,
  })

  const remove = useMutation({
    mutationFn: (id: number | string) => adminDepartmentsApi.delete(id),
    onSuccess: invalidate,
  })

  const toggleStatus = useMutation({
    mutationFn: (id: number | string) => adminDepartmentsApi.toggleStatus(id),
    onSuccess: invalidate,
  })

  return { create, update, remove, toggleStatus }
}
