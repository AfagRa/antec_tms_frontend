import type { ReactNode } from "react";
import { Navigate, createBrowserRouter } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import LoginPage from "@/pages/LoginPage";
import AdminLayout from "@/components/layout/AdminLayout";
import AdminDashboard from "@/pages/admin/DashboardPage";
import CourseDetailPage from "@/pages/admin/CourseDetailPage";
import CoursesPage from "@/pages/admin/CoursesPage";
import GroupsPage from "@/pages/admin/GroupsPage";
import GroupDetailPage from "@/pages/admin/GroupDetailPage";
import TeachersPage from "@/pages/admin/TeachersPage";
import StudentsPage from "@/pages/admin/StudentsPage";
import AppLayout from "@/components/layout/AppLayout";
import TeacherDashboard from "@/pages/teacher/Dashboard";
import Groups from "@/pages/teacher/Groups";
import GroupDetail from "@/pages/teacher/GroupDetail";
import LessonCreate from "@/pages/LessonCreate";
import Attendance from "@/pages/teacher/Attendance";
import Grades from "@/pages/Grades";
import MaterialUpload from "@/pages/teacher/MaterialUpload";
import Reports from "@/pages/Reports";
import Profile from "@/pages/Profile";
import { ROUTES } from "@/constants/routes";

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface">
        Yüklənir...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== "admin") {
    return <Navigate to={`/${user.role}/dashboard`} replace />;
  }

  return children;
}

export const router = createBrowserRouter([
  { path: "/login", element: <LoginPage /> },

  {
    path: "/admin",
    element: (
      <ProtectedRoute>
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="dashboard" replace /> },
      { path: "dashboard", element: <AdminDashboard /> },
      { path: "courses", element: <CoursesPage /> },
      { path: "courses/:id", element: <CourseDetailPage /> },
      { path: "groups", element: <GroupsPage /> },
      { path: "groups/:id", element: <GroupDetailPage /> },
      { path: "teachers", element: <TeachersPage /> },
      { path: "students", element: <StudentsPage /> },
    ],
  },

  {
    path: "/teacher",
    element: <AppLayout />,
    children: [
      { path: "dashboard", element: <TeacherDashboard /> },
      { path: "groups", element: <Groups /> },
      { path: "groups/:id", element: <GroupDetail /> },
      { path: "lessons/create", element: <LessonCreate /> },
      { path: "lessons/:id/attendance", element: <Attendance /> },
      { path: "lessons/:id/grades", element: <Grades /> },
      { path: "materials/add", element: <MaterialUpload /> },
      { path: "reports", element: <Reports /> },
      { path: "profile", element: <Profile /> },
    ],
  },

  {
    path: "/",
    element: <Navigate to={ROUTES.TEACHER_DASHBOARD} replace />,
  },

  { path: "*", element: <Navigate to="/login" replace /> },
]);
