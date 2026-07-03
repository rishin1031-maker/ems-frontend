import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { employeeProfileApi } from '@/api/employee/profile.api'
import type { UpdatePhonePayload } from '@/api/employee/profile.api'
import { useAuth } from '@/features/auth/hooks/useAuth'

export function useEmployeeProfile() {
  return useQuery({
    queryKey: ['employee', 'profile'],
    queryFn: employeeProfileApi.get,
  })
}

export function useProfileMutations() {
  const qc = useQueryClient()
  const { updateUser } = useAuth()

  const updatePhone = useMutation({
    mutationFn: (payload: UpdatePhonePayload) => employeeProfileApi.updatePhone(payload),
    onSuccess: (user) => {
      updateUser(user)
      qc.invalidateQueries({ queryKey: ['employee', 'profile'] })
    },
  })

  return { updatePhone }
}
