import { adminEmployeesApi } from '@/api/admin/employees.api'
import { adminDepartmentsApi } from '@/api/admin/departments.api'
import { adminLeavesApi } from '@/api/admin/leaves.api'
import { employeeLeavesApi } from '@/api/employee/leaves.api'
import { getLeaveStartDate, getLeaveEndDate, type Leave } from '@/api/types/leave'
import { ROLES, type Role } from '@/lib/constants'
import { formatDate, statusLabel } from '@/lib/format'

export type GlobalSearchResultKind = 'employee' | 'department' | 'leave'

export interface GlobalSearchResult {
  kind: GlobalSearchResultKind
  id: number
  title: string
  subtitle: string
  href: string
}

function matchesLeave(leave: Leave, q: string): boolean {
  const lower = q.toLowerCase()
  const name = leave.employee?.name?.toLowerCase() ?? ''
  const empId = leave.employee?.employee_id?.toLowerCase() ?? ''
  const reason = leave.reason?.toLowerCase() ?? ''
  const type = leave.type?.toLowerCase() ?? ''
  return name.includes(lower) || empId.includes(lower) || reason.includes(lower) || type.includes(lower)
}

function leaveToResult(leave: Leave, admin: boolean): GlobalSearchResult {
  const start = getLeaveStartDate(leave)
  const end = getLeaveEndDate(leave)
  const range = start && end ? `${formatDate(start)} – ${formatDate(end)}` : '—'
  return {
    kind: 'leave',
    id: leave.id,
    title: admin ? (leave.employee?.name ?? `Leave #${leave.id}`) : `${statusLabel(leave.type)} leave`,
    subtitle: admin
      ? `${statusLabel(leave.status)} · ${range}`
      : `${statusLabel(leave.status)} · ${range}`,
    href: admin ? `/admin/leaves/${leave.id}` : '/employee/leaves',
  }
}

export async function searchGlobal(query: string, role: Role): Promise<GlobalSearchResult[]> {
  const q = query.trim()
  if (q.length < 2) return []

  if (role === ROLES.ADMIN) {
    const [employeesRes, departmentsRes, leavesRes] = await Promise.all([
      adminEmployeesApi.list({ search: q, per_page: 5 }),
      adminDepartmentsApi.list({ search: q, per_page: 5 }),
      adminLeavesApi.list({ per_page: 100 }),
    ])

    const employeeResults: GlobalSearchResult[] = (employeesRes.items ?? []).map((emp) => ({
      kind: 'employee',
      id: emp.id,
      title: emp.name,
      subtitle: [emp.employee_id, emp.department?.name].filter(Boolean).join(' · '),
      href: `/admin/employees/${emp.id}`,
    }))

    const departmentResults: GlobalSearchResult[] = (departmentsRes.items ?? []).map((dept) => ({
      kind: 'department',
      id: dept.id,
      title: dept.name,
      subtitle: dept.description ?? `${dept.employees_count ?? 0} employees`,
      href: `/admin/departments?search=${encodeURIComponent(dept.name)}`,
    }))

    const leaveResults: GlobalSearchResult[] = (leavesRes.items ?? [])
      .filter((leave) => matchesLeave(leave, q))
      .slice(0, 5)
      .map((leave) => leaveToResult(leave, true))

    return [...employeeResults, ...departmentResults, ...leaveResults]
  }

  const leavesRes = await employeeLeavesApi.list({ per_page: 100 })
  return (leavesRes.leaves.items ?? [])
    .filter((leave) => matchesLeave(leave, q))
    .slice(0, 8)
    .map((leave) => leaveToResult(leave, false))
}
