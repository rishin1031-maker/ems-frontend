import { useState } from 'react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Badge } from '@/components/ui/Badge'
import { Pagination } from '@/components/ui/Pagination'
import { TableSkeleton } from '@/components/ui/Skeleton'
import {
  Table, TableHead, TableBody, TableRow, TableHeader, TableCell,
} from '@/components/ui/Table'
import { EmptyState } from '@/components/feedback/EmptyState'
import { useActivityLogs } from '@/features/admin/activity-log/hooks/useActivityLogs'
import { ACTIVITY_EVENTS, type ActivityLogListParams } from '@/api/admin/activityLogs.api'
import { formatDateTime, statusLabel } from '@/lib/format'

const EVENT_VARIANT: Record<string, 'success' | 'warning' | 'danger' | 'info' | 'default'> = {
  created: 'success',
  updated: 'info',
  deleted: 'danger',
  login: 'default',
  logout: 'default',
}

export function ActivityLogPage() {
  const [params, setParams] = useState<ActivityLogListParams>({ page: 1, per_page: 25 })

  const { data, isLoading } = useActivityLogs(params)
  const items = data?.items ?? []

  return (
    <div>
      <PageHeader
        title="Activity Log"
        description="Audit trail of creates, updates, deletes, and logins"
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Input
          label="Search"
          placeholder="Description or event…"
          value={params.search ?? ''}
          onChange={(e) => setParams({ ...params, search: e.target.value || undefined, page: 1 })}
        />
        <Select
          label="Event"
          placeholder="All events"
          options={ACTIVITY_EVENTS.map((e) => ({ value: e, label: statusLabel(e) }))}
          value={params.event ?? ''}
          onChange={(e) => setParams({ ...params, event: e.target.value || undefined, page: 1 })}
        />
        <Input
          label="From date"
          type="date"
          value={params.from_date ?? ''}
          onChange={(e) => setParams({ ...params, from_date: e.target.value || undefined, page: 1 })}
        />
        <Input
          label="To date"
          type="date"
          value={params.to_date ?? ''}
          onChange={(e) => setParams({ ...params, to_date: e.target.value || undefined, page: 1 })}
        />
      </div>

      {isLoading ? (
        <TableSkeleton rows={8} cols={5} />
      ) : items.length === 0 ? (
        <EmptyState
          title="No activity yet"
          description="System events will appear here as users take actions."
        />
      ) : (
        <>
          <div className="overflow-hidden rounded-2xl glass-card">
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeader>When</TableHeader>
                  <TableHeader>Event</TableHeader>
                  <TableHeader>Description</TableHeader>
                  <TableHeader>User</TableHeader>
                  <TableHeader>Subject</TableHeader>
                </TableRow>
              </TableHead>
              <TableBody>
                {items.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="whitespace-nowrap text-xs text-slate-500">
                      {log.created_at ? formatDateTime(log.created_at) : '—'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={EVENT_VARIANT[log.event] ?? 'default'}>{statusLabel(log.event)}</Badge>
                    </TableCell>
                    <TableCell className="max-w-xs text-sm">{log.description}</TableCell>
                    <TableCell className="text-sm">
                      {log.causer_name ?? '—'}
                      {log.causer_type && (
                        <span className="ml-1 text-xs text-slate-400">({log.causer_type})</span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-slate-500">
                      {log.subject_label ?? (log.subject_type ? `${log.subject_type} #${log.subject_id}` : '—')}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {data?.meta && data.meta.last_page > 1 && (
            <div className="mt-4">
              <Pagination meta={data.meta} onPageChange={(page) => setParams((p) => ({ ...p, page }))} />
            </div>
          )}
        </>
      )}
    </div>
  )
}
