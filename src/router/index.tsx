import type { ReactNode } from 'react'
import { Navigate, createBrowserRouter } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import LoginPage from '@/pages/LoginPage'
import AdminLayout from '@/components/layout/AdminLayout'
import DashboardPage from '@/pages/admin/DashboardPage'
import CoursesPage from '@/pages/admin/CoursesPage'
import GroupsPage from '@/pages/admin/GroupsPage'
import GroupDetailPage from '@/pages/admin/GroupDetailPage'
import TeachersPage from '@/pages/admin/TeachersPage'
import StudentsPage from '@/pages/admin/StudentsPage'

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return <div className="flex min-h-screen items-center justify-center bg-surface">Yüklənir...</div>
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (user.role !== 'admin') {
    return <Navigate to={`/${user.role}/dashboard`} replace />
  }

  return children
}

export const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  {
    path: '/admin',
    element: (
      // <ProtectedRoute>
        <AdminLayout />
      // </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="dashboard" replace /> },
      { path: 'dashboard', element: <DashboardPage /> },
      { path: 'courses', element: <CoursesPage /> },
      { path: 'groups', element: <GroupsPage /> },
      { path: 'groups/:id', element: <GroupDetailPage /> },
      { path: 'teachers', element: <TeachersPage /> },
      { path: 'students', element: <StudentsPage /> },
    ],
  },
  { path: '*', element: <Navigate to="/login" replace /> },
])
