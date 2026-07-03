import { useQuery } from '@tanstack/react-query'
import { adminEmployeesApi } from '@/api/admin/employees.api'
import type { EmployeeListParams } from '@/api/types/employee'

export function useEmployees(params: EmployeeListParams) {
  return useQuery({
    queryKey: ['admin', 'employees', params],
    queryFn: () => adminEmployeesApi.list(params),
  })
}

export function useEmployee(id: number | string | undefined) {
  return useQuery({
    queryKey: ['admin', 'employees', id],
    queryFn: () => adminEmployeesApi.get(id!),
    enabled: Boolean(id),
  })
}
