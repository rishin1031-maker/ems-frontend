import { useMutation, useQueryClient } from '@tanstack/react-query'
import { adminDesignationsApi } from '@/api/admin/designations.api'
import type {
  CreateDesignationPayload,
  Designation,
  DesignationListResponse,
  UpdateDesignationPayload,
} from '@/api/types/designation'

function flipStatus(status: Designation['status']): Designation['status'] {
  return status === 'active' ? 'inactive' : 'active'
}

function patchDesignationInLists(
  queryClient: ReturnType<typeof useQueryClient>,
  id: number,
  patch: (item: Designation) => Designation,
) {
  queryClient.setQueriesData<DesignationListResponse>(
    { queryKey: ['admin', 'designations'] },
    (old) => {
      if (!old?.items) return old
      return {
        ...old,
        items: old.items.map((item) => (item.id === id ? patch(item) : item)),
      }
    },
  )
}

export function useDesignationMutations() {
  const queryClient = useQueryClient()

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ['admin', 'designations'] })
  }

  const create = useMutation({
    mutationFn: (payload: CreateDesignationPayload) => adminDesignationsApi.create(payload),
    onSuccess: invalidate,
  })

  const update = useMutation({
    mutationFn: ({ id, payload }: { id: number | string; payload: UpdateDesignationPayload }) =>
      adminDesignationsApi.update(id, payload),
    onSuccess: invalidate,
  })

  const remove = useMutation({
    mutationFn: (id: number | string) => adminDesignationsApi.delete(id),
    onSuccess: invalidate,
  })

  const toggleStatus = useMutation({
    mutationFn: (id: number | string) => adminDesignationsApi.toggleStatus(id),
    onMutate: async (id) => {
      const numericId = Number(id)
      await queryClient.cancelQueries({ queryKey: ['admin', 'designations'] })
      const previous = queryClient.getQueriesData<DesignationListResponse>({
        queryKey: ['admin', 'designations'],
      })

      patchDesignationInLists(queryClient, numericId, (item) => ({
        ...item,
        status: flipStatus(item.status),
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
        patchDesignationInLists(queryClient, updated.id, (item) => ({
          ...item,
          ...updated,
          status: updated.status ?? item.status,
        }))
      }
    },
    onSettled: invalidate,
  })

  return { create, update, remove, toggleStatus }
}
