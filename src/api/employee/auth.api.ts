import {
  apiPost,
  apiPostRaw,
  apiGet,
  persistLogin,
} from '@/api/client'
import type {
  ChangePasswordRequest,
  EmployeeLoginRequest,
  AuthUser,
  LoginPayload,
} from '@/api/types/common'
import { ROLES } from '@/lib/constants'

export const employeeAuthApi = {
  login: (payload: EmployeeLoginRequest) =>
    apiPostRaw<LoginPayload>('/employee/auth/login', payload),

  me: () => apiGet<AuthUser>('/employee/auth/me'),

  refresh: () => apiPost<LoginPayload>('/employee/auth/refresh'),

  logout: () => apiPost<null>('/employee/auth/logout'),

  changePassword: (payload: ChangePasswordRequest) =>
    apiPost<null>('/employee/auth/change-password', payload),

  persistSession: (payload: LoginPayload) =>
    persistLogin(ROLES.EMPLOYEE, payload),
}
