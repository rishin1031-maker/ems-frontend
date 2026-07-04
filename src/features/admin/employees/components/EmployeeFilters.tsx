import { useState, useEffect } from 'react'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { useDepartmentOptions } from '@/features/admin/departments/hooks/useDepartments'
import { useDesignationOptions } from '@/features/admin/designations/hooks/useDesignations'
import type { EmployeeListParams } from '@/api/types/employee'

interface EmployeeFiltersProps {
  filters: EmployeeListParams
  onChange: (filters: EmployeeListParams) => void
}

export function EmployeeFilters({ filters, onChange }: EmployeeFiltersProps) {
  const [search, setSearch] = useState(filters.search ?? '')
  const { data: deptData } = useDepartmentOptions()
  const { data: desigData } = useDesignationOptions()

  useEffect(() => {
    const timer = setTimeout(() => {
      onChange({ ...filters, search: search || undefined, page: 1 })
    }, 300)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search])

  const deptOptions = (deptData?.items ?? []).map((d) => ({ value: d.id, label: d.name }))
  const desigOptions = (desigData?.items ?? []).map((d) => ({ value: d.id, label: d.name }))

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <div className="relative sm:col-span-2 lg:col-span-1">
      <Search className="absolute left-3 top-4/6 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <Input
          label='Search'
          placeholder="Search name, email, ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>
      <Select
        label="Department"
        placeholder="All departments"
        options={deptOptions}
        value={filters.department_id ?? ''}
        onChange={(e) =>
          onChange({
            ...filters,
            department_id: e.target.value ? Number(e.target.value) : undefined,
            page: 1,
          })
        }
      />
      <Select
        label="Designation"
        placeholder="All designations"
        options={desigOptions}
        value={filters.designation_id ?? ''}
        onChange={(e) =>
          onChange({
            ...filters,
            designation_id: e.target.value ? Number(e.target.value) : undefined,
            page: 1,
          })
        }
      />
      <Select
        label="Status"
        placeholder="All statuses"
        options={[
          { value: 'active', label: 'Active' },
          { value: 'inactive', label: 'Inactive' },
        ]}
        value={filters.status ?? ''}
        onChange={(e) =>
          onChange({
            ...filters,
            status: (e.target.value as 'active' | 'inactive') || undefined,
            page: 1,
          })
        }
      />
    </div>
  )
}
