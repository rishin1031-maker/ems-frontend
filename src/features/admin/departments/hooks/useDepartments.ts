import { useQuery } from '@tanstack/react-query'
import { adminDepartmentsApi } from '@/api/admin/departments.api'

/** Active departments for dropdowns */
export function useDepartmentOptions() {
  return useQuery({
    queryKey: ['admin', 'departments', 'options'],
    queryFn: () => adminDepartmentsApi.list({ per_page: 100, status: 'active' }),
    staleTime: 60_000,
  })
}

export function useDepartments(params: { page?: number; search?: string; status?: string }) {
  return useQuery({
    queryKey: ['admin', 'departments', params],
    queryFn: () => adminDepartmentsApi.list(params),
  })
}
