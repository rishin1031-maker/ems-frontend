import {
  apiPost,
  apiPostRaw,
  apiGet,
  persistLogin,
} from '@/api/client'
import type {
  AdminLoginRequest,
  AuthUser,
  LoginPayload,
} from '@/api/types/common'
import { ROLES } from '@/lib/constants'

export const adminAuthApi = {
  login: (payload: AdminLoginRequest) =>
    apiPostRaw<LoginPayload>('/admin/auth/login', payload),

  me: () => apiGet<AuthUser>('/admin/auth/me'),

  refresh: () => apiPost<LoginPayload>('/admin/auth/refresh'),

  logout: () => apiPost<null>('/admin/auth/logout'),

  persistSession: (payload: LoginPayload) =>
    persistLogin(ROLES.ADMIN, payload),
}
