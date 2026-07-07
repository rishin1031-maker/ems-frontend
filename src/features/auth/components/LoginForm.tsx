import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="mb-2">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Sign in</h2>
        <p className="mt-1 text-sm text-slate-500">
          Admins use email. Employees can use email or Employee ID.
        </p>
      </div>

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

      <Button type="submit" className="w-full rounded-xl" loading={submitting} theme="admin">
        Sign in
      </Button>
    </form>
  )
}
