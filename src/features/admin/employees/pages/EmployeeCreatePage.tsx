import { useNavigate } from 'react-router-dom'
import { PageHeader } from '@/components/layout/PageHeader'
import { EmployeeForm } from '@/features/admin/employees/components/EmployeeForm'

export function EmployeeCreatePage() {
  const navigate = useNavigate()

  return (
    <div>
      <PageHeader title="Add Employee" description="Create a new employee record" />
      <EmployeeForm
        mode="create"
        onSuccess={() => navigate('/admin/employees')}
        onCancel={() => navigate('/admin/employees')}
      />
    </div>
  )
}
