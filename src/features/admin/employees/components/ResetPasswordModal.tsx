import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { useEmployeeMutations } from '@/features/admin/employees/hooks/useEmployeeMutations'
import { useToast } from '@/components/feedback/ToastContext'
import { applyApiErrors } from '@/hooks/useApiErrors'
import type { Employee } from '@/api/types/employee'

const schema = z
  .object({
    new_password: z.string().min(8, 'Password must be at least 8 characters'),
    new_password_confirmation: z.string().min(1, 'Please confirm password'),
  })
  .refine((d) => d.new_password === d.new_password_confirmation, {
    message: 'Passwords do not match',
    path: ['new_password_confirmation'],
  })

type FormValues = z.infer<typeof schema>

interface ResetPasswordModalProps {
  employee: Employee | null
  open: boolean
  onClose: () => void
}

export function ResetPasswordModal({ employee, open, onClose }: ResetPasswordModalProps) {
  const { resetPassword } = useEmployeeMutations()
  const { success, error: toastError } = useToast()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    setError,
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  const onSubmit = async (values: FormValues) => {
    if (!employee) return
    try {
      await resetPassword.mutateAsync({ id: employee.id, payload: values })
      success(`Password reset for ${employee.name}`)
      reset()
      onClose()
    } catch (err) {
      toastError(applyApiErrors(err, setError) ?? 'Failed to reset password')
    }
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Reset Password"
      description={employee ? `Set a new password for ${employee.name} (${employee.employee_id})` : undefined}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="New Password"
          type="password"
          error={errors.new_password?.message}
          {...register('new_password')}
        />
        <Input
          label="Confirm Password"
          type="password"
          error={errors.new_password_confirmation?.message}
          {...register('new_password_confirmation')}
        />
        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="outline" onClick={handleClose} theme="admin">
            Cancel
          </Button>
          <Button type="submit" loading={resetPassword.isPending} theme="admin">
            Reset Password
          </Button>
        </div>
      </form>
    </Modal>
  )
}
