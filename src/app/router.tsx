import { lazy, Suspense } from 'react'
import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom'
import { AuthProvider } from '@/context/AuthContext'
import {
  ProtectedRoute,
  AdminRoute,
  EmployeeRoute,
  GuestRoute,
} from '@/components/guards/ProtectedRoute'
import { RootRedirect } from '@/components/guards/RootRedirect'
import { NotFoundPage } from '@/components/feedback/NotFoundPage'
import { PageLoader } from '@/components/ui/Spinner'
import { AdminLayout } from '@/features/admin/layout/AdminLayout'
import { EmployeeLayout } from '@/features/employee/layout/EmployeeLayout'
import { LoginPage } from '@/features/auth/pages/LoginPage'
import { ChangePasswordPage } from '@/features/employee/change-password/pages/ChangePasswordPage'

const AdminDashboardPage = lazy(
  () => import('@/features/admin/dashboard/pages/AdminDashboardPage').then((m) => ({ default: m.AdminDashboardPage })),
)
const EmployeeDashboardPage = lazy(
  () => import('@/features/employee/dashboard/pages/EmployeeDashboardPage').then((m) => ({ default: m.EmployeeDashboardPage })),
)
const EmployeesListPage = lazy(
  () => import('@/features/admin/employees/pages/EmployeesListPage').then((m) => ({ default: m.EmployeesListPage })),
)
const EmployeeCreatePage = lazy(
  () => import('@/features/admin/employees/pages/EmployeeCreatePage').then((m) => ({ default: m.EmployeeCreatePage })),
)
const EmployeeEditPage = lazy(
  () => import('@/features/admin/employees/pages/EmployeeEditPage').then((m) => ({ default: m.EmployeeEditPage })),
)
const EmployeeShowPage = lazy(
  () => import('@/features/admin/employees/pages/EmployeeShowPage').then((m) => ({ default: m.EmployeeShowPage })),
)
const DepartmentsPage = lazy(
  () => import('@/features/admin/departments/pages/DepartmentsPage').then((m) => ({ default: m.DepartmentsPage })),
)
const DesignationsPage = lazy(
  () => import('@/features/admin/designations/pages/DesignationsPage').then((m) => ({ default: m.DesignationsPage })),
)
const LeavesListPage = lazy(
  () => import('@/features/admin/leaves/pages/LeavesListPage').then((m) => ({ default: m.LeavesListPage })),
)
const LeaveDetailPage = lazy(
  () => import('@/features/admin/leaves/pages/LeaveDetailPage').then((m) => ({ default: m.LeaveDetailPage })),
)
const AttendancePage = lazy(
  () => import('@/features/admin/attendance/pages/AttendancePage').then((m) => ({ default: m.AttendancePage })),
)
const SalaryListPage = lazy(
  () => import('@/features/admin/salary/pages/SalaryListPage').then((m) => ({ default: m.SalaryListPage })),
)
const EmployeeSalaryPage = lazy(
  () => import('@/features/admin/salary/pages/EmployeeSalaryPage').then((m) => ({ default: m.EmployeeSalaryPage })),
)
const PayrollPage = lazy(
  () => import('@/features/admin/payroll/pages/PayrollPage').then((m) => ({ default: m.PayrollPage })),
)
const ActivityLogPage = lazy(
  () => import('@/features/admin/activity-log/pages/ActivityLogPage').then((m) => ({ default: m.ActivityLogPage })),
)
const ApprovalInboxPage = lazy(
  () => import('@/features/admin/inbox/pages/ApprovalInboxPage').then((m) => ({ default: m.ApprovalInboxPage })),
)
const TeamOverviewPage = lazy(
  () => import('@/features/admin/team/pages/TeamOverviewPage').then((m) => ({ default: m.TeamOverviewPage })),
)
const ProfilePage = lazy(
  () => import('@/features/employee/profile/pages/ProfilePage').then((m) => ({ default: m.ProfilePage })),
)
const AttendanceHistoryPage = lazy(
  () => import('@/features/employee/attendance/pages/AttendanceHistoryPage').then((m) => ({ default: m.AttendanceHistoryPage })),
)
const AttendanceChartsPage = lazy(
  () => import('@/features/employee/attendance/pages/AttendanceChartsPage').then((m) => ({ default: m.AttendanceChartsPage })),
)
const EmployeeLeavesPage = lazy(
  () => import('@/features/employee/leaves/pages/EmployeeLeavesPage').then((m) => ({ default: m.EmployeeLeavesPage })),
)
const ApplyLeavePage = lazy(
  () => import('@/features/employee/leaves/pages/ApplyLeavePage').then((m) => ({ default: m.ApplyLeavePage })),
)
const DailyChecklistPage = lazy(
  () => import('@/features/employee/checklist/pages/DailyChecklistPage').then((m) => ({ default: m.DailyChecklistPage })),
)
const AdminNotificationsPage = lazy(
  () => import('@/features/notifications/pages/index').then((m) => ({ default: m.AdminNotificationsPage })),
)
const EmployeeNotificationsPage = lazy(
  () => import('@/features/notifications/pages/index').then((m) => ({ default: m.EmployeeNotificationsPage })),
)

function Lazy({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<PageLoader />}>{children}</Suspense>
}

export const router = createBrowserRouter([
  {
    element: (
      <AuthProvider>
        <Outlet />
      </AuthProvider>
    ),
    children: [
  {
    path: '/',
    element: <RootRedirect />,
  },
  {
    element: <GuestRoute />,
    children: [{ path: '/login', element: <LoginPage /> }],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AdminRoute />,
        children: [
          {
            path: '/admin',
            element: <AdminLayout />,
            children: [
              { index: true, element: <Navigate to="dashboard" replace /> },
              {
                path: 'dashboard',
                element: (
                  <Lazy>
                    <AdminDashboardPage />
                  </Lazy>
                ),
              },
              {
                path: 'employees',
                element: (
                  <Lazy>
                    <EmployeesListPage />
                  </Lazy>
                ),
              },
              {
                path: 'employees/create',
                element: (
                  <Lazy>
                    <EmployeeCreatePage />
                  </Lazy>
                ),
              },
              {
                path: 'employees/:id/edit',
                element: (
                  <Lazy>
                    <EmployeeEditPage />
                  </Lazy>
                ),
              },
              {
                path: 'employees/:id',
                element: (
                  <Lazy>
                    <EmployeeShowPage />
                  </Lazy>
                ),
              },
              {
                path: 'departments',
                element: (
                  <Lazy>
                    <DepartmentsPage />
                  </Lazy>
                ),
              },
              {
                path: 'designations',
                element: (
                  <Lazy>
                    <DesignationsPage />
                  </Lazy>
                ),
              },
              {
                path: 'leaves',
                element: (
                  <Lazy>
                    <LeavesListPage />
                  </Lazy>
                ),
              },
              {
                path: 'leaves/:id',
                element: (
                  <Lazy>
                    <LeaveDetailPage />
                  </Lazy>
                ),
              },
              {
                path: 'attendance',
                element: (
                  <Lazy>
                    <AttendancePage />
                  </Lazy>
                ),
              },
              {
                path: 'salary',
                element: (
                  <Lazy>
                    <SalaryListPage />
                  </Lazy>
                ),
              },
              {
                path: 'salary/:employeeId',
                element: (
                  <Lazy>
                    <EmployeeSalaryPage />
                  </Lazy>
                ),
              },
              {
                path: 'payroll',
                element: (
                  <Lazy>
                    <PayrollPage />
                  </Lazy>
                ),
              },
              {
                path: 'activity-log',
                element: (
                  <Lazy>
                    <ActivityLogPage />
                  </Lazy>
                ),
              },
              {
                path: 'inbox',
                element: (
                  <Lazy>
                    <ApprovalInboxPage />
                  </Lazy>
                ),
              },
              {
                path: 'team',
                element: (
                  <Lazy>
                    <TeamOverviewPage />
                  </Lazy>
                ),
              },
              {
                path: 'notifications',
                element: (
                  <Lazy>
                    <AdminNotificationsPage />
                  </Lazy>
                ),
              },
            ],
          },
        ],
      },
      {
        path: '/employee/change-password',
        element: <ChangePasswordPage />,
      },
      {
        element: <EmployeeRoute />,
        children: [
          {
            path: '/employee',
            element: <EmployeeLayout />,
            children: [
              { index: true, element: <Navigate to="dashboard" replace /> },
              {
                path: 'dashboard',
                element: (
                  <Lazy>
                    <EmployeeDashboardPage />
                  </Lazy>
                ),
              },
              {
                path: 'profile',
                element: (
                  <Lazy>
                    <ProfilePage />
                  </Lazy>
                ),
              },
              {
                path: 'attendance',
                element: (
                  <Lazy>
                    <AttendanceHistoryPage />
                  </Lazy>
                ),
              },
              {
                path: 'attendance/charts',
                element: (
                  <Lazy>
                    <AttendanceChartsPage />
                  </Lazy>
                ),
              },
              {
                path: 'leaves',
                element: (
                  <Lazy>
                    <EmployeeLeavesPage />
                  </Lazy>
                ),
              },
              {
                path: 'leaves/apply',
                element: (
                  <Lazy>
                    <ApplyLeavePage />
                  </Lazy>
                ),
              },
              {
                path: 'checklist',
                element: (
                  <Lazy>
                    <DailyChecklistPage />
                  </Lazy>
                ),
              },
              {
                path: 'notifications',
                element: (
                  <Lazy>
                    <EmployeeNotificationsPage />
                  </Lazy>
                ),
              },
            ],
          },
        ],
      },
    ],
  },
  { path: '*', element: <NotFoundPage /> },
    ],
  },
])
