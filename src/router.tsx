import { createBrowserRouter, Navigate } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import { ROUTES } from './constants/routes';
import Dashboard from './pages/teacher/Dashboard';
import Groups from './pages/teacher/Groups';
import GroupDetail from './pages/teacher/GroupDetail';
import Attendance from './pages/teacher/Attendance';
import MaterialUpload from './pages/teacher/MaterialUpload';
import LessonCreate from './pages/LessonCreate';
import Grades from './pages/Grades';
import Reports from './pages/Reports';
import Profile from './pages/Profile';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to={ROUTES.TEACHER_DASHBOARD} replace />,
  },
  {
    path: '/teacher',
    element: <AppLayout />,
    children: [
      { path: 'dashboard', element: <Dashboard /> },
      { path: 'groups', element: <Groups /> },
      { path: 'groups/:id', element: <GroupDetail /> },
      { path: 'lessons/create', element: <LessonCreate /> },
      { path: 'lessons/:id/attendance', element: <Attendance /> },
      { path: 'lessons/:id/grades', element: <Grades /> },
      { path: 'materials/add', element: <MaterialUpload /> },
      { path: 'reports', element: <Reports /> },
      { path: 'profile', element: <Profile /> },
    ],
  },
]);
