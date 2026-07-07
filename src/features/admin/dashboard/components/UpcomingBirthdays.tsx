import { Gift } from 'lucide-react'
import { Link } from 'react-router-dom'
import { formatBirthdayLabel, type UpcomingBirthday } from '@/lib/dashboardHelpers'

function AvatarInitials({ name }: { name: string }) {
  const initials = name.split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase()
  return (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-pink-100 text-xs font-semibold text-pink-700 dark:bg-pink-950/50 dark:text-pink-300">
      {initials}
    </div>
  )
}

interface UpcomingBirthdaysProps {
  items: UpcomingBirthday[]
}

export function UpcomingBirthdays({ items }: UpcomingBirthdaysProps) {
  if (!items.length) {
    return (
      <p className="py-8 text-center text-sm text-slate-400">
        No upcoming birthdays in the next 60 days
      </p>
    )
  }

  return (
    <ul className="space-y-3">
      {items.map(({ employee, displayDate, daysUntil, isToday }) => (
        <li key={employee.id}>
          <Link
            to={`/admin/employees/${employee.id}`}
            className="flex items-center gap-3 rounded-xl p-2 transition hover:bg-slate-50 dark:hover:bg-slate-800/50"
          >
            <AvatarInitials name={employee.name} />
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium text-slate-900 dark:text-slate-100">{employee.name}</p>
              <p className="truncate text-xs text-slate-500">
                {employee.designation?.name ?? employee.department?.name ?? 'Employee'}
              </p>
            </div>
            <div className="shrink-0 text-right">
              <p className={`text-xs font-medium ${isToday ? 'text-pink-600' : 'text-slate-600 dark:text-slate-400'}`}>
                {formatBirthdayLabel(daysUntil, displayDate)}
              </p>
              <Gift className="ml-auto mt-1 h-4 w-4 text-blue-500" />
            </div>
          </Link>
        </li>
      ))}
    </ul>
  )
}
