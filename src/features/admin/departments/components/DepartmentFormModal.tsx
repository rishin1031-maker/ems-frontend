import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { useDepartmentMutations } from '@/features/admin/departments/hooks/useDepartmentMutations'
import { useToast } from '@/components/feedback/ToastContext'
import { applyApiErrors } from '@/hooks/useApiErrors'
import type { Department } from '@/api/types/department'

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  status: z.enum(['active', 'inactive']).optional(),
})

type FormValues = z.infer<typeof schema>

interface DepartmentFormModalProps {
  open: boolean
  onClose: () => void
  department?: Department | null
}

export function DepartmentFormModal({ open, onClose, department }: DepartmentFormModalProps) {
  const isEdit = Boolean(department)
  const { create, update } = useDepartmentMutations()
  const { success, error: toastError } = useToast()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    setError,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { status: 'active' },
  })

  useEffect(() => {
    if (department) {
      reset({
        name: department.name,
        description: department.description ?? '',
        status: department.status,
      })
    } else {
      reset({ name: '', description: '', status: 'active' })
    }
  }, [department, reset, open])

  const onSubmit = async (values: FormValues) => {
    try {
      if (isEdit && department) {
        await update.mutateAsync({ id: department.id, payload: values })
        success('Department updated')
      } else {
        await create.mutateAsync(values)
        success('Department created')
      }
      onClose()
    } catch (err) {
      toastError(applyApiErrors(err, setError) ?? 'Failed to save department')
    }
  }

  const isPending = create.isPending || update.isPending

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Edit Department' : 'Add Department'}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input label="Name" error={errors.name?.message} {...register('name')} />
        <Textarea label="Description" error={errors.description?.message} {...register('description')} />
        <Select
          label="Status"
          options={[
            { value: 'active', label: 'Active' },
            { value: 'inactive', label: 'Inactive' },
          ]}
          error={errors.status?.message}
          {...register('status')}
        />
        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="outline" onClick={onClose} theme="admin">
            Cancel
          </Button>
          <Button type="submit" loading={isPending} theme="admin">
            {isEdit ? 'Save' : 'Create'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
