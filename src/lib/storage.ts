import { AUTH_STORAGE_KEY, THEME_STORAGE_KEY, type Role } from './constants'

export interface StoredAuth {
  access_token: string
  role: Role
  user: Record<string, unknown>
  expires_in?: number
  expires_at?: number
}

export function getStoredAuth(): StoredAuth | null {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as StoredAuth
  } catch {
    return null
  }
}

export function setStoredAuth(auth: StoredAuth): void {
  const payload: StoredAuth = {
    ...auth,
    expires_at: auth.expires_in
      ? Date.now() + auth.expires_in * 1000
      : auth.expires_at,
  }
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(payload))
}

export function clearStoredAuth(): void {
  localStorage.removeItem(AUTH_STORAGE_KEY)
}

export function getAccessToken(): string | null {
  return getStoredAuth()?.access_token ?? null
}

export function getStoredRole(): Role | null {
  return getStoredAuth()?.role ?? null
}

export type Theme = 'light' | 'dark' | 'reading'

export function getStoredTheme(): Theme {
  const stored = localStorage.getItem(THEME_STORAGE_KEY)
  if (stored === 'dark' || stored === 'light' || stored === 'reading') return stored
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function setStoredTheme(theme: Theme): void {
  localStorage.setItem(THEME_STORAGE_KEY, theme)
}
