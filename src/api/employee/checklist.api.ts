import { apiDelete, apiGet, apiPatch, apiPost } from '@/api/client'
import type {
  CreateChecklistItemPayload,
  DailyChecklistItem,
  DailyChecklistSummary,
  UpdateChecklistItemPayload,
} from '@/api/types/checklist'

function normalizeItem(raw: Record<string, unknown>): DailyChecklistItem {
  return {
    id: Number(raw.id),
    employee_id: Number(raw.employee_id),
    task_date: String(raw.task_date ?? ''),
    title: String(raw.title ?? ''),
    is_completed: Boolean(raw.is_completed),
    completed_at: (raw.completed_at as string) ?? null,
    sort_order: Number(raw.sort_order ?? 0),
    created_at: raw.created_at as string | undefined,
    updated_at: raw.updated_at as string | undefined,
  }
}

function normalizeSummary(raw: Record<string, unknown>): DailyChecklistSummary {
  const items = Array.isArray(raw.items)
    ? (raw.items as Record<string, unknown>[]).map(normalizeItem)
    : []

  return {
    date: String(raw.date ?? ''),
    total: Number(raw.total ?? items.length),
    completed: Number(raw.completed ?? items.filter((i) => i.is_completed).length),
    pending: Number(raw.pending ?? items.filter((i) => !i.is_completed).length),
    items,
  }
}

export const employeeChecklistApi = {
  list: async (params?: { date?: string }): Promise<DailyChecklistSummary> => {
    const raw = await apiGet<Record<string, unknown>>(
      '/employee/checklist',
      params as Record<string, unknown>,
    )
    return normalizeSummary(raw)
  },

  create: async (payload: CreateChecklistItemPayload): Promise<DailyChecklistItem> => {
    const raw = await apiPost<Record<string, unknown>>('/employee/checklist', payload)
    return normalizeItem(raw)
  },

  update: async (
    id: number | string,
    payload: UpdateChecklistItemPayload,
  ): Promise<DailyChecklistItem> => {
    const raw = await apiPatch<Record<string, unknown>>(`/employee/checklist/${id}`, payload)
    return normalizeItem(raw)
  },

  toggle: async (id: number | string): Promise<DailyChecklistItem> => {
    const raw = await apiPost<Record<string, unknown>>(`/employee/checklist/${id}/toggle`)
    return normalizeItem(raw)
  },

  remove: (id: number | string) => apiDelete<null>(`/employee/checklist/${id}`),
}
