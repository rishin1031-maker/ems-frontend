import axios, {
  AxiosError,
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from 'axios'
import {
  createApiError,
  type ApiResponse,
  type LoginPayload,
} from '@/api/types/common'
import { ROLES, type Role } from '@/lib/constants'
import {
  clearStoredAuth,
  getAccessToken,
  getStoredRole,
  setStoredAuth,
} from '@/lib/storage'

const BASE_URL = import.meta.env.VITE_API_BASE_URL

type RefreshHandler = () => Promise<string | null>
type LogoutHandler = () => void
type PasswordChangeHandler = () => void

let refreshHandler: RefreshHandler | null = null
let logoutHandler: LogoutHandler | null = null
let passwordChangeHandler: PasswordChangeHandler | null = null
let isRefreshing = false
let refreshQueue: Array<(token: string | null) => void> = []

export function setAuthHandlers(handlers: {
  refresh: RefreshHandler
  logout: LogoutHandler
  onPasswordChangeRequired: PasswordChangeHandler
}): void {
  refreshHandler = handlers.refresh
  logoutHandler = handlers.logout
  passwordChangeHandler = handlers.onPasswordChangeRequired
}

function processRefreshQueue(token: string | null): void {
  refreshQueue.forEach((cb) => cb(token))
  refreshQueue = []
}

function normalizeError(error: AxiosError<ApiResponse>): never {
  if (!error.response) {
    throw createApiError('Network error. Please check your connection.', {
      isNetworkError: true,
    })
  }

  const { status, data } = error.response

  if (status === 503) {
    throw createApiError('Service temporarily unavailable. Please try again later.', {
      status,
      isServiceUnavailable: true,
    })
  }

  if (data?.code === 'password_change_required') {
    passwordChangeHandler?.()
    throw createApiError(data.message ?? 'Password change required.', {
      status,
      code: data.code,
    })
  }

  throw createApiError(data?.message ?? 'Something went wrong.', {
    status,
    code: data?.code,
    errors: data?.errors,
  })
}

const PUBLIC_AUTH_PATHS = [
  '/admin/auth/login',
  '/employee/auth/login',
]

function isPublicAuthRequest(url?: string): boolean {
  if (!url) return false
  return PUBLIC_AUTH_PATHS.some((path) => url.includes(path))
}

export const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
})

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getAccessToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiResponse>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean
    }

    if (!originalRequest || !error.response) {
      return normalizeError(error)
    }

    const { status, data } = error.response
    const isTokenExpired =
      status === 401 &&
      (data?.code === 'token_expired' ||
        data?.message?.toLowerCase().includes('token') ||
        data?.message?.toLowerCase().includes('expired'))

    if (isTokenExpired && !originalRequest._retry && refreshHandler) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          refreshQueue.push((token) => {
            if (!token) {
              reject(error)
              return
            }
            originalRequest.headers.Authorization = `Bearer ${token}`
            resolve(apiClient(originalRequest))
          })
        })
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        const newToken = await refreshHandler()
        processRefreshQueue(newToken)

        if (!newToken) {
          logoutHandler?.()
          return normalizeError(error)
        }

        originalRequest.headers.Authorization = `Bearer ${newToken}`
        return apiClient(originalRequest)
      } catch {
        processRefreshQueue(null)
        logoutHandler?.()
        return normalizeError(error)
      } finally {
        isRefreshing = false
      }
    }

    if (status === 401 && !isTokenExpired && !isPublicAuthRequest(originalRequest.url)) {
      logoutHandler?.()
    }

    return normalizeError(error)
  },
)

export async function apiGet<T>(url: string, params?: Record<string, unknown>): Promise<T> {
  const { data } = await apiClient.get<ApiResponse<T>>(url, { params })
  if (!data.success) {
    throw createApiError(data.message, { errors: data.errors, code: data.code })
  }
  return data.data as T
}

export async function apiPost<T>(
  url: string,
  body?: unknown,
): Promise<T> {
  const { data } = await apiClient.post<ApiResponse<T>>(url, body)
  if (!data.success) {
    throw createApiError(data.message, { errors: data.errors, code: data.code })
  }
  return data.data as T
}

export async function apiPut<T>(url: string, body?: unknown): Promise<T> {
  const { data } = await apiClient.put<ApiResponse<T>>(url, body)
  if (!data.success) {
    throw createApiError(data.message, { errors: data.errors, code: data.code })
  }
  return data.data as T
}

export async function apiPatch<T>(url: string, body?: unknown): Promise<T> {
  const { data } = await apiClient.patch<ApiResponse<T>>(url, body)
  if (!data.success) {
    throw createApiError(data.message, { errors: data.errors, code: data.code })
  }
  return data.data as T
}

export async function apiDelete<T>(url: string): Promise<T> {
  const { data } = await apiClient.delete<ApiResponse<T>>(url)
  if (!data.success) {
    throw createApiError(data.message, { errors: data.errors, code: data.code })
  }
  return data.data as T
}

export async function apiPostForm<T>(url: string, formData: FormData): Promise<T> {
  const { data } = await apiClient.post<ApiResponse<T>>(url, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  if (!data.success) {
    throw createApiError(data.message, { errors: data.errors, code: data.code })
  }
  return data.data as T
}

export async function apiPutForm<T>(url: string, formData: FormData): Promise<T> {
  const { data } = await apiClient.put<ApiResponse<T>>(url, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  if (!data.success) {
    throw createApiError(data.message, { errors: data.errors, code: data.code })
  }
  return data.data as T
}

/** Raw POST for login — does not throw on 401 so caller can try fallback */
export async function apiPostRaw<T>(
  url: string,
  body: unknown,
): Promise<{ ok: true; data: T } | { ok: false; status: number; message: string }> {
  try {
    const response = await apiClient.post<ApiResponse<T>>(url, body)
    const { data, status } = response
    if (status === 200 && data.success && data.data !== undefined) {
      return { ok: true, data: data.data }
    }
    return { ok: false, status, message: data.message ?? 'Login failed' }
  } catch (err) {
    const axiosErr = err as AxiosError<ApiResponse>
    if (axiosErr.response) {
      return {
        ok: false,
        status: axiosErr.response.status,
        message: axiosErr.response.data?.message ?? 'Login failed',
      }
    }
    throw createApiError('Network error. Please check your connection.', {
      isNetworkError: true,
    })
  }
}

export function persistLogin(role: Role, payload: LoginPayload): void {
  setStoredAuth({
    access_token: payload.access_token,
    role,
    user: payload.user as Record<string, unknown>,
    expires_in: payload.expires_in,
  })
}

export function getRefreshEndpoint(role: Role): string {
  return role === ROLES.ADMIN ? '/admin/auth/refresh' : '/employee/auth/refresh'
}

export function getLogoutEndpoint(role: Role): string {
  return role === ROLES.ADMIN ? '/admin/auth/logout' : '/employee/auth/logout'
}

export function getMeEndpoint(role: Role): string {
  return role === ROLES.ADMIN ? '/admin/auth/me' : '/employee/auth/me'
}

export { getStoredRole }
