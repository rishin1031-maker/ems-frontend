import { useMutation, useQueryClient } from '@tanstack/react-query'
import { adminAttendanceApi } from '@/api/admin/attendance.api'
import type { AddBreakPayload, MarkAttendancePayload } from '@/api/types/attendance'

export function useAdminAttendanceMutations() {
  const qc = useQueryClient()

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['admin', 'attendance'] })
  }

  const mark = useMutation({
    mutationFn: (payload: MarkAttendancePayload) => adminAttendanceApi.mark(payload),
    onSuccess: invalidate,
  })

  const addBreak = useMutation({
    mutationFn: (payload: AddBreakPayload) => adminAttendanceApi.addBreak(payload),
    onSuccess: invalidate,
  })

  const deleteBreak = useMutation({
    mutationFn: (id: number | string) => adminAttendanceApi.deleteBreak(id),
    onSuccess: invalidate,
  })

  return { mark, addBreak, deleteBreak }
}
