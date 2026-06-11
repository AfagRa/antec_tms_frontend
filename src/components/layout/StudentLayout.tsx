import { Outlet } from 'react-router-dom';
import StudentSidebar from './StudentSidebar';
import StudentHeader from './StudentHeader';

export default function StudentLayout() {
  return (
    <div className="flex h-screen overflow-hidden bg-lms-student-bg">
      <StudentSidebar />
      <div className="ml-[260px] flex flex-1 flex-col min-w-0">
        <StudentHeader />
        <main className="flex-1 overflow-y-auto bg-lms-student-bg p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
