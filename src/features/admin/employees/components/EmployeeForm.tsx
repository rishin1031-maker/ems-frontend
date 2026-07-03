import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { PageLoader } from '@/components/ui/Spinner'
import { EmployeeDeptDesigFields } from '@/features/admin/employees/components/EmployeeDeptDesigFields'
import { useEmployeeMutations } from '@/features/admin/employees/hooks/useEmployeeMutations'
import { useEmployee } from '@/features/admin/employees/hooks/useEmployees'
import { useToast } from '@/components/feedback/ToastContext'
import { applyApiErrors } from '@/hooks/useApiErrors'

const baseFields = {
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().min(10, 'Phone is required').max(15),
  gender: z.enum(['male', 'female', 'other']),
  dob: z.string().optional(),
  department_id: z.coerce.number().min(1, 'Department is required'),
  designation_id: z.coerce.number().min(1, 'Designation is required'),
}

const createSchema = z.object({
  ...baseFields,
  status: z.enum(['active', 'inactive']).default('active'),
  image: z.any().optional(),
})

const editSchema = z.object({
  ...baseFields,
  status: z.enum(['active', 'inactive']),
  image: z.any().optional(),
})

type CreateFormValues = z.infer<typeof createSchema>
type EditFormValues = z.infer<typeof editSchema>

interface EmployeeFormProps {
  mode: 'create' | 'edit'
  employeeId?: string
  onSuccess: () => void
  onCancel: () => void
}

function buildPayload(values: CreateFormValues | EditFormValues, imageFile?: File | null) {
  return {
    name: values.name,
    email: values.email,
    phone: values.phone,
    gender: values.gender,
    dob: values.dob || undefined,
    department_id: values.department_id,
    designation_id: values.designation_id,
    status: values.status,
    image: imageFile ?? undefined,
  }
}

export function EmployeeForm({ mode, employeeId, onSuccess, onCancel }: EmployeeFormProps) {
  const isCreate = mode === 'create'
  const { data: employee, isLoading } = useEmployee(isCreate ? undefined : employeeId)
  const { create, update } = useEmployeeMutations()
  const { success, error: toastError } = useToast()

  const createForm = useForm<CreateFormValues>({
    resolver: zodResolver(createSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      gender: 'male',
      dob: '',
      status: 'active',
      department_id: 0,
      designation_id: 0,
    },
  })

  const editForm = useForm<EditFormValues>({
    resolver: zodResolver(editSchema),
    defaultValues: { status: 'active', gender: 'male', department_id: 0, designation_id: 0 },
  })

  const form = isCreate ? createForm : editForm
  const { register, handleSubmit, setValue, watch, formState: { errors } } = form

  const departmentId = watch('department_id')
  const designationId = watch('designation_id')

  useEffect(() => {
    if (employee && !isCreate) {
      editForm.reset({
        name: employee.name,
        email: employee.email,
        phone: employee.phone ?? '',
        gender: employee.gender ?? 'male',
        dob: employee.dob?.slice(0, 10) ?? '',
        department_id: employee.department_id ?? employee.department?.id ?? 0,
        designation_id: employee.designation_id ?? employee.designation?.id ?? 0,
        status: employee.status,
      })
    }
  }, [employee, isCreate, editForm])

  const onCreateSubmit = async (values: CreateFormValues) => {
    const imageInput = document.getElementById('employee-image') as HTMLInputElement | null
    const imageFile = imageInput?.files?.[0] ?? null
    try {
      await create.mutateAsync(buildPayload(values, imageFile))
      success('Employee created. Login credentials will be emailed.')
      onSuccess()
    } catch (err) {
      toastError(applyApiErrors(err, createForm.setError) ?? 'Failed to save employee')
    }
  }

  const onEditSubmit = async (values: EditFormValues) => {
    if (!employeeId) return
    const imageInput = document.getElementById('employee-image') as HTMLInputElement | null
    const imageFile = imageInput?.files?.[0] ?? null
    try {
      await update.mutateAsync({ id: employeeId, payload: buildPayload(values, imageFile) })
      success('Employee updated successfully')
      onSuccess()
    } catch (err) {
      toastError(applyApiErrors(err, editForm.setError) ?? 'Failed to save employee')
    }
  }

  if (!isCreate && isLoading) return <PageLoader />

  const genderOptions = [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'other', label: 'Other' },
  ]

  const setDept = (id: number | '') => {
    setValue('department_id', id === '' ? 0 : id, { shouldValidate: true })
  }

  const setDesig = (id: number | '') => {
    setValue('designation_id', id === '' ? 0 : id, { shouldValidate: true })
  }

  const formFields = (showStatus: boolean) => (
    <>
      <Input label="Full Name" error={errors.name?.message} {...register('name')} />
      <Input label="Email" type="email" error={errors.email?.message} {...register('email')} />
      <Input label="Phone" error={errors.phone?.message} {...register('phone')} placeholder="10–15 digits" />
      <Select label="Gender" options={genderOptions} error={errors.gender?.message} {...register('gender')} />
      <Input label="Date of Birth" type="date" error={errors.dob?.message} {...register('dob')} />
      <EmployeeDeptDesigFields
        departmentId={departmentId}
        designationId={designationId}
        onDepartmentChange={setDept}
        onDesignationChange={setDesig}
        departmentError={errors.department_id?.message}
        designationError={errors.designation_id?.message}
      />
      {showStatus && (
        <Select
          label="Status"
          options={[{ value: 'active', label: 'Active' }, { value: 'inactive', label: 'Inactive' }]}
          error={errors.status?.message}
          {...register('status')}
        />
      )}
      <div className="sm:col-span-2">
        <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Profile Photo</label>
        <input
          id="employee-image"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="block w-full text-sm text-gray-500 file:mr-4 file:rounded-lg file:border-0 file:bg-indigo-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-indigo-700 hover:file:bg-indigo-100"
        />
        {!isCreate && employee?.image_url && (
          <img src={employee.image_url} alt={employee.name} className="mt-2 h-16 w-16 rounded-full object-cover" />
        )}
      </div>
    </>
  )

  if (isCreate) {
    return (
      <Card>
        <p className="mb-4 text-sm text-gray-500">
          A temporary password will be generated and emailed to the employee automatically.
        </p>
        <form onSubmit={handleSubmit(onCreateSubmit)} className="grid gap-4 sm:grid-cols-2">
          {formFields(true)}
          <div className="flex gap-3 sm:col-span-2">
            <Button type="submit" loading={create.isPending} theme="admin">Create Employee</Button>
            <Button type="button" variant="outline" onClick={onCancel} theme="admin">Cancel</Button>
          </div>
        </form>
      </Card>
    )
  }

  return (
    <Card>
      <form onSubmit={handleSubmit(onEditSubmit)} className="grid gap-4 sm:grid-cols-2">
        {formFields(true)}
        <div className="flex gap-3 sm:col-span-2">
          <Button type="submit" loading={update.isPending} theme="admin">Save Changes</Button>
          <Button type="button" variant="outline" onClick={onCancel} theme="admin">Cancel</Button>
        </div>
      </form>
    </Card>
  )
}
