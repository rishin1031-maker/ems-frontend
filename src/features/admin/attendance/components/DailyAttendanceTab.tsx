import { useState, useEffect, useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Coffee, X } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { Badge, statusToBadgeVariant } from '@/components/ui/Badge'
import { PageLoader } from '@/components/ui/Spinner'
import {
  Table, TableHead, TableBody, TableRow, TableHeader, TableCell,
} from '@/components/ui/Table'
import { EmptyState } from '@/components/feedback/EmptyState'
import { useDailyAttendance, useLiveStatus } from '@/features/admin/attendance/hooks/useAttendance'
import { useAdminAttendanceMutations } from '@/features/admin/attendance/hooks/useAdminAttendanceMutations'
import { useDepartmentOptions } from '@/features/admin/departments/hooks/useDepartments'
import { useDesignationOptions } from '@/features/admin/designations/hooks/useDesignations'
import { useToast } from '@/components/feedback/ToastContext'
import { useLiveTimer } from '@/hooks/useLiveTimer'
import { useLiveBreakTimer } from '@/hooks/useLiveBreakTimer'
import { adminAttendanceApi } from '@/api/admin/attendance.api'
import { formatDateTime, formatLiveTimer, statusLabel, todayISO } from '@/lib/format'
import type { DailyAttendanceParams, DailyAttendanceRecord } from '@/api/types/attendance'
import { ATTENDANCE_STATUSES, TARGET_WORK_SECONDS } from '@/lib/constants'

function toTimeValue(iso?: string | null): string {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

function formatTimeShort(iso?: string | null): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
}

function LiveRowStats({
  employeeId,
  date,
  worker,
}: {
  employeeId: number
  date: string
  worker?: { net_seconds: number; total_break_seconds?: number; break_seconds?: number; is_on_break?: boolean }
}) {
  const queryClient = useQueryClient()

  const fetchWorker = useCallback(async () => {
    const live = await queryClient.fetchQuery({
      queryKey: ['admin', 'attendance', 'live-status', date],
      queryFn: () => adminAttendanceApi.liveStatus({ date }),
    })
    return live.employees.find((e) => e.employee_id === employeeId) ?? null
  }, [queryClient, employeeId, date])

  const workPoll = useCallback(async () => {
    const found = await fetchWorker()
    return found ? { net_seconds: found.net_seconds, is_on_break: found.is_on_break } : null
  }, [fetchWorker])

  const breakPoll = useCallback(async () => {
    const found = await fetchWorker()
    return found
      ? { total_break_seconds: found.total_break_seconds ?? found.break_seconds ?? 0, is_on_break: found.is_on_break }
      : null
  }, [fetchWorker])

  const workSeconds = useLiveTimer(
    worker ? { net_seconds: worker.net_seconds, is_on_break: worker.is_on_break } : null,
    workPoll,
  )
  const breakSeconds = useLiveBreakTimer(
    worker
      ? { total_break_seconds: worker.total_break_seconds ?? worker.break_seconds ?? 0, is_on_break: worker.is_on_break }
      : null,
    breakPoll,
  )

  if (!worker) return null

  return (
    <div className="mt-2 space-y-1 text-left">
      <p className={`font-mono text-lg font-bold ${worker.is_on_break ? 'text-orange-400' : 'text-indigo-600'}`}>
        {formatLiveTimer(workSeconds)}
      </p>
      <p className="text-xs text-gray-500">
        Break: <span className="font-medium text-orange-500">{formatLiveTimer(breakSeconds)}</span>
      </p>
      <p className={`text-xs font-medium ${worker.is_on_break ? 'text-orange-500' : 'text-blue-600'}`}>
        {worker.is_on_break ? 'On break' : 'Working'}
      </p>
      <p className="text-xs text-gray-400">
        Target: 8h · {Math.min(100, Math.round((workSeconds / TARGET_WORK_SECONDS) * 100))}%
      </p>
    </div>
  )
}

function AttendanceManageRow({
  row,
  date,
  isToday,
  liveWorker,
}: {
  row: DailyAttendanceRecord
  date: string
  isToday: boolean
  liveWorker?: { net_seconds: number; total_break_seconds?: number; break_seconds?: number; is_on_break?: boolean }
}) {
  const { mark, addBreak, deleteBreak } = useAdminAttendanceMutations()
  const { success, error: toastError } = useToast()
  const [status, setStatus] = useState(row.status)
  const [checkIn, setCheckIn] = useState(toTimeValue(row.check_in))
  const [checkOut, setCheckOut] = useState(toTimeValue(row.check_out))
  const [breakOut, setBreakOut] = useState('')
  const [breakIn, setBreakIn] = useState('')

  useEffect(() => {
    setStatus(row.status)
    setCheckIn(toTimeValue(row.check_in))
    setCheckOut(toTimeValue(row.check_out))
  }, [row])

  const isWorkingLive = isToday && row.check_in && !row.check_out

  const handleMark = async () => {
    try {
      await mark.mutateAsync({
        employee_id: row.employee_id,
        date,
        status,
        check_in: checkIn || undefined,
        check_out: checkOut || undefined,
      })
      success('Attendance saved')
    } catch (err) {
      toastError((err as Error).message ?? 'Failed to save attendance')
    }
  }

  const handleAddBreak = async () => {
    if (!row.id || !breakOut) {
      toastError('Break start time is required')
      return
    }
    try {
      await addBreak.mutateAsync({
        attendance_id: row.id,
        break_out: breakOut,
        break_in: breakIn || undefined,
      })
      success('Break added')
      setBreakOut('')
      setBreakIn('')
    } catch (err) {
      toastError((err as Error).message ?? 'Failed to add break')
    }
  }

  const handleDeleteBreak = async (breakId: number) => {
    try {
      await deleteBreak.mutateAsync(breakId)
      success('Break removed')
    } catch (err) {
      toastError((err as Error).message ?? 'Failed to remove break')
    }
  }

  return (
    <TableRow>
      <TableCell>
        <p className="font-medium">{row.employee?.name ?? '—'}</p>
        <p className="text-xs text-gray-400">{row.employee?.employee_id}</p>
        {(row.employee?.department || row.employee?.designation) && (
          <p className="mt-0.5 text-xs text-gray-500">
            {row.employee?.department?.name ?? '—'}
            {row.employee?.designation ? ` · ${row.employee.designation.name}` : ''}
          </p>
        )}
      </TableCell>

      <TableCell className="text-center">
        {row.id ? (
          <>
            <Badge variant={statusToBadgeVariant(row.status)}>{statusLabel(row.status)}</Badge>
            {row.check_out && row.net_hours_worked != null && (
              <div className="mt-1.5 space-y-0.5 text-xs text-left">
                <p className="text-gray-500">Net: <span className="font-medium text-green-700">{String(row.net_hours_worked)}</span></p>
                {(row.total_break_minutes ?? 0) > 0 && (
                  <p className="text-gray-500">Break: <span className="font-medium text-orange-500">{row.total_break_minutes}m</span></p>
                )}
                {row.is_complete ? (
                  <p className="font-medium text-green-600">Full day</p>
                ) : (
                  <p className="font-medium text-red-500">Short day</p>
                )}
              </div>
            )}
            {isWorkingLive && <LiveRowStats employeeId={row.employee_id} date={date} worker={liveWorker} />}
          </>
        ) : (
          <span className="text-xs text-gray-400">Not marked</span>
        )}
      </TableCell>

      <TableCell className="text-xs">{formatTimeShort(row.check_in)}</TableCell>
      <TableCell className="text-xs">{formatTimeShort(row.check_out)}</TableCell>

      <TableCell className="min-w-[300px]">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as DailyAttendanceRecord['status'])}
              className="rounded-lg border border-gray-300 px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-900"
            >
              {ATTENDANCE_STATUSES.map((s) => (
                <option key={s} value={s}>{statusLabel(s)}</option>
              ))}
            </select>
            <input type="time" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} className="w-24 rounded-lg border border-gray-300 px-2 py-1.5 text-xs dark:border-gray-600 dark:bg-gray-900" title="Check in" />
            <input type="time" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} className="w-24 rounded-lg border border-gray-300 px-2 py-1.5 text-xs dark:border-gray-600 dark:bg-gray-900" title="Check out" />
            <Button size="sm" theme="admin" onClick={handleMark} loading={mark.isPending}>Save</Button>
          </div>

          {row.id && (
            <>
              {(row.breaks ?? []).length > 0 && (
                <div className="space-y-1 pl-1">
                  {(row.breaks ?? []).map((b) => (
                    <div key={b.id} className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300">
                      <Coffee className="h-3 w-3 shrink-0 text-orange-400" />
                      <span>
                        {formatTimeShort(b.break_out)} → {b.break_in ? formatTimeShort(b.break_in) : <span className="font-medium text-orange-500">Ongoing</span>}
                        {b.duration ? <span className="text-gray-400"> ({b.duration})</span> : null}
                      </span>
                      <button type="button" onClick={() => handleDeleteBreak(b.id)} className="ml-1 text-red-400 hover:text-red-600" title="Remove break">
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                  {(row.total_break_minutes ?? 0) > 0 && (
                    <p className="pl-1 text-xs font-medium text-orange-500">
                      Total break: {row.total_break_minutes}m
                      {row.net_hours_worked ? ` | Net: ${String(row.net_hours_worked)}` : ''}
                    </p>
                  )}
                </div>
              )}

              <form
                className="flex flex-wrap items-center gap-2 border-t border-gray-100 pt-2 dark:border-gray-800"
                onSubmit={(e) => { e.preventDefault(); void handleAddBreak() }}
              >
                <span className="text-xs font-medium text-gray-500">
                  <Coffee className="mr-1 inline h-3 w-3 text-orange-400" />
                  Add break:
                </span>
                <input type="time" value={breakOut} onChange={(e) => setBreakOut(e.target.value)} required className="w-24 rounded-lg border border-orange-200 px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-orange-400 dark:border-orange-800 dark:bg-gray-900" title="Break start" />
                <input type="time" value={breakIn} onChange={(e) => setBreakIn(e.target.value)} className="w-24 rounded-lg border border-orange-200 px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-orange-400 dark:border-orange-800 dark:bg-gray-900" title="Break end (optional)" />
                <Button type="submit" size="sm" className="bg-orange-400 hover:bg-orange-500" loading={addBreak.isPending}>
                  Add
                </Button>
              </form>
            </>
          )}
        </div>
      </TableCell>
    </TableRow>
  )
}

export function DailyAttendanceTab() {
  const [params, setParams] = useState<DailyAttendanceParams>({ date: todayISO() })
  const selectedDate = params.date ?? todayISO()
  const isToday = selectedDate === todayISO()
  const { data, isLoading } = useDailyAttendance(params)
  const { data: liveData } = useLiveStatus(isToday ? selectedDate : undefined)
  const liveByEmployee = new Map(
    (liveData?.employees ?? []).map((e) => [e.employee_id, e]),
  )
  const { data: deptData } = useDepartmentOptions()
  const { data: desigData } = useDesignationOptions()

  const deptOptions = (deptData?.items ?? []).map((d) => ({ value: d.id, label: d.name }))
  const desigOptions = (desigData?.items ?? []).map((d) => ({ value: d.id, label: d.name }))

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Input label="Date" type="date" value={selectedDate} onChange={(e) => setParams({ ...params, date: e.target.value })} />
        <Input label="Search" placeholder="Name or ID..." value={params.search ?? ''} onChange={(e) => setParams({ ...params, search: e.target.value || undefined })} />
        <Select label="Department" placeholder="All" options={deptOptions} value={params.department_id ?? ''} onChange={(e) => setParams({ ...params, department_id: e.target.value ? Number(e.target.value) : undefined })} />
        <Select label="Designation" placeholder="All" options={desigOptions} value={params.designation_id ?? ''} onChange={(e) => setParams({ ...params, designation_id: e.target.value ? Number(e.target.value) : undefined })} />
      </div>

      {isLoading ? (
        <PageLoader />
      ) : !data?.length ? (
        <EmptyState title="No employees found" description="No employees match your filters for this date." />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-100 dark:border-gray-800">
          <Table>
            <TableHead>
              <TableRow>
                <TableHeader>Employee</TableHeader>
                <TableHeader className="text-center">Status &amp; hours</TableHeader>
                <TableHeader>Check in</TableHeader>
                <TableHeader>Check out</TableHeader>
                <TableHeader>Mark / Breaks</TableHeader>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.map((row, i) => (
                <AttendanceManageRow
                  key={row.employee_id ?? i}
                  row={row}
                  date={selectedDate}
                  isToday={isToday}
                  liveWorker={liveByEmployee.get(row.employee_id)}
                />
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
