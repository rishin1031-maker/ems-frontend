import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { useDesignationMutations } from '@/features/admin/designations/hooks/useDesignationMutations'
import { useDepartmentOptions } from '@/features/admin/departments/hooks/useDepartments'
import { useToast } from '@/components/feedback/ToastContext'
import { applyApiErrors } from '@/hooks/useApiErrors'
import type { Designation } from '@/api/types/designation'

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  department_id: z.coerce.number().min(1, 'Department is required'),
  description: z.string().optional(),
  status: z.enum(['active', 'inactive']).optional(),
})

type FormValues = z.infer<typeof schema>

interface DesignationFormModalProps {
  open: boolean
  onClose: () => void
  designation?: Designation | null
  defaultDepartmentId?: number
  onCreated?: (designation: Designation) => void
}

export function DesignationFormModal({
  open,
  onClose,
  designation,
  defaultDepartmentId,
  onCreated,
}: DesignationFormModalProps) {
  const isEdit = Boolean(designation)
  const { create, update } = useDesignationMutations()
  const { data: deptData } = useDepartmentOptions()
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
    if (designation) {
      reset({
        name: designation.name,
        department_id: designation.department_id ?? 0,
        description: designation.description ?? '',
        status: designation.status,
      })
    } else {
      reset({
        name: '',
        department_id: defaultDepartmentId ?? 0,
        description: '',
        status: 'active',
      })
    }
  }, [designation, defaultDepartmentId, reset, open])

  const deptOptions = (deptData?.items ?? []).map((d) => ({ value: d.id, label: d.name }))

  const onSubmit = async (values: FormValues) => {
    try {
      if (isEdit && designation) {
        await update.mutateAsync({ id: designation.id, payload: values })
        success('Designation updated')
      } else {
        const created = await create.mutateAsync(values)
        success('Designation created')
        onCreated?.(created)
      }
      onClose()
    } catch (err) {
      toastError(applyApiErrors(err, setError) ?? 'Failed to save designation')
    }
  }

  const isPending = create.isPending || update.isPending

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Edit Designation' : 'Add Designation'}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input label="Name" error={errors.name?.message} {...register('name')} />
        <Select
          label="Department"
          placeholder="Select department"
          options={deptOptions}
          error={errors.department_id?.message}
          {...register('department_id')}
        />
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
