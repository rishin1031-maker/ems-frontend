import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate, Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import { Button } from '@/components/ui/Button'
import { LeaveBalanceCard } from '@/features/employee/dashboard/components/LeaveBalanceCard'
import { useEmployeeLeaveMutations, useLeaveBalance } from '@/features/employee/leaves/hooks/useEmployeeLeaves'
import { useToast } from '@/components/feedback/ToastContext'
import { applyApiErrors } from '@/hooks/useApiErrors'
import { LEAVE_TYPES } from '@/lib/constants'
import { statusLabel } from '@/lib/format'

const schema = z.object({
  type: z.enum(['casual', 'sick', 'annual']),
  from_date: z.string().min(1, 'From date is required'),
  to_date: z.string().min(1, 'To date is required'),
  reason: z.string().min(1, 'Reason is required'),
})

type FormValues = z.infer<typeof schema>

export function ApplyLeavePage() {
  const navigate = useNavigate()
  const { apply } = useEmployeeLeaveMutations()
  const { data: balance } = useLeaveBalance()
  const { success, error: toastError } = useToast()

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  const onSubmit = async (values: FormValues) => {
    try {
      await apply.mutateAsync(values)
      success('Leave application submitted')
      navigate('/employee/leaves')
    } catch (err) {
      toastError(applyApiErrors(err, setError) ?? 'Failed to apply leave')
    }
  }

  return (
    <div>
      <PageHeader
        title="Apply Leave"
        description="Submit a new leave request"
        actions={
          <Link to="/employee/leaves">
            <Button variant="outline" theme="employee">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          </Link>
        }
      />

      <div className="mb-6">
        <LeaveBalanceCard balance={balance} />
      </div>

      <Card className="max-w-xl">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Select
            label="Leave Type"
            options={LEAVE_TYPES.map((t) => ({ value: t, label: statusLabel(t) }))}
            error={errors.type?.message}
            {...register('type')}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="From Date" type="date" error={errors.from_date?.message} {...register('from_date')} />
            <Input label="To Date" type="date" error={errors.to_date?.message} {...register('to_date')} />
          </div>
          <Textarea label="Reason" error={errors.reason?.message} {...register('reason')} />
          <div className="flex gap-3 pt-2">
            <Button type="submit" theme="employee" loading={apply.isPending}>
              Submit Application
            </Button>
            <Link to="/employee/leaves">
              <Button type="button" variant="outline" theme="employee">
                Cancel
              </Button>
            </Link>
          </div>
        </form>
      </Card>
    </div>
  )
}
