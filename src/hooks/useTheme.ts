import { useEffect, useState } from 'react'
import { getStoredTheme, setStoredTheme, type Theme } from '@/lib/storage'

const THEME_CYCLE: Theme[] = ['light', 'dark', 'reading']

export function getChartThemeColors(theme: Theme) {
  if (theme === 'dark') return { text: '#9ca3af', grid: '#374151' }
  if (theme === 'reading') return { text: '#78716c', grid: '#e7e5e4' }
  return { text: '#6b7280', grid: '#e5e7eb' }
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => getStoredTheme())

  useEffect(() => {
    const root = document.documentElement
    root.classList.toggle('dark', theme === 'dark')
    root.classList.toggle('reading', theme === 'reading')
    setStoredTheme(theme)
  }, [theme])

  const toggleTheme = () => {
    setTheme((prev) => {
      const next = THEME_CYCLE[(THEME_CYCLE.indexOf(prev) + 1) % THEME_CYCLE.length]
      return next ?? 'light'
    })
  }

  return {
    theme,
    setTheme,
    toggleTheme,
    isDark: theme === 'dark',
    isReading: theme === 'reading',
  }
}
