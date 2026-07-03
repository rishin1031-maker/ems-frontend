import { LoginForm } from '@/features/auth/components/LoginForm'

export function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-teal-50 p-4 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600 text-xl font-bold text-white shadow-lg">
            EMS
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Employee Management System
          </h1>
          <p className="mt-1 text-sm text-gray-500">Unified login for Admin & Employee</p>
        </div>
        <LoginForm />
      </div>
    </div>
  )
}
