import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Pencil, Trash2, KeyRound, Eye } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/Button'
import { Badge, statusToBadgeVariant } from '@/components/ui/Badge'
import { Pagination } from '@/components/ui/Pagination'
import { PageLoader } from '@/components/ui/Spinner'
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableHeader,
  TableCell,
} from '@/components/ui/Table'
import { EmptyState } from '@/components/feedback/EmptyState'
import { ConfirmDialog } from '@/components/feedback/ConfirmDialog'
import { EmployeeFilters } from '@/features/admin/employees/components/EmployeeFilters'
import { ResetPasswordModal } from '@/features/admin/employees/components/ResetPasswordModal'
import { useEmployees } from '@/features/admin/employees/hooks/useEmployees'
import { useEmployeeMutations } from '@/features/admin/employees/hooks/useEmployeeMutations'
import { useToast } from '@/components/feedback/ToastContext'
import { formatDate, statusLabel } from '@/lib/format'
import type { Employee } from '@/api/types/employee'
import type { EmployeeListParams } from '@/api/types/employee'

export function EmployeesListPage() {
  const [filters, setFilters] = useState<EmployeeListParams>({ page: 1, per_page: 15 })
  const [deleteTarget, setDeleteTarget] = useState<Employee | null>(null)
  const [resetTarget, setResetTarget] = useState<Employee | null>(null)

  const { data, isLoading } = useEmployees(filters)
  const { remove } = useEmployeeMutations()
  const { success, error: toastError } = useToast()

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      await remove.mutateAsync(deleteTarget.id)
      success(`${deleteTarget.name} deleted`)
      setDeleteTarget(null)
    } catch (err) {
      toastError((err as Error).message ?? 'Failed to delete employee')
    }
  }

  return (
    <div>
      <PageHeader
        title="Employees"
        description="Manage employee records"
        actions={
          <Link to="/admin/employees/create">
            <Button theme="admin">
              <Plus className="h-4 w-4" />
              Add Employee
            </Button>
          </Link>
        }
      />

      <div className="mb-6">
        <EmployeeFilters filters={filters} onChange={setFilters} />
      </div>

      {isLoading ? (
        <PageLoader />
      ) : !data?.items.length ? (
        <EmptyState
          action={
            <Link to="/admin/employees/create">
              <Button theme="admin">
                <Plus className="h-4 w-4" />
                Add Employee
              </Button>
            </Link>
          }
        />
      ) : (
        <>
          <Table>
            <TableHead>
              <TableRow>
                <TableHeader>ID</TableHeader>
                <TableHeader>Name</TableHeader>
                <TableHeader>Email</TableHeader>
                <TableHeader>Department</TableHeader>
                <TableHeader>Designation</TableHeader>
                <TableHeader>Gender</TableHeader>
                <TableHeader>Status</TableHeader>
                <TableHeader>Joined</TableHeader>
                <TableHeader className="text-right">Actions</TableHeader>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.items.map((emp) => (
                <TableRow key={emp.id}>
                  <TableCell className="font-mono text-xs">{emp.employee_id}</TableCell>
                  <TableCell className="font-medium">{emp.name}</TableCell>
                  <TableCell>{emp.email}</TableCell>
                  <TableCell>{emp.department?.name ?? '—'}</TableCell>
                  <TableCell>{emp.designation?.name ?? '—'}</TableCell>
                  <TableCell className="capitalize">{emp.gender ?? '—'}</TableCell>
                  <TableCell>
                    <Badge variant={statusToBadgeVariant(emp.status)}>
                      {statusLabel(emp.status)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {emp.created_at ? formatDate(emp.created_at) : '—'}
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      <Link to={`/admin/employees/${emp.id}`}>
                        <Button variant="ghost" size="sm" theme="admin" aria-label="View">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Link to={`/admin/employees/${emp.id}/edit`}>
                        <Button variant="ghost" size="sm" theme="admin" aria-label="Edit">
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        theme="admin"
                        aria-label="Reset password"
                        onClick={() => setResetTarget(emp)}
                      >
                        <KeyRound className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        theme="admin"
                        aria-label="Delete"
                        onClick={() => setDeleteTarget(emp)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {data.meta && (
            <div className="mt-4">
              <Pagination
                meta={data.meta}
                onPageChange={(page) => setFilters((f) => ({ ...f, page }))}
              />
            </div>
          )}
        </>
      )}

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Employee"
        description={`Are you sure you want to delete ${deleteTarget?.name}? This action cannot be undone.`}
        confirmLabel="Delete"
        loading={remove.isPending}
      />

      <ResetPasswordModal
        employee={resetTarget}
        open={Boolean(resetTarget)}
        onClose={() => setResetTarget(null)}
      />
    </div>
  )
}
