import { useEffect, useState, useOptimistic, useTransition } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Plus, Pencil, Trash2, ToggleLeft, ToggleRight } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
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
import { DepartmentFormModal } from '@/features/admin/departments/components/DepartmentFormModal'
import { useDepartments } from '@/features/admin/departments/hooks/useDepartments'
import { useDepartmentMutations } from '@/features/admin/departments/hooks/useDepartmentMutations'
import { useToast } from '@/components/feedback/ToastContext'
import { statusLabel } from '@/lib/format'
import type { Department } from '@/api/types/department'

export function DepartmentsPage() {
  const [searchParams] = useSearchParams()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState(() => searchParams.get('search') ?? '')
  const [formOpen, setFormOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<Department | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Department | null>(null)
  const [, startTransition] = useTransition()

  const { data, isLoading } = useDepartments({ page, search: search || undefined })
  const { remove, toggleStatus } = useDepartmentMutations()
  const { success, error: toastError } = useToast()

  const serverItems = data?.items ?? []
  // Use absolute status (not a toggle) so re-applying the optimistic update
  // when React Query cache syncs does not flip the badge twice.
  const [optimisticItems, addOptimistic] = useOptimistic(
    serverItems,
    (current, update: { id: number; status: Department['status'] }) =>
      current.map((dept) =>
        dept.id === update.id ? { ...dept, status: update.status } : dept,
      ),
  )

  useEffect(() => {
    const q = searchParams.get('search')
    if (q != null) setSearch(q)
  }, [searchParams])

  const openCreate = () => {
    setEditTarget(null)
    setFormOpen(true)
  }

  const openEdit = (dept: Department) => {
    setEditTarget(dept)
    setFormOpen(true)
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      await remove.mutateAsync(deleteTarget.id)
      success(`${deleteTarget.name} deleted`)
      setDeleteTarget(null)
    } catch (err) {
      toastError((err as Error).message ?? 'Failed to delete department')
    }
  }

  const handleToggle = (dept: Department) => {
    const nextStatus: Department['status'] = dept.status === 'active' ? 'inactive' : 'active'
    startTransition(async () => {
      addOptimistic({ id: dept.id, status: nextStatus })
      try {
        await toggleStatus.mutateAsync(dept.id)
        success(`${dept.name} status updated`)
      } catch (err) {
        toastError((err as Error).message ?? 'Failed to toggle status')
      }
    })
  }

  return (
    <div>
      <PageHeader
        title="Departments"
        description="Manage organization departments"
        actions={
          <Button theme="admin" onClick={openCreate}>
            <Plus className="h-4 w-4" />
            Add Department
          </Button>
        }
      />

      <div className="mb-6 max-w-sm">
        <Input
          placeholder="Search departments..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            setPage(1)
          }}
        />
      </div>

      {isLoading ? (
        <PageLoader />
      ) : !optimisticItems.length ? (
        <EmptyState action={<Button theme="admin" onClick={openCreate}>Add Department</Button>} />
      ) : (
        <>
          <Table>
            <TableHead>
              <TableRow>
                <TableHeader>Name</TableHeader>
                <TableHeader>Description</TableHeader>
                <TableHeader>Employees</TableHeader>
                <TableHeader>Status</TableHeader>
                <TableHeader className="text-right">Actions</TableHeader>
              </TableRow>
            </TableHead>
            <TableBody>
              {optimisticItems.map((dept) => (
                <TableRow key={dept.id}>
                  <TableCell className="font-medium">{dept.name}</TableCell>
                  <TableCell className="max-w-xs truncate text-gray-500">
                    {dept.description || '—'}
                  </TableCell>
                  <TableCell>{dept.employees_count ?? '—'}</TableCell>
                  <TableCell>
                    <Badge
                      variant={statusToBadgeVariant(dept.status)}
                      className="min-w-[4.75rem] justify-center"
                    >
                      {statusLabel(dept.status)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        theme="admin"
                        title="Toggle status"
                        onClick={() => handleToggle(dept)}
                        disabled={toggleStatus.isPending}
                      >
                        {dept.status === 'active' ? (
                          <ToggleRight className="h-4 w-4 text-green-500" />
                        ) : (
                          <ToggleLeft className="h-4 w-4 text-gray-400" />
                        )}
                      </Button>
                      <Button variant="ghost" size="sm" theme="admin" onClick={() => openEdit(dept)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" theme="admin" onClick={() => setDeleteTarget(dept)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {data?.meta && (
            <div className="mt-4">
              <Pagination meta={data.meta} onPageChange={setPage} />
            </div>
          )}
        </>
      )}

      <DepartmentFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        department={editTarget}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Department"
        description={`Delete "${deleteTarget?.name}"? Employees must be reassigned first.`}
        confirmLabel="Delete"
        loading={remove.isPending}
      />
    </div>
  )
}
