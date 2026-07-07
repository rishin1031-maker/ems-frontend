import { LoginForm } from '@/features/auth/components/LoginForm'
import { GlassShell } from '@/components/layout/GlassShell'
import { APP_NAME, APP_TAGLINE } from '@/lib/nav'

export function LoginPage() {
  return (
    <GlassShell variant="admin">
      <div className="relative z-10 flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 text-lg font-bold text-white shadow-lg">
              {APP_NAME.slice(0, 2)}
            </div>
            <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
              {APP_NAME}
            </h1>
            <p className="mt-1 text-sm text-slate-500">{APP_TAGLINE}</p>
          </div>
          <div className="rounded-2xl glass-panel-strong p-6">
            <LoginForm />
          </div>
        </div>
      </div>
    </GlassShell>
  )
}
