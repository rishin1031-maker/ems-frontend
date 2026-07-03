import { Navigate } from 'react-router-dom'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { PageLoader } from '@/components/ui/Spinner'
import { ROLES } from '@/lib/constants'

export function RootRedirect() {
  const { isAuthenticated, role, mustChangePassword, isLoading } = useAuth()

  if (isLoading) return <PageLoader />

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (role === ROLES.ADMIN) {
    return <Navigate to="/admin/dashboard" replace />
  }

  if (mustChangePassword) {
    return <Navigate to="/employee/change-password" replace />
  }

  return <Navigate to="/employee/dashboard" replace />
}
