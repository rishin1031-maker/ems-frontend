import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { employeeLeavesApi } from '@/api/employee/leaves.api'
import type { ApplyLeavePayload, EmployeeLeaveListParams } from '@/api/employee/leaves.api'

export function useEmployeeLeaves(params: EmployeeLeaveListParams) {
  return useQuery({
    queryKey: ['employee', 'leaves', params],
    queryFn: async () => {
      const result = await employeeLeavesApi.list(params)
      return {
        items: result.leaves.items,
        meta: result.leaves.meta,
        balance: result.balance,
      }
    },
  })
}

export function useLeaveBalance() {
  return useQuery({
    queryKey: ['employee', 'leaves', 'balance'],
    queryFn: employeeLeavesApi.balance,
  })
}

export function useEmployeeLeave(id: number | string | undefined) {
  return useQuery({
    queryKey: ['employee', 'leaves', id],
    queryFn: () => employeeLeavesApi.get(id!),
    enabled: Boolean(id),
  })
}

export function useEmployeeLeaveMutations() {
  const qc = useQueryClient()

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['employee', 'leaves'] })
    qc.invalidateQueries({ queryKey: ['employee', 'dashboard'] })
  }

  const apply = useMutation({
    mutationFn: (payload: ApplyLeavePayload) => employeeLeavesApi.apply(payload),
    onSuccess: invalidate,
  })

  const cancel = useMutation({
    mutationFn: (id: number | string) => employeeLeavesApi.cancel(id),
    onSuccess: invalidate,
  })

  return { apply, cancel }
}
