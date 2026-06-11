import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

export default function AppLayout() {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex flex-1 flex-col min-w-0 ml-[260px]">
        <Header />
        <main className="flex-1 overflow-y-auto bg-surface-light p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
