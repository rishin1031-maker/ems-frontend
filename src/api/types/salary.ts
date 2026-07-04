import type { PaginatedResponse, PaginationParams } from './auth'

export interface SalaryEmployee {
  id: number
  employee_id: string
  name: string
  email?: string
  department?: { id: number; name: string } | null
  designation?: { id: number; name: string } | null
}

export interface SalaryBreakdown {
  id?: number
  basic?: number
  hra?: number
  transport?: number
  medical?: number
  other_allowance?: number
  pf_deduction?: number
  tax_deduction?: number
  other_deduction?: number
  gross_salary?: number
  net_salary?: number
  effective_from?: string
  note?: string | null
  created_at?: string
}

export interface SalaryHistoryEntry {
  id: number
  basic?: number
  gross_salary?: number
  net_salary?: number
  effective_from?: string
  note?: string | null
  created_at?: string
}

export interface SalaryListRow {
  employee: SalaryEmployee
  salary: SalaryBreakdown | null
}

export interface SalaryListParams extends PaginationParams {
  month?: string
  search?: string
}

export interface EmployeeSalaryDetail {
  employee: SalaryEmployee
  current: SalaryBreakdown | null
  history: SalaryHistoryEntry[]
}

export interface UpdateSalaryPayload {
  basic: number
  hra?: number
  transport?: number
  medical?: number
  other_allowance?: number
  pf_deduction?: number
  tax_deduction?: number
  other_deduction?: number
  effective_from: string
  note?: string
}

export type SalaryListResponse = PaginatedResponse<SalaryListRow>

export interface PayrollEmployeeRow {
  employee_id: number
  employee?: SalaryEmployee
  name?: string
  emp_code?: string
  department?: string
  base_salary?: number | string
  base_net?: number | string
  earned_amount?: number | string
  earned_net?: number | string
  earned_gross?: number | string
  net_work_hours?: number | string
  work_hours?: number | string
  target_hours?: number
  progress_percent?: number
  is_full_month?: boolean
  total?: number | string
  status?: string
}

export interface PayrollReport {
  month?: string
  year?: number
  items: PayrollEmployeeRow[]
  summary?: {
    total_payroll?: number | string
    total_amount?: number | string
    total_earned_net?: number | string
    total_employees?: number
    employee_count?: number
    avg_hours?: number | string
    average_hours?: number | string
    [key: string]: unknown
  }
}

export interface PayrollParams {
  month?: string
  search?: string
}

function asRecord(value: unknown): Record<string, unknown> {
  return value != null && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {}
}

export function normalizeSalaryListRow(raw: unknown): SalaryListRow {
  const row = asRecord(raw)
  const employeeRaw = asRecord(row.employee)
  const salaryRaw = row.salary != null ? asRecord(row.salary) : null

  return {
    employee: {
      id: Number(employeeRaw.id),
      employee_id: String(employeeRaw.employee_id ?? ''),
      name: String(employeeRaw.name ?? ''),
      email: employeeRaw.email as string | undefined,
      department: employeeRaw.department as SalaryEmployee['department'],
      designation: employeeRaw.designation as SalaryEmployee['designation'],
    },
    salary: salaryRaw
      ? {
          id: salaryRaw.id as number | undefined,
          basic: salaryRaw.basic as number | undefined,
          hra: salaryRaw.hra as number | undefined,
          transport: salaryRaw.transport as number | undefined,
          medical: salaryRaw.medical as number | undefined,
          other_allowance: salaryRaw.other_allowance as number | undefined,
          pf_deduction: salaryRaw.pf_deduction as number | undefined,
          tax_deduction: salaryRaw.tax_deduction as number | undefined,
          other_deduction: salaryRaw.other_deduction as number | undefined,
          gross_salary: salaryRaw.gross_salary as number | undefined,
          net_salary: salaryRaw.net_salary as number | undefined,
          effective_from: salaryRaw.effective_from as string | undefined,
          note: salaryRaw.note as string | null | undefined,
        }
      : null,
  }
}

export function normalizePayrollRow(raw: unknown): PayrollEmployeeRow {
  const row = asRecord(raw)
  const employeeRaw = asRecord(row.employee)
  const hasEmployee = Object.keys(employeeRaw).length > 0

  const employee: SalaryEmployee | undefined = hasEmployee
    ? {
        id: Number(employeeRaw.id ?? row.employee_id ?? row.id),
        employee_id: String(employeeRaw.employee_id ?? row.emp_code ?? ''),
        name: String(employeeRaw.name ?? row.name ?? ''),
        email: employeeRaw.email as string | undefined,
        department: employeeRaw.department as SalaryEmployee['department'],
        designation: employeeRaw.designation as SalaryEmployee['designation'],
      }
    : row.name
      ? {
          id: Number(row.employee_id ?? row.id ?? 0),
          employee_id: String(row.emp_code ?? row.employee_id ?? ''),
          name: String(row.name ?? ''),
        }
      : undefined

  const deptName =
    typeof row.department === 'string'
      ? row.department
      : employee?.department?.name

  return {
    employee_id: Number(row.employee_id ?? employee?.id ?? row.id ?? 0),
    employee: employee
      ? { ...employee, department: deptName ? { id: 0, name: deptName } : employee.department }
      : undefined,
    name: row.name as string | undefined,
    emp_code: row.emp_code as string | undefined,
    department: deptName,
    base_salary: (row.base_salary ?? row.base_net ?? row.salary) as number | string | undefined,
    base_net: row.base_net as number | string | undefined,
    earned_amount: (row.earned_amount ?? row.earned_net ?? row.earned) as number | string | undefined,
    earned_net: row.earned_net as number | string | undefined,
    earned_gross: row.earned_gross as number | string | undefined,
    net_work_hours: (row.net_work_hours ?? row.work_hours) as number | string | undefined,
    work_hours: row.work_hours as number | string | undefined,
    target_hours: (row.target_hours ?? row.target_hours) as number | undefined,
    progress_percent: row.progress_percent as number | undefined,
    is_full_month: row.is_full_month as boolean | undefined,
    total: (row.total ?? row.earned_net ?? row.net) as number | string | undefined,
    status: row.status as string | undefined,
  }
}

export function normalizePayrollReport(raw: unknown): PayrollReport {
  if (Array.isArray(raw)) {
    return { month: undefined, items: raw.map(normalizePayrollRow) }
  }

  const data = asRecord(raw)
  const itemsRaw =
    data.earnedPayroll ??
    data.employeeSalaries ??
    data.items ??
    data.employees ??
    data.records ??
    []
  const items = Array.isArray(itemsRaw) ? itemsRaw.map(normalizePayrollRow) : []
  const summaryRaw = asRecord(data.summary)

  return {
    month: data.month != null ? String(data.month) : undefined,
    year: data.year as number | undefined,
    items,
    summary: {
      ...summaryRaw,
      total_payroll: (summaryRaw.total_payroll ??
        summaryRaw.total_amount ??
        data.totalEarnedNet ??
        data.total_earned_net) as number | string | undefined,
      total_employees: (summaryRaw.total_employees ?? summaryRaw.employee_count ?? items.length) as
        | number
        | undefined,
      avg_hours: (summaryRaw.avg_hours ?? summaryRaw.average_hours) as number | string | undefined,
    },
  }
}

export function getPayrollTotalPayroll(summary: PayrollReport['summary']): number | string | undefined {
  return summary?.total_payroll ?? summary?.total_amount ?? summary?.total_earned_net
}

export function getPayrollEmployeeCount(
  summary: PayrollReport['summary'],
  items: PayrollEmployeeRow[],
): number | undefined {
  return summary?.total_employees ?? summary?.employee_count ?? (items.length > 0 ? items.length : undefined)
}

export function getPayrollAvgHours(summary: PayrollReport['summary']): number | string | undefined {
  return summary?.avg_hours ?? summary?.average_hours
}

export function getSalaryNetHours(row: PayrollEmployeeRow | { net_work_hours?: number | string; work_hours?: number | string }): number {
  const raw = row.net_work_hours ?? row.work_hours ?? (row as Record<string, unknown>).net_hours
  const n = typeof raw === 'string' ? parseFloat(raw) : Number(raw ?? 0)
  return Number.isNaN(n) ? 0 : n
}

export function getSalaryEarned(row: PayrollEmployeeRow): number | string | undefined {
  const r = row as Record<string, unknown>
  return row.earned_amount ?? row.earned_net ?? (r.earned as number | string | undefined)
}

export function getSalaryTotal(row: PayrollEmployeeRow): number | string | undefined {
  const r = row as Record<string, unknown>
  return row.total ?? row.earned_net ?? (r.net as number | string | undefined)
}

export function getSalaryBase(row: PayrollEmployeeRow | SalaryListRow): number | string | undefined {
  if ('salary' in row && row.salary) {
    return row.salary.net_salary ?? row.salary.basic
  }
  const r = row as PayrollEmployeeRow
  return r.base_salary ?? r.base_net
}

export function getSalaryEmployeeId(row: PayrollEmployeeRow | SalaryListRow): number {
  if ('employee' in row) return row.employee.id
  return row.employee_id ?? row.employee?.id ?? 0
}

export function buildPayrollEarnedMap(items: PayrollEmployeeRow[]): Map<number, PayrollEmployeeRow> {
  const map = new Map<number, PayrollEmployeeRow>()
  for (const item of items) {
    const id = getSalaryEmployeeId(item)
    if (id) map.set(id, item)
  }
  return map
}

export function employeeHasSalary(row: SalaryListRow): boolean {
  return row.salary != null && (row.salary.net_salary != null || row.salary.basic != null)
}

export function filterPayrollBySearch(items: PayrollEmployeeRow[], search?: string): PayrollEmployeeRow[] {
  if (!search?.trim()) return items
  const q = search.toLowerCase()
  return items.filter((row) => {
    const name = row.employee?.name ?? row.name ?? ''
    const code = row.employee?.employee_id ?? row.emp_code ?? ''
    const dept = row.department ?? row.employee?.department?.name ?? ''
    return name.toLowerCase().includes(q) || code.toLowerCase().includes(q) || dept.toLowerCase().includes(q)
  })
}
