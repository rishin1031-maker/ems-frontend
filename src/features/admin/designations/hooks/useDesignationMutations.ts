import { useMutation, useQueryClient } from '@tanstack/react-query'
import { adminDesignationsApi } from '@/api/admin/designations.api'
import type {
  CreateDesignationPayload,
  UpdateDesignationPayload,
} from '@/api/types/designation'

export function useDesignationMutations() {
  const queryClient = useQueryClient()

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['admin', 'designations'] })
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
    onSuccess: invalidate,
  })

  return { create, update, remove, toggleStatus }
}
