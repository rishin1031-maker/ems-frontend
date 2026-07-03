import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { KeyRound } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Badge, statusToBadgeVariant } from '@/components/ui/Badge'
import { PageLoader } from '@/components/ui/Spinner'
import { useEmployeeProfile, useProfileMutations } from '@/features/employee/profile/hooks/useProfile'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { useToast } from '@/components/feedback/ToastContext'
import { applyApiErrors } from '@/hooks/useApiErrors'
import { formatDate, statusLabel } from '@/lib/format'
import type { Employee } from '@/api/types/employee'

const phoneSchema = z.object({
  phone: z.string().min(10, 'Enter a valid phone number').max(15),
})

type PhoneFormValues = z.infer<typeof phoneSchema>

export function ProfilePage() {
  const { user } = useAuth()
  const { data: profile, isLoading } = useEmployeeProfile()
  const { updatePhone } = useProfileMutations()
  const { success, error: toastError } = useToast()

  const display = (profile ?? user) as Employee | undefined

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    setError,
  } = useForm<PhoneFormValues>({
    resolver: zodResolver(phoneSchema),
  })

  useEffect(() => {
    if (display?.phone) {
      reset({ phone: String(display.phone) })
    }
  }, [display, reset])

  const onSubmit = async (values: PhoneFormValues) => {
    try {
      await updatePhone.mutateAsync(values)
      success('Phone number updated')
    } catch (err) {
      toastError(applyApiErrors(err, setError) ?? 'Failed to update phone')
    }
  }

  if (isLoading && !display) return <PageLoader />

  const infoFields = [
    { label: 'Email', value: display?.email ?? '—' },
    { label: 'Department', value: display?.department?.name ?? '—' },
    { label: 'Designation', value: display?.designation?.name ?? '—' },
    { label: 'Gender', value: display?.gender ? statusLabel(display.gender) : '—' },
    { label: 'Date of Birth', value: display?.dob ? formatDate(display.dob) : '—' },
    { label: 'Status', value: display?.status ? statusLabel(display.status) : '—' },
    { label: 'Joined', value: display?.created_at ? formatDate(display.created_at) : '—' },
  ]

  return (
    <div>
      <PageHeader title="My Profile" description="Your account information" />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="overflow-hidden p-0 lg:col-span-1">
          <div className="bg-gradient-to-r from-teal-600 to-teal-400 px-6 py-8 text-center">
            {display?.image_url && (
              <img
                src={display.image_url}
                alt={display.name}
                className="mx-auto mb-3 h-20 w-20 rounded-full border-4 border-white object-cover shadow"
              />
            )}
            <h2 className="text-lg font-bold text-white">{display?.name ?? '—'}</h2>
            <p className="text-sm text-teal-100">{display?.employee_id ?? '—'}</p>
            {display?.status && (
              <Badge variant={statusToBadgeVariant(display.status)} className="mt-2">
                {statusLabel(display.status)}
              </Badge>
            )}
          </div>
          <div className="space-y-3 p-5 text-sm">
            {infoFields.map(({ label, value }) => (
              <div key={label} className="flex justify-between gap-4">
                <span className="text-gray-500">{label}</span>
                <span className="text-right font-medium">{value}</span>
              </div>
            ))}
          </div>
        </Card>

        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Update Phone</CardTitle>
            </CardHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 sm:flex-row">
              <Input
                label="Phone Number"
                type="tel"
                placeholder="10-digit mobile number"
                error={errors.phone?.message}
                className="flex-1"
                {...register('phone')}
              />
              <div className="flex items-end">
                <Button type="submit" theme="employee" loading={updatePhone.isPending}>
                  Update
                </Button>
              </div>
            </form>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Security</CardTitle>
            </CardHeader>
            <p className="mb-4 text-sm text-gray-500">
              Change your password if you have been using a temporary one or want to update your credentials.
            </p>
            <Link to="/employee/change-password">
              <Button variant="outline" theme="employee">
                <KeyRound className="h-4 w-4" />
                Change Password
              </Button>
            </Link>
          </Card>
        </div>
      </div>
    </div>
  )
}
