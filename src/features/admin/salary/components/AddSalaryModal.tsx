import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { PageLoader } from '@/components/ui/Spinner'
import { EmptyState } from '@/components/feedback/EmptyState'
import { useSalaryList } from '@/features/admin/salary/hooks/useSalary'
import type { SalaryListRow } from '@/api/types/salary'

interface AddSalaryModalProps {
  open: boolean
  onClose: () => void
}

export function AddSalaryModal({ open, onClose }: AddSalaryModalProps) {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const { data, isLoading } = useSalaryList(
    { per_page: 100, search: search || undefined },
    open,
  )

  const withoutSalary = (data?.items ?? []).filter((row) => !row.salary)

  const handleSelect = (row: SalaryListRow) => {
    navigate(`/admin/salary/${row.employee.id}`)
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Add Salary"
      description="Select an employee who does not have a salary record yet."
      size="md"
    >
      <div className="space-y-4">
        <Input
          placeholder="Search by name or employee ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {isLoading ? (
          <PageLoader />
        ) : withoutSalary.length === 0 ? (
          <EmptyState
            title="No employees available"
            description={
              search
                ? 'No employees without salary match your search.'
                : 'All active employees already have salary records.'
            }
          />
        ) : (
          <ul className="max-h-72 divide-y divide-gray-100 overflow-y-auto rounded-lg border border-gray-200 dark:divide-gray-800 dark:border-gray-800">
            {withoutSalary.map((row) => (
              <li key={row.employee.id}>
                <button
                  type="button"
                  onClick={() => handleSelect(row)}
                  className="flex w-full items-center justify-between px-4 py-3 text-left transition hover:bg-indigo-50 dark:hover:bg-indigo-950/30"
                >
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">{row.employee.name}</p>
                    <p className="text-xs text-gray-500">
                      {row.employee.employee_id}
                      {row.employee.department?.name ? ` · ${row.employee.department.name}` : ''}
                    </p>
                  </div>
                  <Button size="sm" theme="admin">Set salary</Button>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Modal>
  )
}
