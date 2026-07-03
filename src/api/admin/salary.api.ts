import { apiGet, apiPost } from '@/api/client'
import {
  normalizePayrollReport,
  normalizeSalaryListRow,
  filterPayrollBySearch,
  type EmployeeSalaryDetail,
  type PayrollParams,
  type PayrollReport,
  type SalaryListParams,
  type SalaryListResponse,
  type UpdateSalaryPayload,
} from '@/api/types/salary'

export const adminSalaryApi = {
  list: async (params?: SalaryListParams): Promise<SalaryListResponse> => {
    const raw = await apiGet<{ items: unknown[]; meta: SalaryListResponse['meta'] }>(
      '/admin/salary',
      params as Record<string, unknown>,
    )
    return {
      items: (raw.items ?? []).map(normalizeSalaryListRow),
      meta: raw.meta,
    }
  },

  get: (employeeId: number | string) =>
    apiGet<EmployeeSalaryDetail>(`/admin/salary/${employeeId}`),

  update: (employeeId: number | string, payload: UpdateSalaryPayload) =>
    apiPost<EmployeeSalaryDetail>(`/admin/salary/${employeeId}`, payload),
}

export const adminPayrollApi = {
  get: async (params?: PayrollParams): Promise<PayrollReport> => {
    const raw = await apiGet<unknown>('/admin/payroll', params as Record<string, unknown>)
    const report = normalizePayrollReport(raw)
    if (params?.search) {
      return { ...report, items: filterPayrollBySearch(report.items, params.search) }
    }
    return report
  },
}
