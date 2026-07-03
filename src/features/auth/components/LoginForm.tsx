import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Building2, UserCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { useToast } from '@/components/feedback/ToastContext'
import type { ApiError } from '@/api/types/common'

const loginSchema = z.object({
  login: z.string().min(1, 'Email or Employee ID is required'),
  password: z.string().min(1, 'Password is required'),
})

type LoginFormValues = z.infer<typeof loginSchema>

export function LoginForm() {
  const { login } = useAuth()
  const { error: toastError } = useToast()
  const [submitting, setSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { login: '', password: '' },
  })

  const onSubmit = async (values: LoginFormValues) => {
    setSubmitting(true)
    try {
      await login(values.login, values.password)
    } catch (err) {
      const apiErr = err as ApiError
      if (apiErr.errors) {
        Object.entries(apiErr.errors).forEach(([field, messages]) => {
          if (field === 'email' || field === 'login') {
            setError('login', { message: messages[0] })
          } else if (field === 'password') {
            setError('password', { message: messages[0] })
          }
        })
      }
      toastError(apiErr.message ?? 'Login failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Sign in to EMS</CardTitle>
        <CardDescription>
          Admins use email. Employees can use email or Employee ID (e.g. EMP001).
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Email or Employee ID"
          placeholder="admin@ems.com or EMP001"
          autoComplete="username"
          error={errors.login?.message}
          {...register('login')}
        />
        <Input
          label="Password"
          type="password"
          placeholder="Enter your password"
          autoComplete="current-password"
          error={errors.password?.message}
          {...register('password')}
        />

        <Button type="submit" className="w-full" loading={submitting} theme="admin">
          Sign in
        </Button>
      </form>

      <div className="mt-6 grid grid-cols-2 gap-3 border-t border-gray-100 pt-6 dark:border-gray-800">
        <div className="flex items-start gap-2 text-xs text-gray-500">
          <Building2 className="mt-0.5 h-4 w-4 shrink-0 text-indigo-500" />
          <span>Admin portal — indigo theme</span>
        </div>
        <div className="flex items-start gap-2 text-xs text-gray-500">
          <UserCircle className="mt-0.5 h-4 w-4 shrink-0 text-teal-500" />
          <span>Employee portal — teal theme</span>
        </div>
      </div>
    </Card>
  )
}
