import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminSalaryApi, adminPayrollApi } from '@/api/admin/salary.api'
import { useToast } from '@/components/feedback/ToastContext'
import type { SalaryListParams, UpdateSalaryPayload, PayrollParams } from '@/api/types/salary'

export function useSalaryList(params: SalaryListParams, enabled = true) {
  return useQuery({
    queryKey: ['admin', 'salary', params],
    queryFn: () => adminSalaryApi.list(params),
    enabled,
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
  const { success, error: toastError } = useToast()

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['admin', 'salary'] })
    qc.invalidateQueries({ queryKey: ['admin', 'payroll'] })
  }

  const update = useMutation({
    mutationFn: ({ employeeId, payload }: { employeeId: number | string; payload: UpdateSalaryPayload }) =>
      adminSalaryApi.update(employeeId, payload),
    onSuccess: () => {
      invalidate()
      success('Salary saved — payroll will reflect the update')
    },
    onError: (err: Error) => toastError(err.message ?? 'Failed to save salary'),
  })

  return { update }
}

export function usePayroll(params: PayrollParams) {
  return useQuery({
    queryKey: ['admin', 'payroll', params],
    queryFn: () => adminPayrollApi.get(params),
  })
}
