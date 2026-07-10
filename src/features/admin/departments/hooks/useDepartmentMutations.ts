import { useMutation, useQueryClient } from '@tanstack/react-query'
import { adminDepartmentsApi } from '@/api/admin/departments.api'
import type {
  CreateDepartmentPayload,
  Department,
  DepartmentListResponse,
  UpdateDepartmentPayload,
} from '@/api/types/department'

function flipStatus(status: Department['status']): Department['status'] {
  return status === 'active' ? 'inactive' : 'active'
}

function patchDepartmentInLists(
  queryClient: ReturnType<typeof useQueryClient>,
  id: number,
  patch: (dept: Department) => Department,
) {
  queryClient.setQueriesData<DepartmentListResponse>(
    { queryKey: ['admin', 'departments'] },
    (old) => {
      if (!old?.items) return old
      return {
        ...old,
        items: old.items.map((dept) => (dept.id === id ? patch(dept) : dept)),
      }
    },
  )
}

export function useDepartmentMutations() {
  const queryClient = useQueryClient()

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ['admin', 'departments'] })
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
    onMutate: async (id) => {
      const numericId = Number(id)
      await queryClient.cancelQueries({ queryKey: ['admin', 'departments'] })
      const previous = queryClient.getQueriesData<DepartmentListResponse>({
        queryKey: ['admin', 'departments'],
      })

      // Keep React Query cache in sync with useOptimistic so the UI does not
      // flash back to the old status when the transition ends.
      patchDepartmentInLists(queryClient, numericId, (dept) => ({
        ...dept,
        status: flipStatus(dept.status),
      }))

      return { previous }
    },
    onError: (_err, _id, context) => {
      context?.previous.forEach(([key, data]) => {
        queryClient.setQueryData(key, data)
      })
    },
    onSuccess: (updated) => {
      if (updated?.id != null) {
        patchDepartmentInLists(queryClient, updated.id, (dept) => ({
          ...dept,
          ...updated,
          status: updated.status ?? dept.status,
        }))
      }
    },
    onSettled: invalidate,
  })

  return { create, update, remove, toggleStatus }
}
