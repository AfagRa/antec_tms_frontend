import { Outlet } from 'react-router-dom';
import StudentSidebar from './StudentSidebar';
import StudentHeader from './StudentHeader';

export default function StudentLayout() {
  return (
    <div className="flex min-h-screen bg-lms-student-bg">
      <StudentSidebar />
      <div className="ml-[260px] flex flex-1 flex-col">
        <StudentHeader />
        <main className="flex-1 overflow-y-auto bg-lms-student-bg p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
