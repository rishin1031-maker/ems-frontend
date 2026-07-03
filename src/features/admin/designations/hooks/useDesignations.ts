import { useQuery } from '@tanstack/react-query'
import { adminDesignationsApi } from '@/api/admin/designations.api'

/** Active designations for dropdowns */
export function useDesignationOptions() {
  return useQuery({
    queryKey: ['admin', 'designations', 'options'],
    queryFn: () => adminDesignationsApi.list({ per_page: 100, status: 'active' }),
    staleTime: 60_000,
  })
}

export function useDesignations(params: { page?: number; search?: string; status?: string }) {
  return useQuery({
    queryKey: ['admin', 'designations', params],
    queryFn: () => adminDesignationsApi.list(params),
  })
}
