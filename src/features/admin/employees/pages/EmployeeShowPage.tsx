import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, KeyRound, Pencil, Trash2 } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/Button'
import { Badge, statusToBadgeVariant } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { PageLoader } from '@/components/ui/Spinner'
import { ConfirmDialog } from '@/components/feedback/ConfirmDialog'
import { ResetPasswordModal } from '@/features/admin/employees/components/ResetPasswordModal'
import { useEmployee } from '@/features/admin/employees/hooks/useEmployees'
import { useEmployeeMutations } from '@/features/admin/employees/hooks/useEmployeeMutations'
import { useToast } from '@/components/feedback/ToastContext'
import { formatDate, statusLabel } from '@/lib/format'

export function EmployeeShowPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: employee, isLoading } = useEmployee(id)
  const { remove } = useEmployeeMutations()
  const { success, error: toastError } = useToast()
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [resetOpen, setResetOpen] = useState(false)

  const handleDelete = async () => {
    if (!employee) return
    try {
      await remove.mutateAsync(employee.id)
      success(`${employee.name} deleted`)
      navigate('/admin/employees')
    } catch (err) {
      toastError((err as Error).message ?? 'Failed to delete employee')
    }
  }

  if (isLoading) return <PageLoader />
  if (!employee) return <p className="text-gray-500">Employee not found</p>

  const fields = [
    { label: 'Employee ID', value: employee.employee_id },
    { label: 'Email', value: employee.email },
    { label: 'Phone', value: employee.phone ?? '—' },
    { label: 'Gender', value: employee.gender ? statusLabel(employee.gender) : '—' },
    { label: 'Date of Birth', value: employee.dob ? formatDate(employee.dob) : '—' },
    { label: 'Member Since', value: employee.created_at ? formatDate(employee.created_at) : '—' },
    { label: 'Department', value: employee.department?.name ?? '—' },
    { label: 'Designation', value: employee.designation?.name ?? '—' },
  ]

  return (
    <div>
      <PageHeader
        title={employee.name}
        description="Employee details"
        actions={
          <Button variant="outline" theme="admin" onClick={() => navigate('/admin/employees')}>
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        }
      />

      <Card className="overflow-hidden p-0">
        <div className="flex flex-col gap-6 bg-gradient-to-r from-indigo-600 to-indigo-400 px-8 py-8 sm:flex-row sm:items-center">
          <img
            src={employee.image_url ?? undefined}
            alt={employee.name}
            className="h-24 w-24 rounded-full border-4 border-white object-cover shadow-lg"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
          />
          <div className="text-white">
            <h2 className="text-2xl font-bold">{employee.name}</h2>
            <p className="font-mono text-sm text-indigo-200">{employee.employee_id}</p>
            <p className="text-sm text-indigo-100">{employee.designation?.name ?? '—'}</p>
            <Badge variant={statusToBadgeVariant(employee.status)} className="mt-2">
              {statusLabel(employee.status)}
            </Badge>
          </div>
        </div>

        <div className="grid gap-6 p-8 sm:grid-cols-2 lg:grid-cols-3">
          {fields.map(({ label, value }) => (
            <div key={label}>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">{label}</p>
              <p className="mt-0.5 font-medium text-gray-800 dark:text-gray-200">{value}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-3 border-t border-gray-100 px-8 py-6 dark:border-gray-800">
          <Link to={`/admin/employees/${employee.id}/edit`}>
            <Button theme="admin"><Pencil className="h-4 w-4" /> Edit</Button>
          </Link>
          <Button theme="admin" variant="outline" onClick={() => setResetOpen(true)}>
            <KeyRound className="h-4 w-4" /> Reset Password
          </Button>
          <Button variant="outline" theme="admin" onClick={() => setDeleteOpen(true)} className="ml-auto text-red-600">
            <Trash2 className="h-4 w-4" /> Delete
          </Button>
        </div>
      </Card>

      <ConfirmDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Delete Employee"
        description={`Are you sure you want to delete ${employee.name}?`}
        confirmLabel="Delete"
        loading={remove.isPending}
      />

      <ResetPasswordModal employee={employee} open={resetOpen} onClose={() => setResetOpen(false)} />
    </div>
  )
}
