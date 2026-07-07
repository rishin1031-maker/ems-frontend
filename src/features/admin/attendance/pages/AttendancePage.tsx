import { useState } from 'react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Tabs } from '@/components/ui/Tabs'
import { DailyAttendanceTab } from '@/features/admin/attendance/components/DailyAttendanceTab'
import { MonthlyAttendanceTab } from '@/features/admin/attendance/components/MonthlyAttendanceTab'
import { AnalyticsAttendanceTab } from '@/features/admin/attendance/components/AnalyticsAttendanceTab'
import { TeamPresenceBoard } from '@/components/attendance/TeamPresenceBoard'

const TABS = [
  { id: 'daily', label: 'Daily' },
  { id: 'live', label: "Who's In" },
  { id: 'monthly', label: 'Monthly' },
  { id: 'analytics', label: 'Analytics' },
]

export function AttendancePage() {
  const [activeTab, setActiveTab] = useState('daily')

  return (
    <div>
      <PageHeader title="Attendance" description="Daily records, monthly reports, and analytics" />
      <Tabs tabs={TABS} active={activeTab} onChange={setActiveTab} className="mb-6" />
      {activeTab === 'daily' && <DailyAttendanceTab />}
      {activeTab === 'live' && <TeamPresenceBoard />}
      {activeTab === 'monthly' && <MonthlyAttendanceTab />}
      {activeTab === 'analytics' && <AnalyticsAttendanceTab />}
    </div>
  )
}
