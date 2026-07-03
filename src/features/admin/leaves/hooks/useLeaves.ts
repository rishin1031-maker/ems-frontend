import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { adminLeavesApi } from '@/api/admin/leaves.api'
import type { CreateLeavePayload, LeaveActionPayload, LeaveListParams } from '@/api/types/leave'

export function useLeaves(params: LeaveListParams) {
  return useQuery({
    queryKey: ['admin', 'leaves', params],
    queryFn: () => adminLeavesApi.list(params),
  })
}

export function useLeave(id: number | string | undefined) {
  return useQuery({
    queryKey: ['admin', 'leaves', id],
    queryFn: () => adminLeavesApi.get(id!),
    enabled: Boolean(id),
  })
}

export function useLeaveMutations() {
  const qc = useQueryClient()
  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['admin', 'leaves'] })
    qc.invalidateQueries({ queryKey: ['admin', 'dashboard'] })
  }

  const create = useMutation({
    mutationFn: (payload: CreateLeavePayload) => adminLeavesApi.create(payload),
    onSuccess: invalidate,
  })

  const approve = useMutation({
    mutationFn: ({ id, payload }: { id: number | string; payload?: LeaveActionPayload }) =>
      adminLeavesApi.approve(id, payload),
    onSuccess: invalidate,
  })

  const reject = useMutation({
    mutationFn: ({ id, payload }: { id: number | string; payload?: LeaveActionPayload }) =>
      adminLeavesApi.reject(id, payload),
    onSuccess: invalidate,
  })

  return { create, approve, reject }
}
