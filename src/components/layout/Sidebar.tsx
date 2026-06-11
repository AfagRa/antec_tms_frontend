import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Table2,
  BookOpen,
  CalendarCheck,
  PenLine,
  Upload,
  BarChart2,
  UserCircle,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { ROUTES } from '../../constants/routes';

interface NavItem {
  icon: LucideIcon;
  label: string;
  route: string;
}

const navItems: NavItem[] = [
  { icon: LayoutDashboard, label: 'Dashboard',         route: ROUTES.TEACHER_DASHBOARD },
  { icon: Users,           label: 'Mənim Qruplarım',   route: ROUTES.TEACHER_GROUPS },
  { icon: Table2,          label: 'Jurnal',             route: ROUTES.TEACHER_JOURNAL },
  { icon: BookOpen,        label: 'Dərs Yarat',         route: ROUTES.TEACHER_LESSON_CREATE },
  { icon: CalendarCheck,   label: 'Davamiyyət',         route: ROUTES.TEACHER_ATTENDANCE_HOME },
  { icon: PenLine,         label: 'Qiymətləndirmə',     route: ROUTES.TEACHER_GRADES_HOME },
  { icon: Upload,          label: 'Material Əlavə Et', route: ROUTES.TEACHER_MATERIAL },
];

const utilityItems: NavItem[] = [
  { icon: BarChart2,  label: 'Hesabatlar', route: ROUTES.TEACHER_REPORTS },
  { icon: UserCircle, label: 'Profilim',   route: ROUTES.TEACHER_PROFILE },
];

export default function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 z-20 flex h-full w-[260px] flex-col border-r border-surface-dark/20 bg-surface shadow-neu-lg">
      <div className="flex h-[64px] items-center gap-3 border-b border-surface-dark/20 px-4">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="shrink-0 text-primary"
          aria-hidden="true"
        >
          <path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z" />
          <path d="M22 10v6" />
          <path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5" />
        </svg>
        <div className="min-w-0">
          <p className="text-[13px] font-bold leading-tight text-text-base">Tədris Mərkəzi</p>
          <p className="text-[11px] leading-tight text-text-base/50">İdarəetmə Sistemi</p>
        </div>
      </div>

      <nav className="flex flex-col gap-1 px-3 py-4">
        {navItems.map((item) => (
          <NavLink
            key={item.route}
            to={item.route}
            end
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-neu px-4 py-2.5 text-sm font-bold tracking-wide transition-all duration-150 focus-visible:ring-2 focus-visible:ring-primary ${
                isActive
                  ? 'bg-primary text-white shadow-neu-sm'
                  : 'text-text-base/60 hover:text-text-base hover:shadow-neu-sm'
              }`
            }
          >
            <item.icon size={18} strokeWidth={1.5} />
            <span>{item.label}</span>
          </NavLink>
        ))}

        <div className="mx-3 my-2 h-px bg-lms-border" />

        {utilityItems.map((item) => (
          <NavLink
            key={item.route}
            to={item.route}
            end
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-neu px-4 py-2.5 text-sm font-bold tracking-wide transition-all duration-150 focus-visible:ring-2 focus-visible:ring-primary ${
                isActive
                  ? 'bg-primary text-white shadow-neu-sm'
                  : 'text-text-base/60 hover:text-text-base hover:shadow-neu-sm'
              }`
            }
          >
            <item.icon size={18} strokeWidth={1.5} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
