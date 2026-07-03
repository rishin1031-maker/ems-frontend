import { useMutation, useQueryClient } from '@tanstack/react-query'
import { adminEmployeesApi } from '@/api/admin/employees.api'
import type {
  CreateEmployeePayload,
  ResetPasswordPayload,
  UpdateEmployeePayload,
} from '@/api/types/employee'

export function useEmployeeMutations() {
  const queryClient = useQueryClient()

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['admin', 'employees'] })
    queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard'] })
  }

  const create = useMutation({
    mutationFn: (payload: CreateEmployeePayload) => adminEmployeesApi.create(payload),
    onSuccess: invalidate,
  })

  const update = useMutation({
    mutationFn: ({ id, payload }: { id: number | string; payload: UpdateEmployeePayload }) =>
      adminEmployeesApi.update(id, payload),
    onSuccess: invalidate,
  })

  const remove = useMutation({
    mutationFn: (id: number | string) => adminEmployeesApi.delete(id),
    onSuccess: invalidate,
  })

  const resetPassword = useMutation({
    mutationFn: ({ id, payload }: { id: number | string; payload: ResetPasswordPayload }) =>
      adminEmployeesApi.resetPassword(id, payload),
  })

  return { create, update, remove, resetPassword }
}
