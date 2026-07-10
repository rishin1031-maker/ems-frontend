import { useState, useOptimistic, useTransition } from 'react'
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
import { DesignationFormModal } from '@/features/admin/designations/components/DesignationFormModal'
import { useDesignations } from '@/features/admin/designations/hooks/useDesignations'
import { useDesignationMutations } from '@/features/admin/designations/hooks/useDesignationMutations'
import { useToast } from '@/components/feedback/ToastContext'
import { statusLabel } from '@/lib/format'
import type { Designation } from '@/api/types/designation'

export function DesignationsPage() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<Designation | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Designation | null>(null)
  const [, startTransition] = useTransition()

  const { data, isLoading } = useDesignations({ page, search: search || undefined })
  const { remove, toggleStatus } = useDesignationMutations()
  const { success, error: toastError } = useToast()

  const serverItems = data?.items ?? []
  // Use absolute status (not a toggle) so re-applying the optimistic update
  // when React Query cache syncs does not flip the badge twice.
  const [optimisticItems, addOptimistic] = useOptimistic(
    serverItems,
    (current, update: { id: number; status: Designation['status'] }) =>
      current.map((item) =>
        item.id === update.id ? { ...item, status: update.status } : item,
      ),
  )

  const openCreate = () => {
    setEditTarget(null)
    setFormOpen(true)
  }

  const openEdit = (item: Designation) => {
    setEditTarget(item)
    setFormOpen(true)
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      await remove.mutateAsync(deleteTarget.id)
      success(`${deleteTarget.name} deleted`)
      setDeleteTarget(null)
    } catch (err) {
      toastError((err as Error).message ?? 'Failed to delete designation')
    }
  }

  const handleToggle = (item: Designation) => {
    const nextStatus: Designation['status'] = item.status === 'active' ? 'inactive' : 'active'
    startTransition(async () => {
      addOptimistic({ id: item.id, status: nextStatus })
      try {
        await toggleStatus.mutateAsync(item.id)
        success(`${item.name} status updated`)
      } catch (err) {
        toastError((err as Error).message ?? 'Failed to toggle status')
      }
    })
  }

  return (
    <div>
      <PageHeader
        title="Designations"
        description="Manage job designations"
        actions={
          <Button theme="admin" onClick={openCreate}>
            <Plus className="h-4 w-4" />
            Add Designation
          </Button>
        }
      />

      <div className="mb-6 max-w-sm">
        <Input
          placeholder="Search designations..."
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
        <EmptyState action={<Button theme="admin" onClick={openCreate}>Add Designation</Button>} />
      ) : (
        <>
          <Table>
            <TableHead>
              <TableRow>
                <TableHeader>Name</TableHeader>
                <TableHeader>Department</TableHeader>
                <TableHeader>Description</TableHeader>
                <TableHeader>Employees</TableHeader>
                <TableHeader>Status</TableHeader>
                <TableHeader className="text-right">Actions</TableHeader>
              </TableRow>
            </TableHead>
            <TableBody>
              {optimisticItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>{item.department_name ?? '—'}</TableCell>
                  <TableCell className="max-w-xs truncate text-gray-500">
                    {item.description || '—'}
                  </TableCell>
                  <TableCell>{item.employees_count ?? '—'}</TableCell>
                  <TableCell>
                    <Badge
                      variant={statusToBadgeVariant(item.status)}
                      className="min-w-[4.75rem] justify-center"
                    >
                      {statusLabel(item.status)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        theme="admin"
                        title="Toggle status"
                        onClick={() => handleToggle(item)}
                        disabled={toggleStatus.isPending}
                      >
                        {item.status === 'active' ? (
                          <ToggleRight className="h-4 w-4 text-green-500" />
                        ) : (
                          <ToggleLeft className="h-4 w-4 text-gray-400" />
                        )}
                      </Button>
                      <Button variant="ghost" size="sm" theme="admin" onClick={() => openEdit(item)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" theme="admin" onClick={() => setDeleteTarget(item)}>
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

      <DesignationFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        designation={editTarget}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Designation"
        description={`Delete "${deleteTarget?.name}"? Employees must be reassigned first.`}
        confirmLabel="Delete"
        loading={remove.isPending}
      />
    </div>
  )
}
