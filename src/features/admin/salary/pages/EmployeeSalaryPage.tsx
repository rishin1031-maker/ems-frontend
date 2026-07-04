import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { PageLoader } from '@/components/ui/Spinner'
import {
  Table, TableHead, TableBody, TableRow, TableHeader, TableCell,
} from '@/components/ui/Table'
import { useEmployeeSalary, useSalaryMutations } from '@/features/admin/salary/hooks/useSalary'
import { useToast } from '@/components/feedback/ToastContext'
import { applyApiErrors } from '@/hooks/useApiErrors'
import { formatCurrency, formatDate, todayISO } from '@/lib/format'
import { TARGET_MONTHLY_HOURS } from '@/lib/constants'

const schema = z.object({
  basic: z.coerce.number().min(0, 'Basic salary is required'),
  hra: z.coerce.number().min(0).optional(),
  transport: z.coerce.number().min(0).optional(),
  medical: z.coerce.number().min(0).optional(),
  other_allowance: z.coerce.number().min(0).optional(),
  pf_deduction: z.coerce.number().min(0).optional(),
  tax_deduction: z.coerce.number().min(0).optional(),
  other_deduction: z.coerce.number().min(0).optional(),
  effective_from: z.string().min(1, 'Effective from is required'),
  note: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

export function EmployeeSalaryPage() {
  const { employeeId } = useParams<{ employeeId: string }>()
  const navigate = useNavigate()
  const { data, isLoading } = useEmployeeSalary(employeeId)
  const { update } = useSalaryMutations()
  const { success, error: toastError } = useToast()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    setError,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { effective_from: todayISO() },
  })

  useEffect(() => {
    if (data?.current) {
      const c = data.current
      reset({
        basic: c.basic ?? 0,
        hra: c.hra ?? 0,
        transport: c.transport ?? 0,
        medical: c.medical ?? 0,
        other_allowance: c.other_allowance ?? 0,
        pf_deduction: c.pf_deduction ?? 0,
        tax_deduction: c.tax_deduction ?? 0,
        other_deduction: c.other_deduction ?? 0,
        effective_from: c.effective_from ?? todayISO(),
        note: c.note ?? '',
      })
    }
  }, [data, reset])

  const onSubmit = async (values: FormValues) => {
    if (!employeeId) return
    const adding = !data?.current
    try {
      await update.mutateAsync({ employeeId, payload: values })
      success(adding ? 'Salary added successfully' : 'Salary updated successfully')
    } catch (err) {
      toastError(applyApiErrors(err, setError) ?? 'Failed to save salary')
    }
  }

  if (isLoading) return <PageLoader />
  if (!data) return <p className="text-gray-500">Employee not found</p>

  const emp = data.employee
  const isNew = !data.current

  return (
    <div>
      <PageHeader
        title={`${isNew ? 'Add' : 'Manage'} Salary — ${emp.name}`}
        description={emp.employee_id}
        actions={
          <Button variant="outline" theme="admin" onClick={() => navigate('/admin/salary')}>
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        }
      />

      <div className="mb-4 rounded-lg border border-indigo-100 bg-indigo-50 p-4 text-sm text-indigo-800 dark:border-indigo-900 dark:bg-indigo-950/50 dark:text-indigo-200">
        Set the full monthly salary here. Actual pay each month = full net × (net work hours ÷ {TARGET_MONTHLY_HOURS}), capped at 100%.
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>{isNew ? 'Salary Breakdown' : 'Update Salary'}</CardTitle></CardHeader>
          {data.current && (
            <p className="mb-4 text-sm text-gray-500">
              Current net: <span className="font-semibold text-green-700">{formatCurrency(data.current.net_salary)}</span>
            </p>
          )}
          {!data.current && (
            <p className="mb-4 text-sm text-amber-700 dark:text-amber-400">
              This employee does not have a salary record yet. Fill in the breakdown below to add one.
            </p>
          )}
          <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 sm:grid-cols-2">
            <Input label="Basic Salary (₹)" type="number" step="0.01" error={errors.basic?.message} {...register('basic')} />
            <Input label="HRA (₹)" type="number" step="0.01" error={errors.hra?.message} {...register('hra')} />
            <Input label="Transport (₹)" type="number" step="0.01" error={errors.transport?.message} {...register('transport')} />
            <Input label="Medical (₹)" type="number" step="0.01" error={errors.medical?.message} {...register('medical')} />
            <Input label="Other Allowance (₹)" type="number" step="0.01" error={errors.other_allowance?.message} {...register('other_allowance')} />
            <Input label="PF Deduction (₹)" type="number" step="0.01" error={errors.pf_deduction?.message} {...register('pf_deduction')} />
            <Input label="Tax Deduction (₹)" type="number" step="0.01" error={errors.tax_deduction?.message} {...register('tax_deduction')} />
            <Input label="Other Deduction (₹)" type="number" step="0.01" error={errors.other_deduction?.message} {...register('other_deduction')} />
            <Input label="Effective From" type="date" error={errors.effective_from?.message} {...register('effective_from')} />
            <Input label="Note" placeholder="e.g. Annual increment" error={errors.note?.message} {...register('note')} />
            <div className="sm:col-span-2">
              <Button type="submit" loading={update.isPending} theme="admin">
                {isNew ? 'Add Salary' : 'Save Salary'}
              </Button>
            </div>
          </form>
        </Card>

        <Card>
          <CardHeader><CardTitle>Employee</CardTitle></CardHeader>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between"><dt className="text-gray-500">Department</dt><dd>{emp.department?.name ?? '—'}</dd></div>
            <div className="flex justify-between"><dt className="text-gray-500">Designation</dt><dd>{emp.designation?.name ?? '—'}</dd></div>
            {data.current && (
              <>
                <div className="flex justify-between"><dt className="text-gray-500">Gross</dt><dd>{formatCurrency(data.current.gross_salary)}</dd></div>
                <div className="flex justify-between"><dt className="text-gray-500">Net</dt><dd className="font-bold text-indigo-600">{formatCurrency(data.current.net_salary)}</dd></div>
              </>
            )}
          </dl>
        </Card>
      </div>

      {data.history.length > 0 && (
        <Card className="mt-6" id="history">
          <CardHeader><CardTitle>Salary History</CardTitle></CardHeader>
          <Table>
            <TableHead>
              <TableRow>
                <TableHeader>Effective From</TableHeader>
                <TableHeader>Gross</TableHeader>
                <TableHeader>Net</TableHeader>
                <TableHeader>Note</TableHeader>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.history.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>{formatDate(row.effective_from)}</TableCell>
                  <TableCell>{formatCurrency(row.gross_salary)}</TableCell>
                  <TableCell className="font-medium text-green-700">{formatCurrency(row.net_salary)}</TableCell>
                  <TableCell className="text-gray-500">{row.note ?? '—'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  )
}
