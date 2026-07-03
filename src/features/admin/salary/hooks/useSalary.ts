import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminSalaryApi, adminPayrollApi } from '@/api/admin/salary.api'
import type { SalaryListParams, UpdateSalaryPayload, PayrollParams } from '@/api/types/salary'

export function useSalaryList(params: SalaryListParams) {
  return useQuery({
    queryKey: ['admin', 'salary', params],
    queryFn: () => adminSalaryApi.list(params),
  })
}

export function useEmployeeSalary(employeeId: number | string | undefined) {
  return useQuery({
    queryKey: ['admin', 'salary', employeeId],
    queryFn: () => adminSalaryApi.get(employeeId!),
    enabled: Boolean(employeeId),
  })
}

export function useSalaryMutations() {
  const qc = useQueryClient()
  const invalidate = () => qc.invalidateQueries({ queryKey: ['admin', 'salary'] })

  const update = useMutation({
    mutationFn: ({ employeeId, payload }: { employeeId: number | string; payload: UpdateSalaryPayload }) =>
      adminSalaryApi.update(employeeId, payload),
    onSuccess: invalidate,
  })

  return { update }
}

export function usePayroll(params: PayrollParams) {
  return useQuery({
    queryKey: ['admin', 'payroll', params],
    queryFn: () => adminPayrollApi.get(params),
  })
}
