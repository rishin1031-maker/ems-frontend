import { useMemo, useState } from 'react'
import { Plus } from 'lucide-react'
import { cn } from '@/lib/cn'
import { useDepartmentOptions } from '@/features/admin/departments/hooks/useDepartments'
import { useDesignationOptions } from '@/features/admin/designations/hooks/useDesignations'
import { DepartmentFormModal } from '@/features/admin/departments/components/DepartmentFormModal'
import { DesignationFormModal } from '@/features/admin/designations/components/DesignationFormModal'
import type { Department } from '@/api/types/department'
import type { Designation } from '@/api/types/designation'

interface EmployeeDeptDesigFieldsProps {
  departmentId?: number
  designationId?: number
  onDepartmentChange: (id: number | '') => void
  onDesignationChange: (id: number | '') => void
  departmentError?: string
  designationError?: string
}

function mergeById<T extends { id: number }>(base: T[], extras: T[]): T[] {
  const merged = [...base]
  for (const item of extras) {
    if (!merged.some((x) => x.id === item.id)) merged.push(item)
  }
  return merged
}

export function EmployeeDeptDesigFields({
  departmentId,
  designationId,
  onDepartmentChange,
  onDesignationChange,
  departmentError,
  designationError,
}: EmployeeDeptDesigFieldsProps) {
  const { data: deptData } = useDepartmentOptions()
  const { data: desigData } = useDesignationOptions()

  const [deptModalOpen, setDeptModalOpen] = useState(false)
  const [desigModalOpen, setDesigModalOpen] = useState(false)
  const [extraDepts, setExtraDepts] = useState<Department[]>([])
  const [extraDesigs, setExtraDesigs] = useState<Designation[]>([])

  const departments = useMemo(
    () => mergeById(deptData?.items ?? [], extraDepts),
    [deptData?.items, extraDepts],
  )

  const allDesignations = useMemo(
    () => mergeById(desigData?.items ?? [], extraDesigs),
    [desigData?.items, extraDesigs],
  )

  const activeDeptId = departmentId && departmentId > 0 ? departmentId : undefined

  const filteredDesignations = useMemo(
    () =>
      allDesignations.filter(
        (d) => !activeDeptId || d.department_id === activeDeptId,
      ),
    [allDesignations, activeDeptId],
  )

  const deptOptions = departments.map((d) => ({ value: d.id, label: d.name }))
  const desigOptions = filteredDesignations.map((d) => ({
    value: d.id,
    label: activeDeptId ? d.name : d.department_name ? `${d.name} (${d.department_name})` : d.name,
  }))

  const handleDepartmentChange = (value: string) => {
    const nextDeptId = value ? Number(value) : ('' as const)
    onDepartmentChange(nextDeptId)

    if (nextDeptId && designationId && designationId > 0) {
      const currentDesig = allDesignations.find((d) => d.id === designationId)
      if (currentDesig && currentDesig.department_id !== nextDeptId) {
        onDesignationChange('')
      }
    }
  }

  const handleDesignationChange = (value: string) => {
    const nextDesigId = value ? Number(value) : ('' as const)
    onDesignationChange(nextDesigId)

    if (nextDesigId) {
      const desig = allDesignations.find((d) => d.id === nextDesigId)
      if (desig?.department_id && desig.department_id !== activeDeptId) {
        onDepartmentChange(desig.department_id)
      }
    }
  }

  const handleDepartmentCreated = (dept: Department) => {
    setExtraDepts((prev) => [...prev, dept])
    onDepartmentChange(dept.id)
    onDesignationChange('')
  }

  const handleDesignationCreated = (desig: Designation) => {
    setExtraDesigs((prev) => [...prev, desig])
    if (desig.department_id) onDepartmentChange(desig.department_id)
    onDesignationChange(desig.id)
  }

  const selectClass = (hasError?: boolean) =>
    cn(
      'flex h-10 w-full rounded-lg border bg-white px-3 py-2 text-sm',
      'focus:outline-none focus:ring-2 focus:ring-offset-1 dark:bg-gray-900',
      hasError
        ? 'border-red-500 focus:ring-red-500'
        : 'border-gray-300 focus:ring-indigo-500 dark:border-gray-600',
    )

  return (
    <>
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label htmlFor="employee-department" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Department
          </label>
          <button
            type="button"
            onClick={() => setDeptModalOpen(true)}
            className="flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300"
          >
            <Plus className="h-3 w-3" />
            Add new
          </button>
        </div>
        <select
          id="employee-department"
          value={activeDeptId ?? ''}
          onChange={(e) => handleDepartmentChange(e.target.value)}
          className={selectClass(Boolean(departmentError))}
        >
          <option value="">Select department</option>
          {deptOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {departmentError && <p className="text-xs text-red-600 dark:text-red-400">{departmentError}</p>}
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label htmlFor="employee-designation" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Designation
          </label>
          <button
            type="button"
            onClick={() => setDesigModalOpen(true)}
            className="flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300"
          >
            <Plus className="h-3 w-3" />
            Add new
          </button>
        </div>
        <select
          id="employee-designation"
          value={designationId && designationId > 0 ? designationId : ''}
          onChange={(e) => handleDesignationChange(e.target.value)}
          className={selectClass(Boolean(designationError))}
        >
          <option value="">Select designation</option>
          {desigOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {designationError && <p className="text-xs text-red-600 dark:text-red-400">{designationError}</p>}
        {activeDeptId && desigOptions.length === 0 && (
          <p className="text-xs text-gray-500">No designations in this department yet. Add one above.</p>
        )}
      </div>

      <DepartmentFormModal
        open={deptModalOpen}
        onClose={() => setDeptModalOpen(false)}
        onCreated={handleDepartmentCreated}
      />

      <DesignationFormModal
        open={desigModalOpen}
        onClose={() => setDesigModalOpen(false)}
        defaultDepartmentId={activeDeptId}
        onCreated={handleDesignationCreated}
      />
    </>
  )
}
