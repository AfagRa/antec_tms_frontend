import { Outlet } from 'react-router-dom';
import StudentSidebar from './StudentSidebar';
import StudentHeader from './StudentHeader';

export default function StudentLayout() {
  return (
    <div className="flex h-screen overflow-hidden bg-surface text-text-base">
      <StudentSidebar />
      <div className="flex flex-1 flex-col min-w-0">
        <StudentHeader />
        <main className="flex-1 overflow-y-auto p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
