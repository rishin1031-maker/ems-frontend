import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router-dom'
import { employeeAuthApi } from '@/api/employee/auth.api'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { useToast } from '@/components/feedback/ToastContext'
import type { ApiError } from '@/api/types/common'

const schema = z
  .object({
    current_password: z.string().min(1, 'Current password is required'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    password_confirmation: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: 'Passwords do not match',
    path: ['password_confirmation'],
  })

type FormValues = z.infer<typeof schema>

export function ChangePasswordPage() {
  const { user, logout, setMustChangePassword, updateUser } = useAuth()
  const { success, error: toastError } = useToast()
  const navigate = useNavigate()
  const [submitting, setSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (values: FormValues) => {
    setSubmitting(true)
    try {
      await employeeAuthApi.changePassword(values)
      setMustChangePassword(false)
      if (user) {
        updateUser({ ...user, must_change_password: false })
      }
      success('Password changed successfully')
      navigate('/employee/dashboard', { replace: true })
    } catch (err) {
      const apiErr = err as ApiError
      if (apiErr.errors) {
        Object.entries(apiErr.errors).forEach(([field, messages]) => {
          const key = field as keyof FormValues
          if (key in schema.shape || key === 'password_confirmation') {
            setError(key, { message: messages[0] })
          }
        })
      }
      toastError(apiErr.message ?? 'Failed to change password')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-md">
      <Card>
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
          <CardDescription>
            You must set a new password before accessing the employee portal.
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Current Password"
            type="password"
            error={errors.current_password?.message}
            {...register('current_password')}
          />
          <Input
            label="New Password"
            type="password"
            error={errors.password?.message}
            {...register('password')}
          />
          <Input
            label="Confirm New Password"
            type="password"
            error={errors.password_confirmation?.message}
            {...register('password_confirmation')}
          />

          <div className="flex gap-3 pt-2">
            <Button type="submit" loading={submitting} theme="employee" className="flex-1">
              Update Password
            </Button>
            <Button type="button" variant="outline" onClick={() => void logout()} theme="employee">
              Logout
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
