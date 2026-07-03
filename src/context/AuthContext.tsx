import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { useNavigate } from 'react-router-dom'
import { setAuthHandlers } from '@/api/client'
import { adminAuthApi } from '@/api/admin/auth.api'
import { employeeAuthApi } from '@/api/employee/auth.api'
import type { AuthUser, LoginPayload } from '@/api/types/common'
import { ROLES, EMPLOYEE_ID_PATTERN, EMAIL_PATTERN, type Role } from '@/lib/constants'
import {
  clearStoredAuth,
  getStoredAuth,
  setStoredAuth,
  type StoredAuth,
} from '@/lib/storage'

interface AuthState {
  user: AuthUser | null
  role: Role | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  mustChangePassword: boolean
}

interface AuthContextValue extends AuthState {
  login: (login: string, password: string) => Promise<void>
  logout: () => Promise<void>
  refreshSession: () => Promise<string | null>
  setMustChangePassword: (value: boolean) => void
  updateUser: (user: AuthUser) => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

function mapStoredUser(stored: StoredAuth): AuthState {
  const user = stored.user as AuthUser
  const mustChangePassword =
    stored.role === ROLES.EMPLOYEE && Boolean(user.must_change_password)

  return {
    user,
    role: stored.role,
    token: stored.access_token,
    isAuthenticated: true,
    isLoading: false,
    mustChangePassword,
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate()
  const [state, setState] = useState<AuthState>(() => {
    const stored = getStoredAuth()
    if (stored) return mapStoredUser(stored)
    return {
      user: null,
      role: null,
      token: null,
      isAuthenticated: false,
      isLoading: true,
      mustChangePassword: false,
    }
  })

  const applySession = useCallback((role: Role, payload: LoginPayload) => {
    setStoredAuth({
      access_token: payload.access_token,
      role,
      user: payload.user as Record<string, unknown>,
      expires_in: payload.expires_in,
    })

    const mustChangePassword =
      role === ROLES.EMPLOYEE && Boolean(payload.user.must_change_password)

    setState({
      user: payload.user,
      role,
      token: payload.access_token,
      isAuthenticated: true,
      isLoading: false,
      mustChangePassword,
    })

    return mustChangePassword
  }, [])

  const logout = useCallback(async () => {
    const stored = getStoredAuth()
    try {
      if (stored?.role === ROLES.ADMIN) {
        await adminAuthApi.logout()
      } else if (stored?.role === ROLES.EMPLOYEE) {
        await employeeAuthApi.logout()
      }
    } catch {
      // ignore logout API errors
    } finally {
      clearStoredAuth()
      setState({
        user: null,
        role: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        mustChangePassword: false,
      })
      navigate('/login', { replace: true })
    }
  }, [navigate])

  const refreshSession = useCallback(async (): Promise<string | null> => {
    const stored = getStoredAuth()
    if (!stored?.role) return null

    try {
      const payload =
        stored.role === ROLES.ADMIN
          ? await adminAuthApi.refresh()
          : await employeeAuthApi.refresh()

      applySession(stored.role, payload)
      return payload.access_token
    } catch {
      return null
    }
  }, [applySession])

  const login = useCallback(
    async (loginInput: string, password: string) => {
      const trimmed = loginInput.trim()

      if (EMPLOYEE_ID_PATTERN.test(trimmed)) {
        const result = await employeeAuthApi.login({ login: trimmed, password })
        if (!result.ok) {
          throw new Error(result.message)
        }
        const mustChange = applySession(ROLES.EMPLOYEE, result.data)
        navigate(
          mustChange ? '/employee/change-password' : '/employee/dashboard',
          { replace: true },
        )
        return
      }

      if (!EMAIL_PATTERN.test(trimmed)) {
        throw new Error('Enter a valid email address or Employee ID (e.g. EMP001)')
      }

      const adminResult = await adminAuthApi.login({ email: trimmed, password })
      if (adminResult.ok) {
        applySession(ROLES.ADMIN, adminResult.data)
        navigate('/admin/dashboard', { replace: true })
        return
      }

      if (adminResult.status !== 401) {
        throw new Error(adminResult.message)
      }

      const employeeResult = await employeeAuthApi.login({
        login: trimmed,
        password,
      })

      if (!employeeResult.ok) {
        throw new Error(employeeResult.message || 'Invalid credentials')
      }

      const mustChange = applySession(ROLES.EMPLOYEE, employeeResult.data)
      navigate(
        mustChange ? '/employee/change-password' : '/employee/dashboard',
        { replace: true },
      )
    },
    [applySession, navigate],
  )

  useEffect(() => {
    const stored = getStoredAuth()
    if (stored) {
      setState(mapStoredUser(stored))
    } else {
      setState((prev) => ({ ...prev, isLoading: false }))
    }
  }, [])

  useEffect(() => {
    setAuthHandlers({
      refresh: refreshSession,
      logout: () => {
        void logout()
      },
      onPasswordChangeRequired: () => {
        setState((prev) => ({ ...prev, mustChangePassword: true }))
        navigate('/employee/change-password', { replace: true })
      },
    })
  }, [refreshSession, logout, navigate])

  const setMustChangePassword = useCallback((value: boolean) => {
    setState((prev) => ({ ...prev, mustChangePassword: value }))
  }, [])

  const updateUser = useCallback((user: AuthUser) => {
    const stored = getStoredAuth()
    if (stored) {
      setStoredAuth({ ...stored, user: user as Record<string, unknown> })
    }
    setState((prev) => ({ ...prev, user }))
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      ...state,
      login,
      logout,
      refreshSession,
      setMustChangePassword,
      updateUser,
    }),
    [state, login, logout, refreshSession, setMustChangePassword, updateUser],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuthContext(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuthContext must be used within AuthProvider')
  }
  return ctx
}
