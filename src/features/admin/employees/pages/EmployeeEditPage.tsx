import { useNavigate, useParams } from 'react-router-dom'
import { PageHeader } from '@/components/layout/PageHeader'
import { EmployeeForm } from '@/features/admin/employees/components/EmployeeForm'

export function EmployeeEditPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  return (
    <div>
      <PageHeader title="Edit Employee" description="Update employee details" />
      <EmployeeForm
        mode="edit"
        employeeId={id}
        onSuccess={() => navigate('/admin/employees')}
        onCancel={() => navigate('/admin/employees')}
      />
    </div>
  )
}
