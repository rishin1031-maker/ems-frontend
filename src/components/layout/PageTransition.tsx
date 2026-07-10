import { useLayoutEffect, type ReactNode } from 'react'
import { useLocation } from 'react-router-dom'

/**
 * Soft fade/slide when switching routes (sidebar sections, nested pages).
 * Respects prefers-reduced-motion via CSS.
 */
export function PageTransition({ children }: { children: ReactNode }) {
  const location = useLocation()

  useLayoutEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' })
  }, [location.pathname])

  return (
    <div key={location.pathname} className="page-transition">
      {children}
    </div>
  )
}
