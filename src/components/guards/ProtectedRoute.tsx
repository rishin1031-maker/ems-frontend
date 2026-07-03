import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuthContext } from '@/context/AuthContext'
import { PageLoader } from '@/components/ui/Spinner'
import { ROLES } from '@/lib/constants'

export function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuthContext()
  const location = useLocation()

  if (isLoading) return <PageLoader />

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <Outlet />
}

export function AdminRoute() {
  const { role, isLoading } = useAuthContext()

  if (isLoading) return <PageLoader />

  if (role !== ROLES.ADMIN) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}

export function EmployeeRoute() {
  const { role, mustChangePassword, isLoading } = useAuthContext()
  const location = useLocation()

  if (isLoading) return <PageLoader />

  if (role !== ROLES.EMPLOYEE) {
    return <Navigate to="/login" replace />
  }

  const isChangePasswordRoute = location.pathname.startsWith('/employee/change-password')

  if (mustChangePassword && !isChangePasswordRoute) {
    return <Navigate to="/employee/change-password" replace />
  }

  return <Outlet />
}

export function GuestRoute() {
  const { isAuthenticated, role, mustChangePassword, isLoading } = useAuthContext()

  if (isLoading) return <PageLoader />

  if (isAuthenticated) {
    if (role === ROLES.ADMIN) {
      return <Navigate to="/admin/dashboard" replace />
    }
    if (mustChangePassword) {
      return <Navigate to="/employee/change-password" replace />
    }
    return <Navigate to="/employee/dashboard" replace />
  }

  return <Outlet />
}
