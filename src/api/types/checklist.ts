export interface DailyChecklistItem {
  id: number
  employee_id: number
  task_date: string
  title: string
  is_completed: boolean
  completed_at?: string | null
  sort_order: number
  created_at?: string
  updated_at?: string
}

export interface DailyChecklistSummary {
  date: string
  total: number
  completed: number
  pending: number
  items: DailyChecklistItem[]
}

export interface CreateChecklistItemPayload {
  title: string
  task_date?: string
}

export interface UpdateChecklistItemPayload {
  title?: string
  is_completed?: boolean
}
