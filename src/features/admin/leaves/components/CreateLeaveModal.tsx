import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import { Button } from '@/components/ui/Button'
import { useLeaveMutations } from '@/features/admin/leaves/hooks/useLeaves'
import { useToast } from '@/components/feedback/ToastContext'
import { applyApiErrors } from '@/hooks/useApiErrors'
import { LEAVE_TYPES, LEAVE_STATUSES } from '@/lib/constants'
import { adminEmployeesApi } from '@/api/admin/employees.api'
import { useQuery } from '@tanstack/react-query'

const schema = z.object({
  employee_id: z.coerce.number().min(1, 'Employee is required'),
  type: z.enum(['casual', 'sick', 'annual']),
  from_date: z.string().min(1, 'From date is required'),
  to_date: z.string().min(1, 'To date is required'),
  reason: z.string().min(1, 'Reason is required'),
  status: z.enum(['pending', 'approved', 'rejected']),
})

type FormValues = z.infer<typeof schema>

interface CreateLeaveModalProps {
  open: boolean
  onClose: () => void
}

export function CreateLeaveModal({ open, onClose }: CreateLeaveModalProps) {
  const { create } = useLeaveMutations()
  const { success, error: toastError } = useToast()

  const { data: employeesData } = useQuery({
    queryKey: ['admin', 'employees', 'options'],
    queryFn: () => adminEmployeesApi.list({ per_page: 100, status: 'active' }),
    enabled: open,
  })

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    setError,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { status: 'approved' },
  })

  useEffect(() => {
    if (!open) reset({ status: 'approved' })
  }, [open, reset])

  const employeeOptions = (employeesData?.items ?? []).map((e) => ({
    value: e.id,
    label: `${e.name} (${e.employee_id})`,
  }))

  const onSubmit = async (values: FormValues) => {
    try {
      await create.mutateAsync(values)
      success('Leave created successfully')
      onClose()
    } catch (err) {
      toastError(applyApiErrors(err, setError) ?? 'Failed to create leave')
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Create Leave" description="Apply leave on behalf of an employee">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Select
          label="Employee"
          placeholder="Select employee"
          options={employeeOptions}
          error={errors.employee_id?.message}
          {...register('employee_id')}
        />
        <Select
          label="Leave Type"
          options={LEAVE_TYPES.map((t) => ({ value: t, label: t.charAt(0).toUpperCase() + t.slice(1) }))}
          error={errors.type?.message}
          {...register('type')}
        />
        <Select
          label="Status"
          options={LEAVE_STATUSES.map((s) => ({ value: s, label: s.charAt(0).toUpperCase() + s.slice(1) }))}
          error={errors.status?.message}
          {...register('status')}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="From Date" type="date" error={errors.from_date?.message} {...register('from_date')} />
          <Input label="To Date" type="date" error={errors.to_date?.message} {...register('to_date')} />
        </div>
        <Textarea label="Reason" error={errors.reason?.message} {...register('reason')} />
        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="outline" onClick={onClose} theme="admin">Cancel</Button>
          <Button type="submit" loading={create.isPending} theme="admin">Create Leave</Button>
        </div>
      </form>
    </Modal>
  )
}
